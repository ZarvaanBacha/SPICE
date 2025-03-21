import joblib
import random
import sys
import json
import os
import gzip

# List of spices to track
spices_list = ["Pepper", "Salt", "Paprika", "Cumin", "Cinnamon", "Parsley", "Italian seasoning", "Oregano"]

# init recipe name
recipe_name = ""

# Get the directory of the current Python script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Paths to the compressed model and MultiLabelBinarizer
compressed_model_path = os.path.join(script_dir, 'model_v1.pkl.gz')
mlb_path = os.path.join(script_dir, 'mlb_v1.pkl')

# Function to load a compressed pickle file
def load_compressed_pickle(file_path):
    with gzip.open(file_path, 'rb') as f:
        return joblib.load(f)

# Load the model and MultiLabelBinarizer
model = load_compressed_pickle(compressed_model_path)
mlb = joblib.load(mlb_path)

def suggest_recipes(user_input, num_suggestions):
    predicted_recipes = []

    # Convert user input into keywords
    input_keywords = user_input.split(" ")
    
    #----- process user input to remove unnecessary words
    # List of terms to remove from the title
    terms_to_remove = ['&', 'n\'', '\'n\'', 'and', 'in', 'from', 'with', 'the', 'of']

    # Function to filter out specific terms from the title
    def filter_terms(keywords, terms_to_remove):
        filtered_keywords = [word for word in keywords if word not in terms_to_remove]
        return filtered_keywords

    # Clean the title by removing unwanted terms
    processed_input_keywords = filter_terms(input_keywords, terms_to_remove)

    # Transform input into the same format as training data
    input_vector = mlb.transform([processed_input_keywords])
    
    # Predict spice quantities
    predicted_spices_quantities = model.predict(input_vector)

    # Process predictions
    spices_considered = []
    
    # Filter spices with quantity > 1
    for index, spice in enumerate(predicted_spices_quantities[0]):  
        if spice > 1:
            spices_considered.append([spices_list[index], round(spice)])

    # Generate multiple recipe suggestions
    for _ in range(num_suggestions):
        if len(spices_considered) > 2:
            number_of_spices_in_recipe = random.randint(3, len(spices_considered)-1)
            try:
                predicted_recipe = random.sample(spices_considered, k=number_of_spices_in_recipe)
            except:
                predicted_recipe = spices_considered[0:4]
        else:
            predicted_recipe = spices_considered  # If not enough spices, return all

        predicted_recipes.append([recipe_name, predicted_recipe])

    return predicted_recipes

# Read input arguments from Node.js
if __name__ == "__main__":
    user_input = sys.argv[1]  # First argument (string)
    num_suggestions = int(sys.argv[2])  # Second argument (integer)
    
    recipe_name = user_input

    # Generate recipe suggestions
    results = suggest_recipes(user_input, num_suggestions)

    # Print the output as JSON (so Node.js can read it)
    print(json.dumps(results))