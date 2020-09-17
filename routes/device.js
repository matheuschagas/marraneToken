const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const Mongo = require('mongodb');

/* GET home page. */
router.post('/link', async function(req, res, next) {
    try{
        const {deviceInfo, terminalKey, document} = req.body;
        if(!!deviceInfo && !!terminalKey && !!document) {
            const terminalToken = CryptoJS.HmacSHA512(deviceInfo.type+deviceInfo.UUID+deviceInfo.deviceID, process.env.SERVER_SALT);
            if(terminalToken.toString() === terminalKey) {
                //region Save Terminal
                const client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
                const db = client.db(process.env.MONGO_DB);
                const linkedAt = new Date();
                let terminal = await db.collection('terminals').findOne({UUID:deviceInfo.UUID});
                if(!!terminal && !!terminal.document) {
                    throw new Error('Device já vinculado');
                } else if(!!terminal) {
                    await db.collection('terminals').updateOne({_id:terminal._id}, {$set:{document, updatedAt: linkedAt.toISOString(), linkedAt: linkedAt.toISOString()}});
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
