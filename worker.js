const Mongo = require('mongodb');
const TransactionStatus = require("./enums/transaction").TransactionStatus;
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const io = require('socket.io-client');

const socket = io(`${process.env.SOCKET_URL}`);

socket.on('connect', () => {
    socket.on('message', (message)=>{
        console.log(message);
    })
});

const amqp = require('amqplib/callback_api');

const worker = async () => {
    try {
        let client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
        let db = client.db(process.env.MONGO_DB);
            try {
                amqp.connect(process.env.RABBITMQ_SERVER, function (error0, connection) {
                    if (error0) {
                        throw error0;
                    }
                    connection.createChannel(function (error1, channel) {
                        if (error1) {
                            throw error1;
                        }
                        const queue = 'marranetoken';
                        channel.consume(queue, async function(msg) {
                            const secs = msg.content.toString().split('.').length - 1;
                            let now = new Date();
                            console.log(" [x] Received %s", msg.content.toString());
                            await db.collection('transactions').updateOne({_id: Mongo.ObjectId(msg.content.toString())}, {
                                $set: {
                                    status: TransactionStatus.EXPIRED,
                                    updatedAt: now.toISOString()
                                }
                            });
                            socket.send({type: 'transaction', id: msg.content.toString(), status: TransactionStatus.EXPIRED})
                            setTimeout(function() {
                                console.log(" [x] Done");
                            }, secs * 1000);
                        }, {
                            // automatic acknowledgment mode,
                            // see https://www.rabbitmq.com/confirms.html for details
                            noAck: true
                        });
                    });
                });

            } catch (e) {
                //TODO avisar telegram
                console.log(e);
                client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
                db = client.db(process.env.MONGO_DB);
            }
    } catch (e) {
        console.log(e);
    }
}

worker();

