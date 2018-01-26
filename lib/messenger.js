const { sid, token }= require('../config').twilio
const client = require('twilio')(sid, token)

module.exports.sendMessage = async function sendMessage(number, { body, mediaUrl }) {
    return client.messages.create(
        {
            to: number,
            from: TWILIO_NUMBER,
            body,
            mediaUrl,
        }
    )
}
