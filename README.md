# lit-pics
🐱 Simple app to make sure me and my girlfriend are cleaning the damn litter box.

### Setup
1. Create a `participants.json` file in app's root directory with participants, e.g.:
```
[
    {
        "name": "ethan",
        "number": "+15555555555" <-- this format is important!
    },
    {
        "name": "emilie",
        "number": "+15555555555" <-- this format is important!
    }
]
```
2. Create a `.env` file in app's root directory with these envs:
```
PORT={port-num}
TIMEZONE={http://momentjs.com/timezone/}
TWILIO_TOKEN={token}
TWILIO_ACCOUNT={acct-sid}
TWILIO_NUMBER=+{twilio-phone-num}
```
3. `npm i`
3. `npm start`
