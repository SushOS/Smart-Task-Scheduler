const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the username"],
    },
    fullname: {
        type: String,
        required: [true, "Please add the Full Name"],
    },
    email: {
      type: String,
      required: [true, "Please add the contact email address"],
      unique: [true, "Email already taken"]
    },
    phone: {
        type: Number,
        required: [true, "Please add the contact number"],
    },
    password: {
      type: String,
      required: [true, "Please add the user password"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);