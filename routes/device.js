const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const Terminal = require('../models/Terminal');

/* GET home page. */
router.post('/link', async function(req, res, next) {
    try{
        const {deviceInfo, terminalKey, document} = req.body;
        if(!!deviceInfo && !!terminalKey && !!document) {
            const terminalToken = CryptoJS.HmacSHA512(deviceInfo.type+deviceInfo.UUID+deviceInfo.deviceID, process.env.SERVER_SALT);
            if(terminalToken.toString() === terminalKey) {
                //region Save Terminal
                const linkedAt = new Date();
                let terminal = await Terminal.findOne({UUID:deviceInfo.UUID});
                if(!!terminal && !!terminal.document) {
                    throw new Error('Device já vinculado');
                } else if(!!terminal) {
                    terminal.document = document;
                    terminal.linkedAt = linkedAt;
                    await terminal.save();
                }else {
                    throw new Error('Device Inexistente');
                }
                //endregion
                //region Create deviceToken
                const deviceToken = CryptoJS.HmacSHA512(terminalKey+document+linkedAt.toISOString(), process.env.SERVER_SALT);
                //endregion
                res.json({deviceToken: deviceToken.toString()});
            } else {
                throw new Error('Chave de terminal inválida');
            }
        }else {
            throw new Error('Requisição no formato incorreto');
        }
    }catch (e) {
        console.log(e);
        res.status(400).send('Bad Request')
    }
});

module.exports = router;
