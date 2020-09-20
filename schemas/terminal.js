const mongoose = require('mongoose');

const { Schema } = mongoose;

const terminalSchema = new Schema({
    type:  {type: String, required: true},
    UUID: {type: String, required: true},
    deviceID: {type: String, required: true},
    document: String,
    linkedAt: Date,
}, { timestamps: true });

module.exports = terminalSchema;
