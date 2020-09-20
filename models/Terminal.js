const mongoose = require('mongoose');
const TerminalSchema = require('../schemas/terminal');

module.exports = mongoose.model('Terminal',TerminalSchema, "terminals");
