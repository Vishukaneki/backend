import userModel from "../models/userModel.js";

/**
 * Add item to cart
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $inc: { [`cartData.${itemId}`]: 1 } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Remove item from cart
 */
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId, [`cartData.${itemId}`]: { $gt: 1 } },
      { $inc: { [`cartData.${itemId}`]: -1 } },
      { new: true }
    );

    if (!updatedUser) {
      // remove item completely if count reaches 0
      await userModel.findByIdAndUpdate(userId, {
        $unset: { [`cartData.${itemId}`]: "" }
      });
    }

    res.json({ success: true, message: "Removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, cartData: userData.cartData || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { addToCart, removeFromCart, getCart };
