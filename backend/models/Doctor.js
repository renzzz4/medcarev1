const mongoose = require("mongoose");

const doctorSchema = mongoose.Schema({
  admin_id: {
    type: String
  },
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  hospital: {
    type: String,
    required: true,
  },
  hospital_address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
  });

const doctor = mongoose.model("doctor", doctorSchema);
module.exports = doctor;
