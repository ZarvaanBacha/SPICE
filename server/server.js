import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import RecipeModel from "./recipe-model.js"
const app = express();
const PORT = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: "http://localhost:4200"}));
app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requeested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
})

mongoose.connect("mongodb://localhost:27017/main")
.then(() => console.log('Connected Successfully'))
.catch((err) => { console.error(err); });

mongoose.connection.once("open", (_) => {
    console.log(`Database connected`)})

mongoose.connection.on("error", (err) => {
    console.error(`connection error: ${err}`);
    });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


app.post("/addRecipe", async (req,res) => {
    const recipeModel = new RecipeModel(req.body)
    try{
        await recipeModel.save()
    }
    catch(error){
        res.send(error)
    }
})

app.post("/deleteRecipe", async (req,res) => {
    try {
        await RecipeModel.deleteOne({recipeName: req.body.recipeName})
    }
    catch(error){
        res.send(error)
    }
})

app.get("/getRecipes", async (req,res) => {
    try{
        const recipes = await RecipeModel.find()
        res.send(recipes)
    }   
    catch(error) {
        res.send(error)
    } 
})

app.post("/updateRecipe", async (req,res) => {
    try{
        await RecipeModel.findOneAndUpdate({recipeName:req.body.recipeName},{spices:req.body.spices})
    }
    catch(error) {
        res.send(error)
    }
})