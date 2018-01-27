const { accountSid, authToken, number: twilioNumber }= require('../config').twilio
const client = require('twilio')(accountSid, authToken)

module.exports.deleteImage = async function deleteImage(messageSid, mediaSid) {
    return client.messages(messageSid).media(mediaSid)
        .remove()
        .then(() => {
            console.log(`Sid ${mediaSid} deleted successfully.`);
        })
        .catch((err) => console.log(err));
}

module.exports.sendMessage = async function sendMessage(number, { body, mediaUrl }) {
    return client.messages.create(
        {
            to: number,
            from: twilioNumber,
            body,
            mediaUrl,
        }
    )
}
