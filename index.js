// TODO figure out how to make this just a lambda function or something, so I don't need a server...

const express = require('express')
const morgan = require('morgan')
const { wrap } = require('./middleware')
const app = express()
const parser = require('body-parser')
const CronJob = require('cron').CronJob
const { alertTime, followUpTime, timezone } = require('./config').preferences
const { participants, port } = require('./config')
const { deleteImage, sendMessage } = require('./lib/messenger')
const { content } = require('./content')

app.use(parser.urlencoded({ extended: false }))

// TODO put participant logic in other file
// TODO add code to store new current participant on .env file in case app crashes (make it a docker volume)
let currentParticipant = participants[0]

function getNextParticipant() {
    return participants.find((p) => p.name !== currentParticipant.name)
}

let lastParticipantNotified = ''
let dateLastCleaned = ''
new CronJob(alertTime, async () => {
    if (dateLastCleaned === generateCheckableDate()) {
      console.log(`skipping cron message`)
      return
    }
    console.log(`cron task firing at ${new Date()}`)
    let alreadyNotified = lastParticipantNotified === currentParticipant.name
    await sendMessage(
        currentParticipant.number,
        {
            body: content('EVENING_ALERT', { intense: alreadyNotified }),
            includeCatGif: true,
        }
    )
    lastParticipantNotified = currentParticipant.name
}, null, true, timezone)

new CronJob(followUpTime, async () => {
  if (dateLastCleaned === generateCheckableDate()) {
    console.log(`skipping cron message`)
    return
  }
  console.log(`cron task firing at ${new Date()}`)
  let shouldFollowUp = lastParticipantNotified === currentParticipant.name
  if (shouldFollowUp) {
    await sendMessage(
        currentParticipant.number,
        {
          body: content('FOLLOW_UP_ALERT'),
        }
    )
  }
}, null, true, timezone)

app.use(morgan('tiny'))

app.get('/ping', wrap(async (req, res) => {
    return res.send('pong')
}))

app.post('/incoming', wrap(async (req, res) => {
    const { MediaUrl0 = '', Body = '', From, MessageSid } = req.body
    const splitUrl = MediaUrl0.split('/')
    const MediaSid = splitUrl.find((string) => string.startsWith('ME'))
    const isImage = !!MediaUrl0
    const isConfirmation = From === getNextParticipant().number && Body.toLowerCase() === 'ok'
    const isSkip = Body.toLowerCase() === 'skip'

    if(isSkip){
        currentParticipant = getNextParticipant()
    }
    if (isImage) {
        await sendMessage(getNextParticipant().number, { body: content('APPROVAL_PROMPT'), mediaUrl: MediaUrl0 })
        await sendMessage(From, { body: content('PIC_SENT') })
        await setTimeout(async () => await deleteImage(MessageSid, MediaSid), 10000)
    }
    if (isConfirmation) {
        const prevParticipant = currentParticipant
        currentParticipant = getNextParticipant()
        await sendMessage(From, { body: `Thx. Now it's ${From === currentParticipant.number ? 'your' : `${currentParticipant.name}'s`} turn!`, includeCatGif: true })
        await sendMessage(prevParticipant.number, { body: content('PIC_APPROVED') })
        dateLastCleaned = generateCheckableDate()
    }

    return res.status(204).end()
}))

app.use(async (err, req, res, next) => {
    const { body: { From } = {} } = req
    console.error(err)
    if (From) {
      await sendMessage(From, { body: content('ERROR') })
    }
    return res.status(204).end()
})

app.listen(port, () => {
    console.log(`app listening on ${port}`)
})

function generateCheckableDate() {
  const date = new Date()
  return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`

}
