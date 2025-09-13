// seedHospitals.js
import mongoose from "mongoose";
import hospitals from "./hospital.js";
import dotenv from 'dotenv'
import { Hospital } from "../models/hospital.model.js";
dotenv.config()

const MONGODB_URI = 'mongodb+srv://phapluu2k5tqt:PhapNhat987AZ@cluster0.hadhzxi.mongodb.net/BloodDoDo?retryWrites=true&w=majority&appName=Cluster0';
console.log("Using MongoDB URI:", MONGODB_URI);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);

    // Xóa cũ nếu muốn
    await Hospital.deleteMany({});
    console.log("🗑️ Cleared old hospitals");

    // Insert mới
    await Hospital.insertMany(hospitals);
    console.log("✅ Inserted hospitals:", hospitals.length);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
