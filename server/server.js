import express from "express";
import cors from "cors";
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: "http://localhost:4200"}));
app.use((res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requeested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});