require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    const username = "BkgisAdmin";
    const password = "Bkgis@098765";

    const exists = await Admin.findOne({ username });
    if (exists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);

    await Admin.create({
      username,
      password: hashed,
    });

    console.log("Admin created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}

createAdmin();
