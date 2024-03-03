const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname:String,
  lastname:String,
  email: String,
  password: String,
  cpassword: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
