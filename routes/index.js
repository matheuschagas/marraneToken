const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const Terminal = require('../models/Terminal');



router.post('/terminal', async function (req, res, next) {
    try {
        const {type, UUID, deviceID} = req.body.deviceInfo;
        if (!!type && !!UUID && !!deviceID) {
            //region Save Terminal
            let result = await Terminal.findOne({UUID});
            if (!!!result) {
                let terminal = new Terminal({type, UUID, deviceID});
                await terminal.save();
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
