import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Uncomment these if needed
  // role: {
  //     type: String,
  //     enum: ["user", "admin"],
  //     default: "user"
  // },
  // isActive: {
  //     type: Boolean,
  //     default: true
  // },
  // createdDate: {
  //     type: Date,
  //     default: Date.now
  // },
  // lastLogin: {
  //     type: Date
  // }
});

const UserModel = mongoose.model("user", userSchema);

export { UserModel };
