const axios = require('axios')
const { accountSid, authToken, number: twilioNumber } = require('../config').twilio
const client = require('twilio')(accountSid, authToken)

module.exports.deleteImage = function deleteImage(messageSid, mediaSid) {
    return client.messages(messageSid).media(mediaSid).remove()
}

module.exports.sendMessage = async function sendMessage(number, { body, mediaUrl, includeCatGif }) {
    let catGifUrl
    if (includeCatGif) {
        catGifUrl = await getCatGif()
    }
    return client.messages.create(
        {
            to: number,
            from: twilioNumber,
            body,
            mediaUrl: mediaUrl || catGifUrl || undefined
        }
    )
}

async function getCatGif() {
    let catGifUrl
    try {
        const response = await axios.get('http://thecatapi.com/api/images/get?type=gif', { maxRedirects: 0 })
    } catch (err) {
        catGifUrl = err.response.headers.location
    }
    return catGifUrl
}
