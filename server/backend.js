const express = require('express');
const admin = require('firebase-admin');
const { exec } = require('child_process');
const cors = require('cors');

const { 
  getNotificationLog, 
  isContainerInNotificationLog, 
  updateRecipeAnalytics, 
  updateContainerAnalytics, 
  initialContainersCreation, 
  testNotifLog,
  updateContainersOnStartUp,
  addContainerToNotifLog,
  removeContainerToNotifLog,
  callDispenseScript,
} = require('./utils'); // Import functions from utils.js

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

// create the containers in Firebase
//initialContainersCreation(db);
updateContainersOnStartUp(db, admin.firestore.FieldValue, threshold);

// TODO: remove, its only to test the notification log
testNotifLog(db, admin.firestore.FieldValue);

// Root URL route
app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

// API endpoint to dispense a recipe
// This endpoint will take the recipe item as input and deal with the dispensing logic
app.post("/dispenseRecipe", async (req, res) => {
  try {
      const { recipe, FromSingleDispense} = req.body;
      const { id, recipeName, spices } = recipe; // Destructure the recipe object
      const notifLog = await getNotificationLog(db); // Fetch the notification log
      //console.log(`spices: ${JSON.stringify(spices)}`);

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
      // return the list of low spices, if the recipe contains any.
      if (lowSpices.length > 0) {
        return res.status(200).json({ lowSpices });
      }

      //console.log(`${FromSingleDispense}`)
      if (!FromSingleDispense) { // update the recipe analytics only if its a real recipe
        updateRecipeAnalytics(db, id, admin.firestore.FieldValue); // Update the recipe analytics
      }
      updateContainerAnalytics(db, spices, admin.firestore.FieldValue); // Update the container analytics

      //TODO: call dispense script here?
      const dispenseResult = await callDispenseScript(db, spices);
      //TODO: dispense script should return new spice level values to be updated in the db
      //TODO: update spice levels AND notiflog db

      res.json({ message: `Dispensing recipe: ${recipeName}`, spices }); //TODO: change the response
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// API endpoint to get low spices from notificationLog
app.get('/getLowSpices', async (req, res) => {
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
          containerNumber: containerData.location, //TODO: maybe fix the name to containerId or location.
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
app.post('/getSpicesToRefillFromRecipe', async (req, res) => {
  try {
    const recipe = req.body;
    const { spices } = recipe;

    // Fetch all containers from the database
    const containersSnapshot = await db.collection('containers').get();
    const containers = containersSnapshot.docs.map(doc => ({
      containerNumber: doc.data().location,
      spiceName: doc.data().spiceName,
      spiceQuantity: doc.data().spiceQuantity,
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
          spiceName: containerData.spiceName,
          spiceQuantity: containerData.spiceQuantity,
        });
      }
    }

    // Filter containers to match the spices in the recipe and are in the notification log
    const spicesToRefill = spices
      .map(spice => {
        const container = lowSpices.find(c => c.spiceName === spice.spiceName);
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

app.post('/refillSpices', async (req, res) => {
  try {
    const { spices, userResponse } = req.body; // Extract spicesToRefill and userResponse from the request body

    for (const container of spices) {
      console.log(`Processing container ${container.containerNumber} for spice "${container.spiceName}"`);

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
            lastRefilled: new Date(),
            isLow: false,
          });

          // 6. Remove the container from the notification log
          const logEntryRef = db.collection('containers').doc(`container_${container.containerNumber}`);
          removeContainerToNotifLog(db, logEntryRef, admin.firestore.FieldValue);

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

app.get('/getSpiceContainers', async (req, res) => {
  try {
    // Fetch all containers from the database
    const containersSnapshot = await db.collection('containers').get();

    // Map the containers and resolve the isLow property asynchronously
    const spices = await Promise.all(
      containersSnapshot.docs.map(async (doc) => {
        const isLow = await isContainerInNotificationLog(db, doc.id); // Resolve the isLow value
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