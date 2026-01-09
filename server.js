import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

dotenv.config();

// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization","token"],
  credentials: true
}));

app.use(express.json());

// database
connectDB();

// static uploads
app.use("/images", express.static("uploads"));

// routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// health check
app.get("/", (req, res) => {
  res.status(200).send("API is running...");
});

// start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
