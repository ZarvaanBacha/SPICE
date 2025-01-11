import express from "express";
import mongoose from "mongoose";
import routes from "./routes.js";
import cors from "cors";
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: "http://localhost:4200"}));
app.use(routes);
app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requeested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
})

mongoose.connect("mongodb+srv://spiceDB:spice123@spicedb.7scmb.mongodb.net/?retryWrites=true&w=majority&appName=spiceDB")
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