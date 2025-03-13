const express = require('express');
const admin = require('firebase-admin');
const { exec } = require('child_process');
const cors = require('cors');

const { getNotificationLog } = require('./utils'); // Import functions from utils.js

const app = express();
const PORT = 4000;

const threshold = 0;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

// Initialize Firebase
const serviceAccount = require("C:/Users/ludov/Desktop/uOttawa/Semesters/2024 FALL/CEG4912/firebase-admin-private-keys.json"); // CHANGE
const { log } = require('console');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://spicedb-84047-default-rtdb.firebaseio.com'
});
const db = admin.firestore();

// Create containers in Firebase
// This function will create 8 containers in the containers collection
// TODO: use to initialize containers on device startup
const deviceId = "device";
const containers = 8;
async function createContainersWithBatch() {
  const batch = db.batch();
  const containerCollectionRef = db.collection(`containers`);

  for (let i = 1; i <= containers; i++) { //TODO: no need to loop, parse the output of the python script
      // TODO: use python script to get each container's info.
      // TODO: check if spice needs to be added in notiflog
      const containerDocRef = containerCollectionRef.doc(`container_${i}`);
      const spiceLogDoc = await db.collection('device').doc('spiceLog').get();
      const spiceName = spiceLogDoc.get(String(i)); // Get the spice name for the current container
      batch.set(containerDocRef, {
          QrCodeId: "",
          spiceName: spiceName || "unknown",
          spiceQuantity: 76,
          location: i, // TODO: change to actual location (depends on zarvaans python script)
          containerId: `container_${i}`
      });

      // TODO: update spicelog entries
  }

  await batch.commit();
  console.log("containers batch write completed");
}

async function testNotifLog() {
  try {
    const notifLogRef = db.collection('device').doc('notificationLog');

    // Hardcoded references for testing
    const container1Ref = db.collection('containers').doc('container_1');
    const container2Ref = db.collection('containers').doc('container_2');

    // Update the notificationLog document with the hardcoded references
    await notifLogRef.set({
      log: [container1Ref, container2Ref]
    }, { merge: true });

    console.log('Notification log updated with hardcoded references for testing');
  } catch (error) {
    console.error('Error updating notification log:', error);
  }
}

// create the containers in Firebase
createContainersWithBatch();

// TODO: remove, its only to test the notification log
testNotifLog();

// // API endpoint to get data from Firebase
// app.get('/api/recipes', async (req, res) => {
//   try {
//     const recipesSnapshot = await db.collection('recipes').get();
//     const recipes = recipesSnapshot.docs.map(doc => doc.data());
//     res.json(recipes);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// // API endpoint to add data to Firebase
// app.post('/api/recipes', async (req, res) => {
//   try {
//     const newRecipe = req.body;
//     await db.collection('recipes').add(newRecipe);
//     res.status(201).send('Recipe added successfully');
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// Root URL route
app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

// API endpoint to run a Python script
app.post('/api/run-script', (req, res) => {
  exec('python3 path/to/your/script.py', (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      res.status(500).send(`Stderr: ${stderr}`);
      return;
    }
    res.send(`Output: ${stdout}`);
  });
});

// API endpoint to dispense a recipe
// This endpoint will take the recipe item as input and deal with the dispensing logic
app.post("/dispenseRecipe", async (req, res) => {
  try {
      const recipe = req.body;
      const { recipeName, spices, userResponse } = recipe; // Destructure the recipe object

      const notifLog = await getNotificationLog(db); // Fetch the notification log
      //console.log(`notiflog: ${JSON.stringify(notifLog)}`);

      // Check if all spices in the recipe are located in containers
      const containersSnapshot = await db.collection('containers').get();
      const containers = containersSnapshot.docs.map(doc => doc.data());

      for (const spice of spices) {
          const container = containers.find(container => container.spiceName === spice.spiceName);
          if (!container) {
              throw new Error(`Spice ${spice.spiceName} not found in any container`);
          }
      }

      // Check the notification log for any low spices
      const lowSpices = notifLog.filter(log => spices.some(spice => spice.spiceName === log.spiceName));

      if (lowSpices.length > 0) {
        if (userResponse === undefined) {
          return res.status(200).json({ lowSpices });
        } else if (userResponse === 'cancel') {
          return res.status(200).json({ message: 'Dispensing cancelled by user' });
        } else if (userResponse === 'refill') {
          // TODO: call the refilling routine
          const refillResponse = await fetch('http://localhost:4000/refillRoutine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          const refillData = await refillResponse.json();
          return res.status(200).json(refillData);
          //TODO: call dispense script here?
        }
      }


      res.json({ message: `Dispensing recipe: ${recipeName}`, notifLog });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// API endpoint to handle the refilling routine
app.post("/refillRoutine", async (req, res) => {
  try {
      const notifLog = await getNotificationLog(db); // Fetch the notification log

      // check if notiflog is empty
      if (notifLog.length === 0) {
          return res.status(200).json({ message: 'Notification log is empty. No spices need refilling.' });
      }

      //console.log(`notiflog: ${JSON.stringify(notifLog)}`);

      // Iterate through the entries in the notifLog
      for (const logEntry of notifLog) {
          const spiceName = logEntry.spiceName;

          // Move the spice container to the refill position (leave as a comment for now)
          // TODO: move lowspice to refill position (get location from logEntry and pass it to python script)

          // Prompt the user to refill the spice
          const userResponse = await promptUserToRefill(spiceName);

          // TODO: properly create the user prompts in the frontend (in recipe dispensing AND selection screen)
          if (userResponse === 'cancel') {
              continue; // Skip to the next logEntry
          } else if (userResponse === 'done') {
              // TODO: get current spice quantity from python script
              // placeholder for now:
              const currentSpiceQuantity = 74;
              if (currentSpiceQuantity > threshold) {
                // Update spice level in db
                await db.collection('containers').doc(logEntry.containerId).update({
                  spiceQuantity: currentSpiceQuantity // TODO: add ,lastRefilled: new Date() ?
                });
                
                // create reference to current logEntry to use for removal
                logEntryRef = db.collection('containers').doc('container_' + logEntry.location);
                // Remove spice from notifLog
                await db.collection('device').doc('notificationLog').update({
                  log: admin.firestore.FieldValue.arrayRemove(logEntryRef)
                });
                console.log(`Spice ${spiceName} refilled successfully`);
              } else {
                throw new Error(`Spice ${spiceName} was not refilled properly`); // TODO: handle this error properly in frontend
              }
          }
      }

      res.json({ message: 'Refilling routine completed', notifLog });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Function to prompt the user to refill the spice
async function promptUserToRefill(spiceName) {
  // Simulate a delay to wait for user response
  return new Promise((resolve) => {
      setTimeout(() => {
          // Simulate user response (replace with actual frontend prompt logic)
          const userResponse = 'done'; // or 'cancel'
          resolve(userResponse);
      }, 1000);
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});