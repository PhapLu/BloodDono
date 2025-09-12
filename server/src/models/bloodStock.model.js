import mongoose from "mongoose";
const Schema = mongoose.Schema;

const DOCUMENT_NAME = "BloodStock";
const COLLECTION_NAME = "BloodStocks";

const InventorySchema = new Schema(
    {
        bloodType: {
            type: String,
            required: true,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        productType: {
            type: String,
            required: true,
            enum: ["Whole Blood", "Plasma", "Platelets", "Red Blood Cells", "Cryoprecipitate"],
        },
        quantity: { type: Number, required: true, default: 0 },
        unit: { type: String, enum: ["liters", "milliliters", "bags"], default: "milliliters" },
        thresholdLow: { type: Number, default: 0 },
        expiryDate: { type: Date },
        batchNumber: { type: String, trim: true },
        donorSource: { type: String, enum: ["Voluntary", "Replacement", "Paid"], trim: true },
        status: {
            type: String,
            enum: ["Available", "Low Stock", "Out of Stock"],
            default: "Available",
        },
    },
    { _id: false }
);

const BloodStockSchema = new Schema(
    {
        hospitalId: {
            type: Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
        lastUpdated: { type: Date, default: Date.now },
        inventory: [InventorySchema],
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

BloodStockSchema.index({ hospitalId: 1 });
BloodStockSchema.index({ "inventory.bloodType": 1, "inventory.productType": 1 });
BloodStockSchema.index({ "inventory.status": 1 });

const BloodStock = mongoose.model(DOCUMENT_NAME, BloodStockSchema);

export { BloodStock };
