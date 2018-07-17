/**
 * TODO actually make message selection random if you add more variations
 *
 * Note: the most intense message should always be at index 0.
 *
 * TODO everything about this could be better...
 */

const content = {
  EVENING_ALERT: {
    intense: [
      `It's been two days since the box has been cleaned. It's now open for a steal. If your buddy steals, you'll have to pay them $5`,
    ],
    normal: [
      `It's your night to clean the hissers' pissers. Respond with a picture of a clean cat camode.`
    ],
  },
  EVENING_STEAL: {
    intense: [
      ``,
    ],
    normal: [
      `It's been two days since the box has been cleaned. It's now open for a steal. If you steal your buddy will have to pay you $5`,
    ],
  },
  FOLLOW_UP_ALERT: {
    intense: [
      ``,
    ],
    normal: [
      `Howdy, looks like you didn't scoop the doop last night. Life is busy, but let's do it right for the kitty-babies.`,
    ],
  },
  APPROVAL_PROMPT: {
    intense: [
      `The job is being stolen by your buddy. Does this litter look fit for a critter? If so, respond with "ok".`,
    ],
    normal: [
      'Does this litter look fit for a critter? If so, respond with "ok".',
    ],
  },
  PIC_SENT: {
    intense: [
      ``,
    ],
    normal: [
      `Pic successfully sent. Your effort will not go unnoticed. *purr*`,
    ],
  },
  PIC_APPROVED: {
    intense: [
      ``,
    ],
    normal: [
      `You got the thumbs up on this beauty.`,
      `Your pic got the "ok". Now go collect that purr tax from the happy babbys`,
    ],
  },
  CONFIRMATION: {
    intense: [
      `It's been two days since the box has been cleaned. It's now open for a steal. If your buddy steals, you'll have to pay them $5`,
    ],
    normal: [
      `Thx. Now it's your turn`
    ],
  },
  ERROR: {
    intense: [
      ``,
    ],
    normal: [
      `Deeply saddened to report, but something didn\'t work quite right. There was a server error.`,
    ],
  },
}

module.exports.content = function (key, options = {}) {
  const { intense = false } = options
  const list = content[key][intense ? 'intense' : 'normal']
  const randomIdx = Math.floor(Math.random() * list.length)
  return list[randomIdx] || ''
}
