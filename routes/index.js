const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const Mongo = require('mongodb')


router.post('/terminal', async function (req, res, next) {
    try {
        const {type, UUID, deviceID} = req.body.deviceInfo;
        if (!!type && !!UUID && !!deviceID) {
            //region Save Terminal
            const client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
            const db = client.db(process.env.MONGO_DB);
            let result = await db.collection('terminals').findOne({UUID});
            if (!!!result) {
                await db.collection('terminals').insertOne({type, UUID, deviceID, createdAt: (new Date()).toISOString()})
            } else {
                throw new Error('Terminal já cadastrado');
            }
            //endregion
            //region Create terminalToken
            const terminalToken = CryptoJS.HmacSHA512(type + UUID + deviceID, process.env.SERVER_SALT);
            //endregion
            res.json({terminalToken: terminalToken.toString()});
        } else {
            throw new Error('Requisição no formato incorreto');
        }
    } catch (e) {
        console.log(e);
        res.status(400).send('Bad Request')
    }
});

module.exports = router;
