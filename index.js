// TODO figure out how to make this just a lambda function or something, so I don't need a server...
// TODO any error handling whatsoever

require('dotenv').config()

const { PORT, INITIAL_PARTICIPANT } = process.env
const express = require('express')
const app = express()
const participants = require('./participants')
const { sendMessage } = require('./lib/messenger')
const parser = require('body-parser')
const CronJob = require('cron').CronJob

// TODO put participant logic in other file
// TODO add code to store new current participant on .env file in case app crashes (make it a docker volume)
let currentParticipant = participants.find((p) => p.name === INITIAL_PARTICIPANT) || participants[0]

function getNextParticipant() {
    return participants.find((p) => p.name !== currentParticipant.name)
}

new CronJob('0 19 * * *', async function () {
    // TODO add something in here so the next participant gets messaged if someone skips cleaning - naughty naughty
    console.log('cron task firing')
    await sendMessage(
        currentParticipant.number,
        {
            body: `It's your night to clean the hissers' pissers. Respond with a picture of a clean cat camode.`,
        }
    )
}, null, true, 'America/Los_Angeles');

app.use(parser.urlencoded({ extended: false }))

app.get('/ping', (req, res) => {
    res.send('pong')
})

app.post('/incoming', async (req, res) => {
    const { MediaUrl0 = '', Body = '', From } = req.body
    const isImage = !!MediaUrl0
    const isConfirmation = From === getNextParticipant().number && Body.toLowerCase() === 'ok'
    if (isImage) {
        await sendMessage(getNextParticipant().number, { body: 'Does this litter look fit for a critter? If so, respond with "ok".', mediaUrl: MediaUrl0 })
        // TODO add some confirmation back to sender that image was received
    }
    if (isConfirmation) {
        currentParticipant = getNextParticipant()
        await sendMessage(From, { body: `Thx. It's now ${currentParticipant.name}'s turn!` })
    }
    return res.status(200).end()
})

app.listen(PORT, () => {
    console.log(`app listening on ${PORT}`)
})