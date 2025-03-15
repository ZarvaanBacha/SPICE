
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

async function isContainerInNotificationLog(containerNumber) {
  try {
    // Fetch the notification log document
    const notifLogDoc = await db.collection('device').doc('notificationLog').get();

    if (!notifLogDoc.exists) {
      //console.error('Notification log not found');
      return false; // Return false if the notification log does not exist
    }

    const notifLogData = notifLogDoc.data();
    const logEntries = notifLogData.log || []; // Array of references

    // Check if the containerNumber exists in the notification log
    for (const ref of logEntries) {
      const containerDoc = await ref.get(); // Resolve the reference
      if (containerDoc.exists && containerDoc.id === `container_${containerNumber}`) {
        return true; // Return true if the container is found in the notification log
      }
    }

    return false; // Return false if the container is not found in the notification log
  } catch (error) {
    //console.error('Error checking notification log:', error);
    return false; // Return false in case of an error
  }
}

module.exports = {
    getNotificationLog,
    logRecipeDetails,
    isContainerInNotificationLog
};