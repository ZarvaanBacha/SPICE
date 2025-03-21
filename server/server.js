import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
const PORT = 3000;
let email = '';

const pyDir = "C:/Users/ludov/Python/python.exe"; //TODO set as path to python.exe

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: "http://localhost:4200"}));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post("/login", (req, res) => {
  setEmail(req.body.email);
});

app.get('/recipeService', (req, res) => {
  res.json({ email: email });
});

function setEmail(newEmail) {
  email = newEmail;
}

function getEmail() {
  return email;
}

app.post("/getModelSuggestions", (req, res) => {

  const userInput = req.body.userInput;
  const quantitySuggestion = req.body.quantitySuggestion;

  if (!userInput || !quantitySuggestion) {
    return res.status(400).json({ error: "Invalid input. Both userInput and quantitySuggestion are required." });
  }

  // Path to the Python script
  const pythonScriptPath = "ml-model/model-predict.py";

  // Command to execute the Python script with arguments
  const command = `${pyDir} ${pythonScriptPath} "${userInput}" ${quantitySuggestion}`;

  // Run the Python script
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return res.status(500).json({ error: "Failed to execute Python script." });
    }

    if (stderr) {
      console.error(`Python script error: ${stderr}`);
      //return res.status(500).json({ error: "Error in Python script execution." });
    }

    try {
      // Parse the JSON output from the Python script
      const suggestions = JSON.parse(stdout);
      console.log("Python script output:", suggestions);

      // Transform the suggestions into the desired JSON structure
      const transformedSuggestions = suggestions.map((suggestion) => {
        const recipeName = suggestion[0]; // First element is the recipe name
        const spices = suggestion[1].map(([spiceName, spiceQuantity]) => ({
          spiceName,
          spiceQuantity,
        }));

        return {
          recipeName,
          spices,
        };
      });

      // Create the response object
      const response = {
        suggestions: transformedSuggestions,
      };

      res.json(response);
    } catch (parseError) {
      console.error(`Error parsing Python script output: ${parseError.message}`);
      res.status(500).json({ error: "Failed to parse Python script output." });
    }
  });
});