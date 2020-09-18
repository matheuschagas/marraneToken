const Mongo = require('mongodb');
const TransactionStatus = require("./enums/transaction").TransactionStatus;
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const amqp = require('amqplib/callback_api');

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

amqp.connect(process.env.RABBITMQ_SERVER, function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(async function (error1, channel) {
        if (error1) {
            throw error1;
        }
        const queue = 'marranetoken';

        channel.assertQueue(queue, {
            durable: true
        });
        let client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
        let db = client.db(process.env.MONGO_DB);

        while(true){
            const transactions = await db.collection('transactions').find({status: TransactionStatus.PENDING}).limit(1).toArray();
            if (transactions.length > 0) {
                const transaction = transactions[0];
                let createdAt = new Date(transaction.createdAt);
                let now = new Date();
                if (now.getTime() - createdAt.getTime() >= transaction.lifetime) {
                    await db.collection('transactions').updateOne({_id: Mongo.ObjectId(transaction._id)}, {
                        $set: {
                            status: TransactionStatus.EXPIRING
                        }
                    });
                    channel.sendToQueue(queue, Buffer.from(transaction._id.toString()), {
                        persistent: true
                    });
                    console.info(`transaction ${transaction._id} to worker.`);
                }
            } else {
                sleep(1000);
            }
        }
    });
});

