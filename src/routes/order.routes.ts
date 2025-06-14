import express from "express";
import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import PharmacyProduct from "../models/PharmacyProduct.model.js";

const router = express.Router();

// Создать заказ из корзины пользователя
router.post("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Получаем PharmacyProduct и считаем total
    const pharmacyProducts = await PharmacyProduct.find({ _id: { $in: cart.items } });
    let total = 0;
    const items = cart.items.map((pharmacyProductId) => {
      const found = pharmacyProducts.find(
        (pp: any) => pp._id.toString() === pharmacyProductId.toString()
      );
      if (found) total += found.price;
      return { pharmacyProduct: pharmacyProductId, quantity: 1 };
    });

    const order = await Order.create({
      user: req.params.userId,
      items,
      total,
      status: "pending",
    });

    // Очищаем корзину
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Получить все заказы пользователя
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate({
        path: "items.pharmacyProduct",
        populate: [{ path: "product" }, { path: "pharmacy" }]
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Получить заказ по id
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: "items.pharmacyProduct",
        populate: [{ path: "product" }, { path: "pharmacy" }]
      });
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Изменить статус заказа
router.patch("/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;