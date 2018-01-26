# lit-pics
🐱 Simple app to make sure me and my girlfriend are cleaning the damn litter box.

### Setup
1. Create a `config.json` file in app's root directory based off of `config.template.json`
2. Replace the info in the participants array matching this format:
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
3. Set preferences object to proper format:
```
{
    "alertTime": https://www.npmjs.com/package/cron,
    "timezone": http://momentjs.com/timezone
}
```
4. `npm i`
5. `npm start`
