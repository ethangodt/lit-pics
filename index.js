// TODO figure out how to make this just a lambda function or something, so I don't need a server...
const express = require("express");
const morgan = require("morgan");
const { wrap } = require("./middleware");
const app = express();
const parser = require("body-parser");
const CronJob = require("cron").CronJob;
const { alertTime, followUpTime, timezone } = require("./config").preferences;
const { participants, port } = require("./config");
const { deleteImage, sendMessage } = require("./lib/messenger");
const { content } = require("./content");

app.use(parser.urlencoded({ extended: false }));

// TODO put participant logic in other file
// TODO add code to store new current participant on .env file in case app crashes (make it a docker volume)
let currentParticipant = participants[0];

function getNextParticipant() {
  return participants.find(p => p.name !== currentParticipant.name);
}

let lastParticipantNotified = "";
let dateLastCleaned = "";
new CronJob(
  alertTime,
  async () => {
    if (dateLastCleaned === getSerializedDate()) {
      console.log(`skipping cron message`);
      return;
    }
    console.log(`cron task firing at ${new Date()}`);
    let alreadyNotified = lastParticipantNotified === currentParticipant.name;
    await sendMessage(currentParticipant.number, {
      body: content("EVENING_ALERT", { intense: alreadyNotified }),
      includeCatGif: true
    });
    // note: this steal stuff is too noisy
    // if (alreadyNotified) {
    //   await sendMessage(getNextParticipant().number, {
    //     body: content("EVENING_STEAL")
    //   });
    // }
    lastParticipantNotified = currentParticipant.name;
  },
  null,
  true,
  timezone
);

new CronJob(
  followUpTime,
  async () => {
    if (dateLastCleaned === getSerializedDate()) { // frankly I don't understand why this is important looking at it months later
      console.log(`skipping cron message`);
      return;
    }
    console.log(`cron task firing at ${new Date()}`);
    let shouldFollowUp = lastParticipantNotified === currentParticipant.name;
    if (shouldFollowUp) {
      await sendMessage(currentParticipant.number, {
        body: content("FOLLOW_UP_ALERT")
      });
    }
  },
  null,
  true,
  timezone
);

app.use(morgan("tiny"));

app.get(
  "/ping",
  wrap(async (req, res) => {
    return res.send("pong");
  })
);

app.post(
  "/incoming",
  wrap(async (req, res) => {
    const { MediaUrl0 = "", Body = "", From, MessageSid } = req.body;
    const splitUrl = MediaUrl0.split("/");
    const MediaSid = splitUrl.find(string => string.startsWith("ME"));
    const isImage = !!MediaUrl0;
    const isConfirmation = Body.trim().toLowerCase() === "ok";
    const isSkip = Body.trim().toLowerCase() === "skip";
    const isReset = Body.trim().toLowerCase() === "reset";
    const isStatus = Body.trim().toLowerCase() === "status";
    const isHow = Body.trim().toLowerCase() === "how";
    // TODO add some pause logic for vacation (by Ndays or indefinite)

    if (isImage) {
      const isStealing = From === getNextParticipant().number;
      const reviewer = isStealing ? currentParticipant : getNextParticipant()
      await sendMessage(reviewer.number, {
        body: content("APPROVAL_PROMPT", { intense: isStealing }), // TODO use 'alternate' or something — intense doesn't make sense
        mediaUrl: MediaUrl0
      });
      await sendMessage(From, { body: content("PIC_SENT", { intense: isStealing }) });
      await setTimeout(
        async () => await deleteImage(MessageSid, MediaSid),
        10000
      );
      dateLastCleaned = getSerializedDate(); // not sure if this is best here, but when saved on confirmation Em forgot to "ok" so I got messages the after cleaning which was annoying
    }
    if (isConfirmation) {
      const isStealing = From === currentParticipant.number; // if confirmation is from current person it's been stolen
      const cleaner = isStealing ? getNextParticipant() : currentParticipant
      const reviewer = isStealing ? currentParticipant : getNextParticipant()
      await sendMessage(From, {
        body: `Thx. Now it's ${
          From === currentParticipant.number
            ? "your"
            : `${getNextParticipant().name}'s`
        } turn!`,
        includeCatGif: true
      });
      if (isStealing) {
        await setTimeout(async () => await sendMessage(From, {
          body: `Since the job was stolen you must pay your dues at ${cleaner.paypalme}.\n\nIt's an honor system, but watch out if you plan to skip your payments, the cat's will get you in your sleep.`,
        }), 15000);
      }
      await sendMessage(cleaner.number, {
        body: content("PIC_APPROVED")
      });
      currentParticipant = reviewer;
      lastParticipantNotified = ""
    }
    if (isSkip) {
      const lastRecipient = currentParticipant;
      currentParticipant = getNextParticipant();
      await sendMessage(From, {
        body: `${lastRecipient.name} was up. Now it's ${
          currentParticipant.name
        }.`
      });
    }
    if (isReset) {
      lastParticipantNotified = "";
      dateLastCleaned = "";
      await sendMessage(From, {
        body: `Everything has been reset, and ${
          currentParticipant.name
        } is currently up.`
      });
    }
    if (isStatus) {
      await sendMessage(From, {
        body: `Current: ${
          currentParticipant.name
        }\nDate Last Cleaned: ${dateLastCleaned ||
          "n/a"}\nLast One Notified: ${lastParticipantNotified || "n/a"}`
      });
    }
    if (isHow) {
      await sendMessage(From, {
        body: `image: you just cleaned\n"ok": to approve a message\n"skip": set to next participant\n"reset": resets message state\n"status": log state`
      });
    }

    return res.status(204).end();
  })
);

app.use(async (err, req, res, next) => {
  const { body: { From } = {} } = req;
  console.error(err);
  if (From) {
    await sendMessage(From, { body: content("ERROR") });
  }
  return res.status(204).end();
});

app.listen(port, () => {
  console.log(`app listening on ${port}`);
});

function getSerializedDate() {
  const date = new Date();
  return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
}
