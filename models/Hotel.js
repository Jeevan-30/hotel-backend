const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true 
  },
  hotelname: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  rating: {
    type: [Number], 
    default: []    
  },
  price: {
    type: Number,
    required: false 
  },
  image: {
    type: String,
    required: false 
  },
  review: {
    type: [String], 
    default: []    
  },
  rooms: {
    type: Number,
    required: true, 
    min: 1          
  },
  room_image1: {
    type: String,
  },
  room_image2: {
    type: String,
  },
  room_image3: {
    type: String,
  },
});

const HotelModel = mongoose.model("Hotel", HotelSchema);
module.exports = HotelModel;
