import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
const cors = require('cors')({origin: true});

export const helloWorld = functions.https.onRequest((request, response) => {
  console.log(Date.now());
 response.send({now : Date.now() / 1000 | 0});

});

export const getNowFromServer = functions.https.onRequest((request, response) => {
  cors(request,response,()=>{
    response.status(200).send({now : Date.now() / 1000 | 0});
  })
});