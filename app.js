const express = require('express');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const deviceRouter = require('./routes/device');
const transactionRouter = require('./routes/transaction');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_STRING, {useNewUrlParser: true});


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/device', deviceRouter);
app.use('/transaction', transactionRouter);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    app.locals.db = db;
});

const io = require('socket.io-client');

const socket = io(`${process.env.SOCKET_URL}`);

socket.on('connect', () => {
    app.locals.socket = socket;
    socket.on('message', (message)=>{
        console.log(message);
    })
});

module.exports = app;
