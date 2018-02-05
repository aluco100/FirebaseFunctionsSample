import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

export const helloWorld = functions.https.onRequest((request, response) => {
  console.log(Date.now());
  response.send({ now: Date.now() / 1000 | 0 });

});

export const getNowFromServer = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    response.status(200).send({ now: Date.now() / 1000 | 0 });
  })
});

export const insertStartedAt = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    let message = request.body;
    message.createdAt = Date.now() / 1000 | 0;
    admin.database().ref('/chat').push(message);
    response.status(200).send(message);
  });
});

export const diffDateStartedAt = functions.https.onRequest((request, response) => {

  let db = admin.database();
  db.ref('/chat').limitToFirst(2).on("value", function(snapshot) {
    const value: any = snapshot.val()[Object.keys(snapshot.val())[Object.keys(snapshot.val()).length - 1]];
    const now = Date.now() / 1000 | 0;
    response.status(200).send({
      timeDiff: now - value.createdAt,
      isOnTime: now - value.createdAt < 15 * 60,
      value: snapshot.val()
    });
  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
});

// export const createChat = functions.database.ref('/chats/chat').onWrite(event => {
//   return event.data.ref.set({
//     created_at: Date.now() / 1000 | 0,
//     started_at: null,
//     finished_at: null
//   });
// });

export const startChat = functions.database.ref('/messages/chat').onWrite(event => {
  console.log(event.data.val());
  for (let key in event.data.val()) {
    let message = event.data.val()[key];
    if (message.role == "EXPERT") {
      let db = admin.database();
      db.ref("/chats/chat").on("value",snapshot => {
        if(snapshot.val().started_at == null){
          return db.ref("/chats/chat").update({
            started_at: Date.now() / 1000 | 0
          });
        }
      });
      break;
    }
  }
});

export const sendMessage = functions.database.ref('/messages/chat').onWrite(event => {
  const last_key = Object.keys(event.data.val())[Object.keys(event.data.val()).length - 1];
  let db = admin.database();
  return db.ref("/messages/chat/"+last_key).update({
    createdAt: Date.now() / 1000 | 0
  });
});

export const closeChat = functions.database.ref('/messages/chat').onWrite(event => {
  let now = Date.now() / 1000 | 0;
  let db = admin.database();
  db.ref("/chats/chat").on("value", snapshot => {
    let diff = now - snapshot.val().started_at;
    if(diff >= 15 * 60 && snapshot.val().finished_at == null){
      db.ref("/chats/chat").update({
        finished_at: now
      });
      return;
    }
  });
});
