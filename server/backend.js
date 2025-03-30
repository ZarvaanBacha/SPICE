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
  getUserReferenceByDeviceId,
  moveToRefill,
  getCurrSpiceQuantity,
} = require('./utils'); // Import functions from utils.js

const app = express();
const PORT = 4000;

const threshold = 0;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

// Initialize Firebase
const serviceAccount = require("C:/Users/ludov/Desktop/uOttawa/Semesters/2024 FALL/CEG4912/firebase-admin-private-keys.json"); //TODO: CHANGE
const { log } = require('console');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://spicedb-84047-default-rtdb.firebaseio.com'
});
const db = admin.firestore();
const deviceId = "DEMO"; //TODO set the device id here
let userRef;

getUserReferenceByDeviceId(db, deviceId)
  .then((ref) => {
    userRef = ref;

    //return initialContainersCreation(db, userRef);
  })
  .then(() => {
    return updateContainersOnStartUp(userRef, admin.firestore.FieldValue, threshold);
  })
  .then(() => {
    // Start the server after initialization
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error initializing userRef:', error);
    process.exit(1); // Exit the process if initialization fails
  });

// TODO-minor: remove, its only to test the notification log
//testNotifLog(userRef, admin.firestore.FieldValue);

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
      //console.log(`spices: ${JSON.stringify(spices)}`);

      // Check if all spices in the recipe are located in containers
      const containersSnapshot = await userRef.collection('containers').get();
      const containers = containersSnapshot.docs.map(doc => doc.data());

      for (const spice of spices) {
          const container = containers.find(container => container.spiceName === spice.spiceName);
          if (!container) {
              throw new Error(`Spice ${spice.spiceName} not found in any container`);
          }
      }

      // call dispense script. db values for containers and notifLog are updated in it.
      await callDispenseScript(userRef, admin.firestore.FieldValue, spices, threshold);
      
      //console.log(`${FromSingleDispense}`)
      if (!FromSingleDispense) { // update the recipe analytics only if its a real recipe
        updateRecipeAnalytics(userRef, id, admin.firestore.FieldValue); // Update the recipe analytics
      } //TODO: uncomment above line. used to cause error because users did not have a recipes collection.
      updateContainerAnalytics(userRef, spices, admin.firestore.FieldValue); // Update the container analytics
      

      res.json({ message: `Dispensing recipe: ${recipeName}`, spices });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// API endpoint to get low spices from notificationLog
app.get('/getLowSpices', async (req, res) => {
  try {
    const notifLogDoc = await userRef.collection('device').doc('notificationLog').get();

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
          containerNumber: containerData.location, //TODO-minor: maybe fix the name to containerId or location.
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
    const containersSnapshot = await userRef.collection('containers').get();
    const containers = containersSnapshot.docs.map(doc => ({ //TODO: remove?
      containerNumber: doc.data().location,
      spiceName: doc.data().spiceName,
      spiceQuantity: doc.data().spiceQuantity,
    }));

    // Fetch the notification log
    const notifLogDoc = await userRef.collection('device').doc('notificationLog').get();
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
      //console.log(`Processing container ${container.containerNumber} for spice "${container.spiceName}"`);

      if (userResponse === undefined) {
        // 1. Move the container to the refill position
        console.log(`Moving container ${container.containerNumber} to the refill position.`);

        // calls the moveToRefill function which moves the container identified by containerNumber to the refill position
        await moveToRefill(db, container.containerNumber);

        // 2. Send a response to the frontend to prompt the user
        return res.status(200).json({
          message: `Container ${container.containerNumber} is ready for refilling.`,
          spicesToRefill: spices,
        });
      } else if (userResponse === 'done') {
        // 3. Get the current spice quantity (e.g., from a Python script or sensor)
        const currentSpiceQuantity = await getCurrSpiceQuantity(db, container.containerNumber);

        // 4. Check if the current spice quantity is above the threshold
        if (currentSpiceQuantity > threshold) {
          //console.log(`Spice quantity for container ${container.containerNumber} is sufficient (${currentSpiceQuantity}%).`);

          // 5. Update the spice quantity in the database
          await userRef.collection('containers').doc(`container_${container.containerNumber}`).update({
            spiceQuantity: currentSpiceQuantity,
            lastRefilled: new Date(),
            isLow: false,
          });

          // 6. Remove the container from the notification log
          const logEntryRef = userRef.collection('containers').doc(`container_${container.containerNumber}`);
          removeContainerToNotifLog(userRef, logEntryRef, admin.firestore.FieldValue);

          //console.log(`Container ${container.containerNumber} successfully refilled and removed from the notification log.`);
        } else {
          // 4.1. If not, prompt the user to refill again
          //console.log(`Spice quantity for container ${container.containerNumber} is still below the threshold.`);
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
    const containersSnapshot = await userRef.collection('containers').get();

    // Map the containers and resolve the isLow property asynchronously
    const spices = await Promise.all(
      containersSnapshot.docs.map(async (doc) => {
        //const isLow = await isContainerInNotificationLog(userRef, doc.id); // Resolve the isLow value
        return {
          containerNumber: doc.id,
          spiceName: doc.data().spiceName,
          spiceQuantity: doc.data().spiceQuantity,
          isLow: doc.data().isLow, // Set the resolved isLow value
        };
      })
    );

    res.json(spices);
  } catch (error) {
    console.error('Error fetching spices:', error);
    res.status(500).json({ error: 'Failed to fetch spices' });
  }
});
