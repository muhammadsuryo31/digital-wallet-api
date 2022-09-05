const mongoose = require("mongoose");
const walletSchema = require("./walletModel");
const validator = require("validator");
const { hash } = require("./../utils/hasher");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "email is required to register"],
    unique: [true, "user with this email already exist"],
    trim: true,
    lowerCase: true,
    validate: [validator.isEmail, "please provide a valid email"],
  },
  name: {
    type: String,
    reqired: true,
    trim: true,
    minlength: [3, "A name must at least have 3 charaters or more"],
    maxlength: [30, "A name must not have more than 30 characters"],
  },
  age: {
    type: Number,
    required: [true, "User must have an age"],
    min: [2, "user age must be more than or equal to 2"],
  },
  wallet: {
    type: walletSchema,
    required: [true, "User must have a wallet"],
  },
  password: {
    type: String,
    required: [true, "A password is required to register"],
    trim: true,
    minlength: [8, "A password must at least have 8 charaters or more"],
    select: false,
  },
  passwordConfirmation: {
    type: String,
    required: [true, "Please confirm the password"],
    trim: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "password is not the same",
    },
  },
  passwordChangeAt: {
    type: Date,
  },
  emergencyPassword: {
    type: String,
  },
  emergencyPasswordExpiryDate: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  friends: [String],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hash(this.password);
  this.passwordConfirmation = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 50000;
  next();
});

userSchema.methods.changePasswordAfter = function (JWTTimestap) {
  if (this.passwordChangeAt) {
    const changedTimestap = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTTimestap < changedTimestap;
  }
  return false;
};

userSchema.methods.generateEmergencyPassword = function () {
  const emergencyPassword = crypto.randomBytes(32).toString("hex");
  this.emergencyPassword = crypto
    .createHash("sha256")
    .update(emergencyPassword)
    .digest("hex");
  this.emergencyPasswordExpiryDate = Date.now() + 10 * 60 * 1000;
  return emergencyPassword;
};

const User = mongoose.model('User', userSchema);

module.exports = User;