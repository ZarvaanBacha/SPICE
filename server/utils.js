
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

module.exports = {
    getNotificationLog,
    logRecipeDetails
};