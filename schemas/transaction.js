const mongoose = require('mongoose');
const {TransactionStatus} = require('../enums/transaction');
const { Schema } = mongoose;
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const terminalSchema = new Schema({
    status:  {type: String, required: true, default: TransactionStatus.PENDING},
    type: {type: String, required: true},
    identifier: {type: String, required: true},
    partner: {type: String, required: true},
    document: {type: String, required: true},
    notificationURL: String,
    lifetime: {type: Number, required: true, default: process.env.DEFAULT_TRANSACTION_LIFETIME},
    attempts: {type: Number, required: true, default: process.env.ATTEMPTS},
}, { timestamps: true });

module.exports = terminalSchema;
