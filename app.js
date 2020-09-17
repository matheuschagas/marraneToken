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

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/device', deviceRouter);
app.use('/transaction', transactionRouter);

module.exports = app;
