const Mongo = require('mongodb');
const TransactionStatus = require("./enums/transaction").TransactionStatus;
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const worker = async () => {
    try {
        console.log(process.env.MONGO_STRING)
        let client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
        let db = client.db(process.env.MONGO_DB);
        while (true) {
            try {
                const transactions = await db.collection('transactions').find({status: TransactionStatus.PENDING}).limit(1).toArray();
                if (transactions.length > 0) {
                    const transaction = transactions[0];
                    let createdAt = new Date(transaction.createdAt);
                    let now = new Date();
                    if (now.getTime() - createdAt.getTime() >= transaction.lifetime) {
                        console.info(`transaction ${transaction._id} expired.`);
                        await db.collection('transactions').updateOne({_id: Mongo.ObjectId(transaction._id)}, {$set: {status: TransactionStatus.EXPIRED, updatedAt: now.toISOString()}});
                    }
                }
            } catch (e) {
                console.log(e);
                client = await Mongo.MongoClient.connect(process.env.MONGO_STRING);
                db = client.db(process.env.MONGO_DB);
            }
        }
    } catch (e) {
        console.log(e);
    }
}

worker();

