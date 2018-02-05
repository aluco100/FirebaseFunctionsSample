"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
exports.helloWorld = functions.https.onRequest((request, response) => {
    console.log(Date.now());
    response.send({ now: Date.now() / 1000 | 0 });
});
exports.getNowFromServer = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        response.status(200).send({ now: Date.now() / 1000 | 0 });
    });
});
exports.insertStartedAt = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        let message = request.body;
        message.createdAt = Date.now() / 1000 | 0;
        admin.database().ref('/chat').push(message);
        response.status(200).send(message);
    });
});
exports.diffDateStartedAt = functions.https.onRequest((request, response) => {
    let db = admin.database();
    db.ref('/chat').limitToFirst(2).on("value", function (snapshot) {
        var value = null;
        for (let key in snapshot.val()) {
            value = snapshot.val()[key];
        }
        const now = Date.now() / 1000 | 0;
        response.status(200).send({
            timeDiff: now - value.createdAt,
            isOnTime: now - value.createdAt < 15 * 60
        });
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
});
//# sourceMappingURL=index.js.map