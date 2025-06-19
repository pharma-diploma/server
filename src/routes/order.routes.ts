import express, { NextFunction, Response } from "express";
import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import PharmacyProduct from "../models/PharmacyProduct.model.js";

const router = express.Router();

// Пример middleware
function courierOnly(req: any, res: Response, next: NextFunction) {
  if (req.user?.role !== "courier") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}

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

    // Отправить событие через сокет всем (или только нужным)
    const io = req.app.locals.io;
    io.to(`user_${order.user}`).emit("orderStatusChanged", {
      orderId: order._id,
      status: order.status,
      userId: order.user,
      courierId: order.courier,
    });
    if (order.courier) {
      io.to(`user_${order.courier}`).emit("orderStatusChanged", {
        orderId: order._id,
        status: order.status,
        userId: order.user,
        courierId: order.courier,
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Курьер берёт заказ
router.post("/:orderId/take", courierOnly, async (req, res) => {
  try {
    const { courierId } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.courier) return res.status(400).json({ message: "Order already taken" });

    order.courier = courierId;
    order.status = "delivery";
    await order.save();

    // Оповещение клиента (и курьера, если нужно)
    const io = req.app.locals.io;
    io.to(`user_${order.user}`).emit("orderStatusChanged", {
      orderId: order._id,
      status: order.status,
      userId: order.user,
      courierId: order.courier,
    });
    io.to(`user_${order.courier}`).emit("orderStatusChanged", {
      orderId: order._id,
      status: order.status,
      userId: order.user,
      courierId: order.courier,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Получить все заказы курьера
router.get("/courier/:courierId", async (req, res) => {
  try {
    const orders = await Order.find({ courier: req.params.courierId })
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

// Получить все активные невзятые заказы (без курьера и не завершённые/отменённые)
router.get("/active/unassigned", async (req, res) => {
  try {
    console.log("Fetch orders without courier");
    const orders = await Order.find({
      courier: { $exists: false },
      status: { $nin: ["completed", "cancelled"] }
    })
      .populate({
        path: "items.pharmacyProduct",
        populate: [{ path: "product" }, { path: "pharmacy" }]
      })
      .sort({ createdAt: -1 });
    console.log(orders);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;