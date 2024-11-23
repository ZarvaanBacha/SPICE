import mongoose from "mongoose";

const addRecipe = new mongoose.Schema({
    recipeName: {type: String, required: true},
    spices: {type: Array, required: true}
    },
    {
        versionKey: false
    }
)

export default mongoose.model("recipes", addRecipe);