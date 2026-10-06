const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 3,
      maxlength: 150
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: 5,
      maxlength: 5000
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["academic", "event", "exam"]
    },
    postedDate: {
      type: Date,
      default: Date.now
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

noticeSchema.index({ category: 1, postedDate: -1 });

module.exports = mongoose.model("Notice", noticeSchema);
