const mongoose = require("mongoose");

const CalendarSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Calendar", CalendarSchema);
