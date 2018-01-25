const { TWILIO_ACCOUNT, TWILIO_NUMBER, TWILIO_TOKEN } = process.env
const client = require('twilio')(TWILIO_ACCOUNT, TWILIO_TOKEN)

module.exports.sendMessage = async function sendMessage(number, { body, mediaUrl }) {
    return client.messages.create(
        {
            to: number,
            from: TWILIO_NUMBER,
            body,
            mediaUrl
        }
    )
}
