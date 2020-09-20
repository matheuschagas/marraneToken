const Telegram = require("../utils/telegram");

const TransactionStatus = require("../enums/transaction").TransactionStatus;
const TransactionErrors = require("../enums/transaction").TransactionErrors;

const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const HOTP = require('hotp');
const Transaction = require('../models/Transaction');
const Terminal = require('../models/Terminal');

const calculateOTP = (deviceToken) => {
    return HOTP.totp(deviceToken, {digits: 6, time: Date.now() / 1000, timeStep: 24})
}


router.post('/', async function (req, res, next) {
    try {
        const socket = req.app.locals.socket;
        const {type, partner, identifier, notificationURL, lifetime, document, attempts} = req.body;
        if (!!type && !!partner && !!identifier && !!document) {
            let terminal = await Terminal.findOne({document});
            if(!!terminal) {
                let transaction = new Transaction({
                    type,
                    identifier,
                    partner,
                    notificationURL,
                    lifetime,
                    document,
                    attempts
                });
                await transaction.save();
                socket.send({type: 'transaction', id: transaction._id, status: TransactionStatus.PENDING});
                res.status(200).send({transactionId: transaction._id});
            }else {
                throw new Error(TransactionErrors.TERMINAL_NOT_FOUND);
            }
        } else {
            throw new Error(TransactionErrors.INVALID_REQUEST);
        }
    } catch (e) {
        console.log(e);
        if (e.message === TransactionErrors.INVALID_REQUEST) {
            res.status(400).send({error: e.message});
        } else if(e.message === TransactionErrors.TERMINAL_NOT_FOUND){
            res.status(404).send({error: e.message});
        } else {
            res.status(500).send({error: TransactionErrors.UNEXPECTED_ERROR});
        }
    }
});

router.delete('/:transactionId', async function (req, res, next) {
    try {
        const {transactionId} = req.params;
        const {document} = req.body;

        if (!!document) {
            await Transaction.findOneAndDelete({document, _id: transactionId});
            res.status(200).send({});
        } else {
            throw new Error(TransactionErrors.INVALID_REQUEST);
        }
    } catch (e) {
        if (e.message === TransactionErrors.INVALID_REQUEST) {
            res.status(400).send(e.message);
        } else {
            res.status(500).send(TransactionErrors.UNEXPECTED_ERROR);
        }
    }
});

router.get('/:transactionId', async function (req, res, next) {
    try {
        const {transactionId} = req.params;
        const {document} = req.headers;

        if (!!document) {
            let transaction = await Transaction.find({
                document,
                _id: transactionId
            })
            if (transaction.length > 0) {
                res.status(200).send(transaction[0]);
            } else {
                throw new Error(TransactionErrors.TRANSACTION_NOT_FOUND);
            }
        } else {
            throw new Error(TransactionErrors.INVALID_REQUEST);
        }
    } catch (e) {
        switch (e.message) {
            case TransactionErrors.TRANSACTION_NOT_FOUND:
                res.status(404).send({error: e.message});
                break;
            case TransactionErrors.INVALID_REQUEST:
                res.status(400).send({error: e.message});
                break;
            default:
                res.status(500).send({error: TransactionErrors.UNEXPECTED_ERROR});
                break;
        }
    }
});

router.post('/:transactionId/authorize', async function (req, res, next) {
    try {
        const {transactionId} = req.params;
        const {document, deviceInfo, deviceKey, otp} = req.body;

        const transaction = await Transaction.findOne({_id: transactionId, document});
        if (!!transaction && transaction.status === TransactionStatus.PENDING) {
            const terminal = await Terminal.findOne({document: transaction.document});
            if (!!terminal) {
                const terminalToken = CryptoJS.HmacSHA512(terminal.type + terminal.UUID + terminal.deviceID, process.env.SERVER_SALT);
                const deviceToken = CryptoJS.HmacSHA512(terminalToken.toString() + terminal.document + terminal.linkedAt, process.env.SERVER_SALT);
                if (deviceInfo.deviceID === terminal.deviceID && deviceInfo.UUID === terminal.UUID && deviceInfo.type === terminal.type && deviceToken.toString() === deviceKey) {
                    if (otp === calculateOTP(deviceToken)) {
                        const updatedAt = new Date();
                        transaction.status = TransactionStatus.APPROVED;
                        await transaction.save();
                        if (!!transaction.notificationURL) {
                            axios.post(transaction.notificationURL, {
                                ...transaction
                            });
                        }
                        //TODO publicar no socket a aprovação
                    } else {
                        if (transaction.attempts <= 1) {
                            if (Boolean(process.env.BLOCK_TOKEN_AFTER_FAIL_TRANSACTION)) {
                                Telegram.sendMessage(`Usuário ${document} está com token bloqueado`, process.env.TELEGRAM_CHANNEL);
                            }
                            transaction.status =  TransactionStatus.FAILED;
                            await transaction.save();
                        } else {
                            transaction.attempts = transaction.attempts - 1;
                            await transaction.save();
                        }
                        throw new Error(TransactionErrors.INVALID_OTP);
                    }
                } else {
                    Telegram.sendMessage(`Usuário ${document} tentando transacionar com terminal inválido`, process.env.TELEGRAM_CHANNEL);
                    throw new Error(TransactionErrors.INVALID_TERMINAL);
                }
            } else {
                Telegram.sendMessage(`Usuário ${document} tentando transacionar com terminal inexistente`, process.env.TELEGRAM_CHANNEL);
                throw new Error(TransactionErrors.TERMINAL_NOT_FOUND);
            }
        } else {
            throw new Error(TransactionErrors.TRANSACTION_NOT_FOUND_OR_EXPIRED);
        }
    } catch (e) {
        switch (e.message) {
            case TransactionErrors.INVALID_OTP:
                res.status(401).send({error: e.message});
                break;
            case TransactionErrors.INVALID_TERMINAL:
                res.status(418).send({error: e.message});
                break;
            case TransactionErrors.TERMINAL_NOT_FOUND:
                res.status(404).send({error: e.message});
                break;
            case TransactionErrors.TRANSACTION_NOT_FOUND_OR_EXPIRED:
                res.status(410).send({error: e.message});
                break;
            default:
                res.status(500).send({error: TransactionErrors.UNEXPECTED_ERROR});
                break;
        }
    }
});

router.post('/:transactionId/deny', async function (req, res, next) {

});

module.exports = router;
