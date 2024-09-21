const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static files from the Angular app
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
