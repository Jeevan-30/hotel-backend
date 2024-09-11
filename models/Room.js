const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true 
  },
  roomNo: { 
    type: Number,
    required: true,
  },
  status:{
    type:String,
    enum: ['available', 'unavailable'],
    default: 'available'
  }
});

const RoomModel = mongoose.model("Room", RoomSchema);
module.exports = RoomModel;
