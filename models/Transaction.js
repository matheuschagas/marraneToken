const mongoose = require('mongoose');
const TransactionSchema = require('../schemas/transaction');

module.exports = mongoose.model('Transaction',TransactionSchema, "transactions");
