import mongoose from "mongoose";
const Schema = mongoose.Schema;

const DOCUMENT_NAME = "Hospital";
const COLLECTION_NAME = "Hospitals";

const HospitalSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        region: { type: String, trim: true },
        address: { type: String, trim: true },
        contact: {
            phone: { type: String, trim: true },
            email: { type: String, trim: true },
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

HospitalSchema.index({ name: 1, city: 1 });

const Hospital = mongoose.model(DOCUMENT_NAME, HospitalSchema);

export { Hospital };
