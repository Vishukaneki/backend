import foodModel from "../models/foodModel.js";
import fs from "fs/promises";
import path from "path";

// Add food item
const addFood = async (req, res) => {
  try {
    // ❗ Guard: file must exist
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const image_filename = req.file.filename;

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      image: image_filename,
    });

    await food.save();
    res.json({ success: true, message: "Food Added Successfully" });

  } catch (error) {
    // delete uploaded image if DB fails
    if (req.file) {
      await fs.unlink(path.join("uploads", req.file.filename)).catch(() => {});
    }
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// List food
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch {
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// Remove food
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    await foodModel.findByIdAndDelete(req.body.id);

    await fs.unlink(path.join("uploads", food.image)).catch(() => {});

    res.json({ success: true, message: "Food Deleted Successfully" });
  } catch {
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

export { addFood, listFood, removeFood };
