import express from "express";
import Pharmacy from "../models/Pharmacy.model";

const router = express.Router();

/**
 * @route   POST /api/pharmacies
 * @desc    Create a new pharmacy
 * @body    {
 *   "name": "Аптека №1",
 *   "address": "ул. Примерная, 1",
 *   "coordinates": { "lat": 55.751244, "lng": 37.618423 },
 *   "workingHours": {
 *     "mon": { "open": "08:00", "close": "20:00" },
 *     "tue": { "open": "08:00", "close": "20:00" }
 *   }
 * }
 */
router.post("/", async (req, res) => {
  try {
    const pharmacy = await Pharmacy.create(req.body);
    res.status(201).json(pharmacy);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/pharmacies
 * @desc    Get all pharmacies
 */
router.get("/", async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/pharmacies/:id
 * @desc    Get pharmacy by id
 */
router.get("/:id", async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: "Not found" });
    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/pharmacies/:id
 * @desc    Update pharmacy
 * @body    {
 *   "name": "Аптека №1",
 *   "address": "ул. Новая, 2",
 *   "coordinates": { "lat": 55.751244, "lng": 37.618423 },
 *   "workingHours": {
 *     "mon": { "open": "09:00", "close": "21:00" }
 *   }
 * }
 */
router.put("/:id", async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pharmacy) return res.status(404).json({ message: "Not found" });
    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/pharmacies/:id
 * @desc    Delete pharmacy
 */
router.delete("/:id", async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;