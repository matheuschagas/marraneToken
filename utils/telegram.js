if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const axios = require('axios');

class Telegram {
    static async sendMessage(message, channel) {
        try{
            await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: process.env.TELEGRAM_CHANNEL,
                text: message
            })
        }catch (e) {
            console.log(e.response.data);
        }
    }
}


module.exports = Telegram;
