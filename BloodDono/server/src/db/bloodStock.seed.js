import mongoose from "mongoose";
import { Hospital } from "../models/hospital.model.js";
import { BloodStock } from "../models/bloodStock.model.js";
import dotenv from 'dotenv'
dotenv.config()

// Enumerations
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PRODUCT_TYPES = [
    "Whole Blood",
    "Plasma",
    "Platelets",
    "Red Blood Cells",
    "Cryoprecipitate",
];
const DONOR_SOURCES = ["Voluntary", "Replacement", "Paid"];

// Random helper
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate inventory for one hospital
function generateInventory() {
    const inventory = [];

    BLOOD_TYPES.forEach((bloodType) => {
        PRODUCT_TYPES.forEach((productType) => {
            let quantity;

            // Rare types (O-, AB-) → often low or zero
            if (["O-", "AB-"].includes(bloodType)) {
                quantity = Math.random() < 0.4 ? 0 : randInt(0, 10) * 100;
            }
            // Common types (O+, A+) → usually more
            else if (["O+", "A+"].includes(bloodType)) {
                quantity = randInt(10, 60) * 100;
            }
            // Others → moderate range
            else {
                quantity = randInt(5, 30) * 100;
            }

            inventory.push({
                bloodType,
                productType,
                quantity,
                unit: "milliliters",
                thresholdLow: 500,
                expiryDate: new Date(
                    Date.now() + randInt(5, 40) * 24 * 60 * 60 * 1000
                ),
                batchNumber: `BATCH-${Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase()}`,
                donorSource:
                    DONOR_SOURCES[randInt(0, DONOR_SOURCES.length - 1)],
                status:
                    quantity === 0
                        ? "Out of Stock"
                        : quantity < 500
                        ? "Low Stock"
                        : "Available",
            });
        });
    });

    return inventory;
}

async function seedBloodStocks() {
    try {
        await mongoose.connect(
            'mongodb+srv://phapluu2k5tqt:PhapNhat987AZ@cluster0.hadhzxi.mongodb.net/BloodDoDo?retryWrites=true&w=majority&appName=Cluster0'
        );
        console.log("✅ Connected to MongoDB");

        await BloodStock.deleteMany({});
        console.log("🗑️ Cleared old blood stock");

        const hospitals = await Hospital.find({});
        const docs = hospitals.map((h) => ({
            hospitalId: h._id,
            inventory: generateInventory(),
        }));

        await BloodStock.insertMany(docs);
        console.log(
            `🎉 Inserted blood stocks for ${hospitals.length} hospitals`
        );

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding blood stocks:", err);
        process.exit(1);
    }
}

seedBloodStocks();
