const firebase = require('firebase')
const config = require('../config').firebase
firebase.initializeApp(config)
const db = firebase.database()

module.exports.addParticipant = function addParticipant(name, phoneNumber) {
    const uid = db.ref().child('participants').push().key
    const newParticipant = db.ref().child(`participants/${uid}`)
    newParticipant.set({
        uid,
        name,
        phoneNumber,
        karma: 0
    })
    .catch(err => console.log(err))
    return uid
}

module.exports.updateKarma = function updateKarma(uid, increaseBy) {
    const ref = db.ref().child(`participants/${uid}`)
    const karmaRef = db.ref().child(`participants/${uid}/karma`)

    ref.once('value').then(snapshot => {
        let { karma } = snapshot.val()
        karma += increaseBy
        return karmaRef.set(karma)
    })
    .catch(err => console.log(err))
}
