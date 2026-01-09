import express from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/auth.js";
import {
  addFood,
  listFood,
  removeFood
} from "../controllers/foodcontroller.js";

const foodRouter = express.Router();

// storage
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// file filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// routes
foodRouter.post("/add", authMiddleware, upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", authMiddleware, removeFood);

export default foodRouter;
