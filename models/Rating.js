const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true 
  },
  rating: { 
    type: Number,
    min:1,
    max:5,
  },
});

const RatingModel = mongoose.model("Rating", RatingSchema);
module.exports = RatingModel;
