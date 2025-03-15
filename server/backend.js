const express = require('express');
const admin = require('firebase-admin');
const { exec } = require('child_process');
const cors = require('cors');

const { getNotificationLog, isContainerInNotificationLog } = require('./utils'); // Import functions from utils.js

const app = express();
const PORT = 4000;

const threshold = 0;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

// Initialize Firebase
const serviceAccount = require("C:/Users/dextr/Desktop/firebase-admin-private-keys.json"); // CHANGE
const { log } = require('console');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://spicedb-84047-default-rtdb.firebaseio.com'
});
const db = admin.firestore();

// Create containers in Firebase
// This function will create 8 containers in the containers collection
// TODO: use to initialize containers on device startup
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

      if (lowSpices.length > 0) { //TODO: change the full logic here, since the cancel and refill user responses arent dealt with here anymore
        if (userResponse === undefined) { //TODO possibly move this up to save compute time
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
          //TODO: dispense script should return new spice level values to be updated in the db
        }
      }


      res.json({ message: `Dispensing recipe: ${recipeName}`, notifLog }); //TODO: change the response
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// API endpoint to get low spices from notificationLog
app.get('/api/low-spices', async (req, res) => {
  try {
    const notifLogDoc = await db.collection('device').doc('notificationLog').get();

    if (!notifLogDoc.exists) {
      return res.status(404).json({ message: 'Notification log not found' });
    }

    const notifLogData = notifLogDoc.data();
    const logEntries = notifLogData.log || []; // Array of references

    const lowSpices = [];
    for (const ref of logEntries) {
      const containerDoc = await ref.get(); // Resolve the reference
      if (containerDoc.exists) {
        const containerData = containerDoc.data();
        lowSpices.push({
          containerNumber: containerData.location, //TODO: maybe fix this?
          spiceName: containerData.spiceName,
          spiceQuantity: containerData.spiceQuantity,
        });
      }
    }

    res.json(lowSpices);
  } catch (error) {
    console.error('Error fetching low spices:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get spices to refill from a recipe. returns an array of containers that need refilling and are in the recipe.
app.post('/api/getSpicesToRefillFromRecipe', async (req, res) => {
  try {
    const recipe = req.body;
    const { spices } = recipe;

    // Fetch all containers from the database
    const containersSnapshot = await db.collection('containers').get();
    const containers = containersSnapshot.docs.map(doc => ({
      containerNumber: doc.data().location,
      spice: doc.data().spiceName,
      percentageLeft: doc.data().spiceQuantity,
    }));

    // Fetch the notification log
    const notifLogDoc = await db.collection('device').doc('notificationLog').get();
    if (!notifLogDoc.exists) {
      return res.status(404).json({ message: 'Notification log not found' });
    }

    const notifLogData = notifLogDoc.data();
    const logEntries = notifLogData.log || []; // Array of references

    // Resolve the notification log references to get the containers that need refilling
    const lowSpices = [];
    for (const ref of logEntries) {
      const containerDoc = await ref.get();
      if (containerDoc.exists) {
        const containerData = containerDoc.data();
        lowSpices.push({
          containerNumber: containerData.location,
          spice: containerData.spiceName,
          percentageLeft: containerData.spiceQuantity,
        });
      }
    }

    // Filter containers to match the spices in the recipe and are in the notification log
    const spicesToRefill = spices
      .map(spice => {
        const container = lowSpices.find(c => c.spice === spice.spiceName);
        if (container) {
          return container;
        }
        return null; // If no container matches, return null
      })
      .filter(Boolean); // Remove null values

    res.json(spicesToRefill);
  } catch (error) {
    console.error('Error fetching spices to refill:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/refill-spices', async (req, res) => {
  try {
    const { spices, userResponse } = req.body; // Extract spicesToRefill and userResponse from the request body

    for (const container of spices) {
      console.log(`Processing container ${container.containerNumber} for spice "${container.spice}"`);

      if (userResponse === undefined) {
        // 1. Move the container to the refill position
        console.log(`Moving container ${container.containerNumber} to the refill position.`);
        // TODO: Call a Python script or hardware API to physically move the container

        // 2. Send a response to the frontend to prompt the user
        return res.status(200).json({
          message: `Container ${container.containerNumber} is ready for refilling.`,
          spicesToRefill: spices,
        });
      } else if (userResponse === 'done') {
        // 3. Get the current spice quantity (e.g., from a Python script or sensor)
        console.log(`Getting current spice quantity for container ${container.containerNumber}.`);
        const currentSpiceQuantity = 100; // Placeholder value; replace with actual logic

        // 4. Check if the current spice quantity is above the threshold
        if (currentSpiceQuantity > threshold) {
          console.log(`Spice quantity for container ${container.containerNumber} is sufficient (${currentSpiceQuantity}%).`);

          // 5. Update the spice quantity in the database
          await db.collection('containers').doc(`container_${container.containerNumber}`).update({
            spiceQuantity: currentSpiceQuantity,
            // lastRefilled: new Date(), TODO: add lastRefilled field to container document?
          });

          // 6. Remove the container from the notification log
          const logEntryRef = db.collection('containers').doc(`container_${container.containerNumber}`);
          await db.collection('device').doc('notificationLog').update({
            log: admin.firestore.FieldValue.arrayRemove(logEntryRef),
          });

          console.log(`Container ${container.containerNumber} successfully refilled and removed from the notification log.`);
        } else {
          // 4.1. If not, prompt the user to refill again
          console.log(`Spice quantity for container ${container.containerNumber} is still below the threshold.`);
          return res.status(400).json({
            message: `Spice quantity for container ${container.containerNumber} is insufficient. Please refill again.`,
          });
        }
      }

      // 7. remove current container from spices array and send it back to the frontend
    }

    res.json({ message: 'Refill process completed successfully.' });
  } catch (error) {
    console.error('Error during refill process:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/getSpiceContainers', async (req, res) => {
  try {
    // Fetch all containers from the database
    const containersSnapshot = await db.collection('containers').get();

    // Map the containers and resolve the isLow property asynchronously
    const spices = await Promise.all(
      containersSnapshot.docs.map(async (doc) => {
        const isLow = await isContainerInNotificationLog(doc.id); // Resolve the isLow value
        return {
          containerNumber: doc.id,
          spiceName: doc.data().spiceName,
          spiceQuantity: doc.data().spiceQuantity,
          isLow: isLow, // Set the resolved isLow value
        };
      })
    );

    res.json(spices);
  } catch (error) {
    console.error('Error fetching spices:', error);
    res.status(500).json({ error: 'Failed to fetch spices' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});