import express from "express";
import Product, { IProduct } from "../models/Product.model.js";
import PharmacyProduct, { IPharmacyProduct } from "../models/PharmacyProduct.model.js";
import ProductModel from "../models/Product.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pharmacyProduct: IPharmacyProduct | null = await PharmacyProduct.findById(req.params.id);
    if (!pharmacyProduct) return res.status(404).json({ message: "Not found" });

    const product: IProduct | null = await ProductModel.findById(pharmacyProduct.product);
    if (!product) return res.status(404).json({message: "Not found"});
    // Найти минимальную и максимальную цену для этого продукта во всех аптеках
    const prices = await PharmacyProduct.find({ product: product._id }).select("price").lean();
    let minPrice = null;
    let maxPrice = null;
    if (prices.length > 0) {
      const priceValues = prices.map(p => p.price);
      minPrice = Math.min(...priceValues);
      maxPrice = Math.max(...priceValues);
    }

    res.json({
      ...product._doc,
      minPrice,
      maxPrice,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/search/:name", async (req, res) => {
  try {
    const regex = new RegExp(req.params.name, "i");
    const products = await Product.find({ name: regex });

    const productsWithMinPrice = await Promise.all(
      products.map(async (product) => {
        const minPriceEntry = await PharmacyProduct.findOne({ product: product._id })
          .sort({ price: 1 })
          .select("price")
          .lean();
        return {
          ...product.toObject(),
          minPrice: minPriceEntry ? minPriceEntry.price : null,
        };
      })
    );
    console.log(productsWithMinPrice);
    res.status(200).json(productsWithMinPrice);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/pharmacy/:pharmacyId", async (req, res) => {
  try {
    const pharmacyProducts = await PharmacyProduct.find({ pharmacy: req.params.pharmacyId })
      .populate("product")
      .sort({ "product.name": 1 });
    const products = pharmacyProducts.map((pp: any) => ({
      ...pp.product._doc,
      _id: pp._id,
      price: pp.price,
      stock: pp.stock,
      expirationDate: pp.expirationDate,
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/pharmacy/:pharmacyId/popular", async (req, res) => {
  try {
    const pharmacyProducts = await PharmacyProduct.find({ pharmacy: req.params.pharmacyId })
      .populate("product")
      .sort({ stock: -1 })
      .limit(5);
    const products = pharmacyProducts.map((pp: any) => ({
      ...pp.product._doc,
      _id: pp._id,
      price: pp.price,
      stock: pp.stock,
      expirationDate: pp.expirationDate,
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/pharmacy/:pharmacyId/new", async (req, res) => {
  try {
    const pharmacyProducts = await PharmacyProduct.find({ pharmacy: req.params.pharmacyId })
      .populate({
        path: "product",
        options: { sort: { createdAt: -1 } }
      })
      .limit(3);
    const products = pharmacyProducts
      .map((pp: any) => ({
        ...pp.product._doc,
        _id: pp._id,
        price: pp.price,
        stock: pp.stock,
        expirationDate: pp.expirationDate,
      }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;