# lit-pics
🐱 Simple app to make sure me and my girlfriend are cleaning the damn litter box.

### Initial Setup
Initial Firebase setup (1 time only):
1. Navigate to 'rules' tab on database (https://console.firebase.google.com/u/0/project/:id/database/:id/rules)
2. Set:
```
{
  "rules": {
     ".read": true,
     ".write": true
  }
}
```

### Setup
1. Create a `config.json` file in app's root directory based off of `config.template.json`
2. Replace the info in the participants array matching this format:
```
[
    {
        "name": "ethan",
        "number": "+15555555555", <-- this format is important!
        "karma": 0
    },
    {
        "name": "emilie",
        "number": "+15555555555", <-- this format is important!
        "karma": 0
    }
]
```
3. Set preferences object to proper format:
```
{
    "alertTime": https://www.npmjs.com/package/cron,
    "timezone": http://momentjs.com/timezone
}
```
4. `npm i`
5. `npm start`
