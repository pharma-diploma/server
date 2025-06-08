import express, { Express } from "express";
import "./db/index.js";

import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import seedRoutes from "./routes/seed.routes.js";
import productRoutes from "./routes/product.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";

const PORT = process.env.PORT || 3000;

const app: Express = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the Pharmacy API"); 
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/seed", seedRoutes);
app.use("/pharmacies", pharmacyRoutes);

app.listen(PORT, () => {
  console.log("Server listens on port", PORT);
});
