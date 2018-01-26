// TODO figure out how to make this just a lambda function or something, so I don't need a server...

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { wrap } = require('./middleware')
const app = express()
const parser = require('body-parser')
const CronJob = require('cron').CronJob
const { PORT, INITIAL_PARTICIPANT, TIMEZONE } = process.env
const participants = require('./participants')
const { sendMessage } = require('./lib/messenger')

app.use(parser.urlencoded({ extended: false }))

// TODO put participant logic in other file
// TODO add code to store new current participant on .env file in case app crashes (make it a docker volume)
let currentParticipant = participants.find((p) => p.name === INITIAL_PARTICIPANT) || participants[0]

function getNextParticipant() {
    return participants.find((p) => p.name !== currentParticipant.name)
}

new CronJob('0 19 * * *', async () => {
    // TODO add something in here so the next participant gets messaged if someone skips cleaning - naughty naughty.
    // TODO add more frequent messaging if someone skips
    console.log(`cron task firing at ${Date.now()}`)
    await sendMessage(
        currentParticipant.number,
        { body: `It's your night to clean the hissers' pissers. Respond with a picture of a clean cat camode.` }
    )
}, null, true, TIMEZONE)

app.use(morgan('tiny'))

app.get('/ping', wrap(async (req, res) => {
    return res.send('pong')
}))

app.post('/incoming', wrap(async (req, res) => {
    const { MediaUrl0 = '', Body = '', From } = req.body
    const isImage = !!MediaUrl0
    const isConfirmation = From === getNextParticipant().number && Body.toLowerCase() === 'ok'
    if (isImage) {
        await sendMessage(getNextParticipant().number, { body: 'Does this litter look fit for a critter? If so, respond with "ok".', mediaUrl: MediaUrl0 })
        await sendMessage(From, { body: 'Lit Pic sent successfully... Hopefully you did a good job :)' })
    }
    if (isConfirmation) {
        const prevParticipant = currentParticipant
        currentParticipant = getNextParticipant()
        await sendMessage(From, { body: `Thx. It's now ${currentParticipant.name}'s turn!` })
        await sendMessage(prevParticipant.number, { body: `You got the thumbs up on this beauty.` })
    }
    return res.status(200).end()
}))

app.use(async (err, req, res, next) => {
    const { body: { From } = {} } = req
    console.error(err)
    await sendMessage(From, { body: 'Deeply saddened to report: there was an error, and something didn\'t work quite right.' })
    return res.status(500).end()
})

app.listen(PORT, () => {
    console.log(`app listening on ${PORT}`)
})
