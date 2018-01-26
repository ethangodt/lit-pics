const { sid, token }= require('../config').twilio
const twilio = require('twilio')(sid, token)

module.exports.sendMessage = async function sendMessage(number, { body, mediaUrl }) {
    return twilio.messages.create(
        {
            to: number,
            from: TWILIO_NUMBER,
            body,
            mediaUrl,
        }
    )
}
