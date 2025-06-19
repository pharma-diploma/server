import express, { Express } from "express";
import http from "http";
import { Server } from "socket.io";
import "./db/index.js";

import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import seedRoutes from "./routes/seed.routes.js";
import productRoutes from "./routes/product.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

const PORT = process.env.PORT || 3000;

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the Pharmacy API"); 
});

// Передаем io в роуты через app.locals
app.locals.io = io;

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/seed", seedRoutes);
app.use("/pharmacies", pharmacyRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  // Можно реализовать авторизацию по токену и подписку на свои заказы
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
  });
});

server.listen(PORT, () => {
  console.log("Server listens on port", PORT);
});
