const TransactionStatus = require("../enums/transaction").TransactionStatus;

const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const Mongo = require('mongodb');
const HOTP = require('hotp');

const calculateOTP = (deviceToken) => {
    return HOTP.totp(deviceToken, {digits: 6, time: Date.now() / 1000, timeStep: 24})
}

router.post('/', async function (req, res, next) {
    try {
        const {type, partner, identifier, notificationURL, lifetime, document, attempts} = req.body;
        if (!!type && !!partner && !!identifier && !!document) {
            const client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
            const db = client.db(process.env.MONGO_DB);
            const createdAt = new Date();
            let transaction = await db.collection('transactions').insertOne({
                status: TransactionStatus.PENDING,
                type,
                identifier,
                partner,
                notificationURL,
                createdAt: createdAt.toISOString(),
                updatedAt: createdAt.toISOString(),
                lifetime: lifetime ? parseInt(lifetime) : parseInt(process.env.DEFAULT_TRANSACTION_LIFETIME),
                document,
                attempts: attempts ? parseInt(attempts) : parseInt(process.env.ATTEMPTS)
            })
            res.status(200).send({transactionId: transaction.insertedId});
        } else {
            throw new Error('Requisição no formato incorreto');
        }
    } catch (e) {
        console.log(e);
        res.status(400).send('Bad Request')
    }
});

router.delete('/:transactionId', async function (req, res, next) {
    try {
        const {transactionId} = req.params;
        const {document} = req.body;
        if (!!document) {
            const client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
            const db = client.db(process.env.MONGO_DB);
            const updatedAt = new Date();
            await db.collection('transactions').updateOne({document, _id: Mongo.ObjectId(transactionId)}, {
                $set: {status: TransactionStatus.CANCELLED, updatedAt: updatedAt.toISOString()}
            })
            res.status(200).send({});
        } else {
            throw new Error('Requisição no formato incorreto');
        }
    } catch (e) {
        console.log(e);
        res.status(400).send('Bad Request')
    }
});

router.get('/:transactionId', async function (req, res, next) {
    try {
        const {transactionId} = req.params;
        const {document} = req.headers;
        if (!!document) {
            const client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
            const db = client.db(process.env.MONGO_DB);
            let transaction = await db.collection('transactions').findOne({
                document,
                _id: Mongo.ObjectId(transactionId)
            });
            if (transaction) {
                res.status(200).send(transaction);
            } else {
                throw new Error('Transação não encontrada');
            }
        } else {
            throw new Error('Requisição no formato incorreto');
        }
    } catch (e) {
        console.log(e);
        res.status(400).send('Bad Request')
    }
});

router.post('/:transactionId/authorize', async function (req, res, next) {
    try {
        const {transactionId} = req.params;
        const {document, deviceInfo, deviceKey, otp} = req.body;

        const client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
        const db = client.db(process.env.MONGO_DB);
        const transaction = await db.collection('transactions').findOne({_id: Mongo.ObjectId(transactionId), document});
        if (!!transaction && transaction.status === TransactionStatus.PENDING) {
            const terminal = await db.collection('terminals').findOne({document: transaction.document});
            if (!!terminal) {
                const terminalToken = CryptoJS.HmacSHA512(terminal.type + terminal.UUID + terminal.deviceID, process.env.SERVER_SALT);
                const deviceToken = CryptoJS.HmacSHA512(terminalToken.toString() + terminal.document + terminal.linkedAt, process.env.SERVER_SALT);
                if (deviceInfo.deviceID === terminal.deviceID && deviceInfo.UUID === terminal.UUID && deviceInfo.type === terminal.type && deviceToken.toString() === deviceKey) {
                    if (otp === calculateOTP(deviceToken)) {
                        const updatedAt = new Date();
                        await db.collection('transactions').updateOne({_id: Mongo.ObjectId(transactionId)}, {
                            $set: {
                                status: TransactionStatus.APPROVED,
                                updatedAt: updatedAt.toISOString()
                            }
                        })
                        if (!!transaction.notificationURL) {
                            axios.post(transaction.notificationURL, {
                                ...transaction,
                                status: TransactionStatus.APPROVED,
                                updatedAt: updatedAt.toISOString()
                            });
                        }
                        //TODO publicar no socket a aprovação
                    } else {
                        if(transaction.attempts <= 1) {
                            //Block token?
                            db.collection('transactions').updateOne({_id: Mongo.ObjectId(transactionId)}, {$set:{status: TransactionStatus.FAILED}})
                        } else {
                            db.collection('transactions').updateOne({_id: Mongo.ObjectId(transactionId)}, {$set:{attempts: transaction.attempts - 1}})
                        }
                        throw new Error(`OTP inválido, tentativas restantes: ${transaction.attempts - 1}`);
                    }
                } else {
                    throw new Error('Terminal inválido');
                }
            } else {
                throw new Error('Terminal não encontrado');
            }
        } else {
            throw new Error('Transação não encontrada');
        }
    } catch (e) {
        console.log(e);
        res.status(400).send('Bad Request')
    }
});

router.post('/:transactionId/deny', async function (req, res, next) {

});

module.exports = router;
