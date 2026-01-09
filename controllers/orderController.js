import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const frontend_url = process.env.FRONTEND_URL;


// Place order
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL;

  try {
    const newOrder = new orderModel({
      userId: req.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: false
    });

    await newOrder.save();

    // clear cart
    await userModel.findByIdAndUpdate(req.userId, { $set: { cartData: {} } });

    const line_items = req.body.items.map(item => ({
  price_data: {
    currency: "inr",
    product_data: { name: item.name },
    unit_amount: Math.round(Number(item.price) * 100*91)
  },
  quantity: item.quantity
}));


   line_items.push({
  price_data: {
    currency: "inr",
    product_data: { name: "Delivery Charges" },
    unit_amount: 5000 // ₹50 (Stripe minimum safe)
  },
  quantity: 1
});


    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
    });

    res.status(200).json({ success: true, session_url: session.url });

  } catch (error) {
  console.error("Stripe error:", error);
  res.status(500).json({
    success: false,
    message: error.message || "Stripe error"
  });
}
};

// Verify order
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      return res.json({ success: true });
    }

    await orderModel.findByIdAndDelete(orderId);
    res.json({ success: false });

  } catch {
    res.status(500).json({ success: false });
  }
};

// User orders
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId });
    res.json({ success: true, data: orders });
  } catch {
    res.status(500).json({ success: false });
  }
};

export { placeOrder, verifyOrder, userOrders };
