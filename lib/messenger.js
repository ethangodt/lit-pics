const { accountSid, authToken }= require('../config').twilio
const client = require('twilio')(accountSid, authToken)

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
