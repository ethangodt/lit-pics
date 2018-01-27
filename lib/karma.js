const fs = require('fs')
const config = require('../config')

module.exports.increment = function increment(name) {
    const participant = config.participants.find((p) => p.name === name)
    participant.karma++
    console.log(JSON.stringify(config))
    fs.writeFile('./config.json', JSON.stringify(config, null, 2), function(err) {
        if(err) {
            return console.log(err)
        }
    })
}
