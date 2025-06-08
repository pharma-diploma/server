import express from "express";
import Cart from "../models/Cart.model.js";
import PharmacyProduct from "../models/PharmacyProduct.model.js";

const router = express.Router();

// Получить корзину пользователя
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate({
      path: "items",
      populate: [
        { path: "product" },
        { path: "pharmacy" }
      ]
    });
    console.log(cart)
    res.json(cart || { user: req.params.userId, items: [] });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" });
  }
});

// Добавить PharmacyProduct в корзину
router.post("/:userId/add", async (req, res) => {
  try {
    const { pharmacyProductId } = req.body;
    console.log("add prod");
    console.log(pharmacyProductId);
    let cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) {
      cart = await Cart.create({ user: req.params.userId, items: [] });
    }
    if (!cart.items.includes(pharmacyProductId)) {
      cart.items.push(pharmacyProductId);
      await cart.save();
    }
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Удалить PharmacyProduct из корзины
router.post("/:userId/remove", async (req, res) => {
  try {
    const { pharmacyProductId } = req.body;
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter(
      (id) => id.toString() !== pharmacyProductId
    );
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Очистить корзину
router.post("/:userId/clear", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;