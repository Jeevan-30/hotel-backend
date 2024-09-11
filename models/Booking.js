const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true 
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true 
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  custNo: {
    type: String,
    required: true
  },
  checkInDate: { 
    type: Date,
    required: true
  },
  checkOutDate: { 
    type: Date,
    required: true
  },
  totalPrice: { 
    type: Number
  }
});

const BookingModel = mongoose.model("Booking", BookingSchema);
module.exports = BookingModel;
