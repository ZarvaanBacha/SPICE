
async function getNotificationLog(db) {
    try {
      const docRef = db.collection('device').doc('notificationLog');
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error('No such document!');
      } else {
        //console.log('Notification Log Document data:', doc.data());
        const notificationLogData = doc.data();
  
        // Assuming the notification log contains an array of references to other documents
        const containerRefs = notificationLogData.log;
        const containerDataPromises = containerRefs.map(async (containerRef) => {
          const containerDoc = await containerRef.get();
          if (!containerDoc.exists) {
            throw new Error('Referenced container document does not exist!');
          } else {
            return containerDoc.data();
          }
        });
  
        // Wait for all promises to resolve
        const containersData = await Promise.all(containerDataPromises);
        //console.log('Containers Data:', containersData);
        return containersData;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

// Example function to log recipe details
function logRecipeDetails(recipe) {
  const { recipeName, spices } = recipe;
  console.log(`Dispensing recipe: ${recipeName}`);
  console.log(`Spices: ${JSON.stringify(spices)}`);

  spices.forEach(spice => {
    console.log(`Spice Name: ${spice.spiceName}, Measurement: ${spice.spiceMeasurement}`);
  });
}

async function isContainerInNotificationLog(db, containerNumber) {
  try {
    // Fetch the notification log document
    const notifLogDoc = await db.collection('device').doc('notificationLog').get();

    if (!notifLogDoc.exists) {
      console.error('Notification log not found');
      return false; // Return false if the notification log does not exist
    }

    const notifLogData = notifLogDoc.data();
    const logEntries = notifLogData.log || []; // Array of references

    // Check if the containerNumber exists in the notification log
    for (const ref of logEntries) {
      const containerDoc = await ref.get(); // Resolve the reference
      if (containerDoc.exists && containerDoc.id === containerNumber) {
        return true; // Return true if the container is found in the notification log
      }
    }

    return false; // Return false if the container is not found in the notification log
  } catch (error) {
    console.error('Error checking notification log:', error);
    return false; // Return false in case of an error
  }
}

async function updateRecipeAnalytics(db, recipeId, FieldValue) {
  try {
    // Reference the recipe document in the Firestore database
    const recipeDocRef = db.collection('recipes').doc(recipeId);

    // Update the analytics fields
    await recipeDocRef.update({
      timesUsed: FieldValue.increment(1), // Increment timesUsed by 1
      usageHistory: FieldValue.arrayUnion(new Date().toISOString()), // Add the current timestamp to usageHistory
    });

    //console.log(`Analytics updated for recipe with ID: ${recipeId}`);
  } catch (error) {
    //console.error(`Error updating analytics for recipe with ID: ${recipeId}`, error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

async function updateContainerAnalytics(db, spices, FieldValue) {
  try {

    for (const spice of spices) {
      // Find the container corresponding to the spice
      const containerSnapshot = await db
        .collection('containers')
        .where('spiceName', '==', spice.spiceName)
        .get();

      if (containerSnapshot.empty) {
        console.warn(`No container found for spice: ${spice.spiceName}`);
        continue;
      }

      // Update analytics for each matching container
      containerSnapshot.forEach(async (doc) => {
        const containerRef = db.collection('containers').doc(doc.id);

        // Calculate the total quantity used in eighth teaspoons
        const quantityUsed = spice.spiceQuantityInEighthTsp;

        await containerRef.update({
          totalQuantityUsed: FieldValue.increment(quantityUsed), // Increment totalQuantityUsed
          timesUsed: FieldValue.increment(1), // Increment timesUsed by 1
          usageHistory: FieldValue.arrayUnion(new Date().toISOString()), // Add the current timestamp to usageHistory
        });

      });
    }
  } catch (error) {
    console.error('Error updating container analytics:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}


// Create containers in Firebase
// This function will create 8 containers in the containers collection
async function initialContainersCreation(db) {
  const batch = db.batch();
  const containerCollectionRef = db.collection(`containers`);
  const containers = 8;

  for (let i = 1; i <= containers; i++) {
      const containerDocRef = containerCollectionRef.doc(`container_${i}`);
      const spiceLogDoc = await db.collection('device').doc('spiceLog').get();
      const spiceName = spiceLogDoc.get(String(i)); // Get the spice name for the current container
      batch.set(containerDocRef, {
          QrCodeId: "",
          spiceName: spiceName || "unknown",
          spiceQuantity: 76,
          location: i, // TODO: change to actual location (depends on zarvaans python script)
          containerId: `container_${i}`,
          timesUsed: 0,
          usageHistory: [],
          lastRefilled: new Date(),
          totalQuantityUsed: 0,
          isLow: false,
      });

      // TODO: update spicelog entries
  }

  await batch.commit();
  console.log("containers batch write completed");
}


async function testNotifLog(db, FieldValue) {
  try {
    // Hardcoded references for testing
    const container1Ref = db.collection('containers').doc('container_1');
    const container2Ref = db.collection('containers').doc('container_2');

    // Update the notificationLog document with the hardcoded references
    addContainerToNotifLog(db, container1Ref, FieldValue);
    addContainerToNotifLog(db, container2Ref, FieldValue);

    console.log('Notification log updated with hardcoded references for testing');
  } catch (error) {
    console.error('Error updating notification log:', error);
  }
}

async function updateContainersOnStartUp(db, FieldValue, threshold) { //TODO: logic
  
  emptyContainerJson = await createEmptyContainerData(db);
  // init containerData
  containerData = { //TODO: change to actual data, temporary for test
    "container_1": {
      spiceQuantity: 50,
      location: 1,
    },
    "container_2": {
      spiceQuantity: 30,
      location: 2,
    },
    "container_3": {
      spiceQuantity: 10,
      location: 3,
    },
    "container_4": {
      spiceQuantity: 0,
      location: 4,
    },
    "container_5": {
      spiceQuantity: 50,
      location: 5,
    },
    "container_6": {
      spiceQuantity: 30,
      location: 6,
    },
    "container_7": {
      spiceQuantity: 10,
      location: 7,
    },
    "container_8": {
      spiceQuantity: 0,
      location: 8,
    },
  };
  //console.log(`emptyjson: ${JSON.stringify(emptyContainerJson)}`);

  //TODO: call python script

  //TODO: get the output (containerData) of the python script 

  // process data and update the containers collection (spiceQuantity, location, isLow)
  for (const key in containerData) {
    if (containerData.hasOwnProperty(key)) {
      const spice = containerData[key];

      const QrCodeId = key;

      // Fetch doc that matches QrCodeId
      const containerSnapshot = await db.collection('containers')
                                        .where('containerId', '==', QrCodeId) //TODO: change containerId to qrCodeId
                                        .limit(1)
                                        .get();

      // update doc if it exists
      if (!containerSnapshot.empty) {
        const containerRef = containerSnapshot.docs[0].ref; // works?

        // Check if spice quantity is below threshold
        var isLow = false;
        if (spice.spiceQuantity <= threshold) {
          await addContainerToNotifLog(db, containerRef, FieldValue); // add container to notificationLog
          isLow = true;
        } else {
          await removeContainerToNotifLog(db, containerRef, FieldValue); // remove container to notificationLog
        }

        // Update the container document
        await containerRef.update({
          spiceQuantity: spice.spiceQuantity,
          location: spice.location,
          isLow: isLow,
        });

        console.log(`Updated container: ${QrCodeId}`);
      } else {
        console.log(`Container not found for: ${QrCodeId}`);
      }
    }
  }
}

async function addContainerToNotifLog(db, containerDoc, FieldValue) {
  
  const notifLogRef = db.collection('device').doc('notificationLog');
  
  await notifLogRef.update({
    log: FieldValue.arrayUnion(containerDoc), // Append containerDoc to the log array
  });
}

async function removeContainerToNotifLog(db, containerDoc, FieldValue) {
  
  const notifLogRef = db.collection('device').doc('notificationLog');
  
  await notifLogRef.update({
    log: FieldValue.arrayRemove(containerDoc), // remove containerDoc from the log array
  });
}

async function createEmptyContainerData(db) {
  // Fetch all documents from the containers collection
  const containersSnapshot = await db.collection('containers').get();
  
  let spice_data = {};

  // Iterate over each container document and add to spice_data
  containersSnapshot.forEach((doc) => {
      let key = doc.data().containerId; //TODO: cahnge to QrCodeId
      
      spice_data[key] = {
          spiceQuantity: 0,
          location: null
      };
  });

  return spice_data;
}

async function callDispenseScript(db, spices) {

  dispensingData = await createDispensingData(db, spices); // create dispensing data json for python script
  //console.log(`Dispensing spices: ${JSON.stringify(dispensingData)}`);

  //TODO: call python script

  //TODO: get the output of the python script 

  //TODO: update container collection (spiceQuantity and isLow) and notificationLog if needed 
}

async function createDispensingData(db, spices) {
  // Fetch all documents from the containers collection
  const containersSnapshot = await db.collection('containers').get();
  
  let spice_data = {};

  // Iterate over each container document and add to spice_data
  containersSnapshot.forEach((doc) => {
    let key = doc.data().containerId; //TODO: cahnge to QrCodeId
    let spiceName = doc.data().spiceName;
    let location = doc.data().location;
    let spiceQuantity = doc.data().spiceQuantity;

    // Find the spice in the spices array
    const spice = spices.find(s => s.spiceName === spiceName);

    if (spice) { // If the spice is in the recipe
      spice_data[key] = {
        spiceQuantityInEighthTsp: spice.spiceQuantityInEighthTsp,
        location: location,
        spiceQuantity: spiceQuantity
      };
    } else { // If the spice is not in the recipe
      spice_data[key] = {
        spiceQuantityInEighthTsp: 0,
        location: location,
        spiceQuantity: spiceQuantity
      };
    }
      
  });

  return spice_data;
}

module.exports = {
  getNotificationLog,
  logRecipeDetails,
  isContainerInNotificationLog,
  updateRecipeAnalytics,
  updateContainerAnalytics,
  initialContainersCreation,
  testNotifLog,
  updateContainersOnStartUp,
  addContainerToNotifLog,
  removeContainerToNotifLog,
  callDispenseScript,
};