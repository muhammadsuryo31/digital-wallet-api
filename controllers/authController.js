const User = require("./../models/userModel");
const { generateToken } = require("./../utils/JWT");
const { compare } = require("./../utils/hasher");
const mailer = require("./../utils/mailer");
const crypto = require("crypto");

exports.userAuth = async (req, res, next) => {
  try {
    const type = req.body.type;
    if (type === "register") {
      const newUser = await User.create(req.body.userData);
      newUser.password = undefined;
      newUser.__v = undefined;
      try {
        const mailData = {
          email: newUser.email,
          subject: "account confirmation",
          message: `thank you for joining us, as one last step please confirm your registration by click the following link: ${
            req.protocol
          }://${req.get("host")}/api/v1/users/verify/${newUser._id}`,
        };
        await mailer(mailData);
        return res.status(201).json({
          status: "success",
          message:
            "your account have been registered, please check you email for account confirmation",
        });
      } catch (error) {
        return res.status(400).json(error);
      }
    }
    if (type === "login") {
      const user = await User.findOne({
        email: req.body.userData.email,
      }).select("+password");
      if (!user) {
        return res.status(400).json({
          status: "fail",
          message: "Wrong email or password",
        });
      }
      if (!user.isVerified) {
        return res.status(401).json({
          status: "fail",
          message: "this user has not confirm his/her registration",
        });
      }
      const isPasswordMatch = await compare(
        req.body.userData.password || "none",
        user.password
      );
      if (!isPasswordMatch) {
        return res.status(400).json({
          status: "fail",
          message: "Wrong email or password",
        });
      }
      const access_token = await generateToken({ id: user._id });
      res.status(200).json({
        status: "success",
        access_token,
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "there is no user with this email",
      });
    }
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
    const access_token = await generateToken({ id: user._id });
    res.status(200).json({
      status: "success",
      message: "your account are now verified and are ready to use",
      access_token,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.deleteCurrentUser = async (req, res, next) => {
  console.log("masuk sini");
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({
      status: "success",
      message: "your account has been deleted successfully",
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "no user found with this email address",
      });
    }
    const emergencyPassword = user.generateEmergencyPassword();
    await user.save({ validateBeforeSave: false });
    try {
      const mailData = {
        email: user.email,
        subject: "password reset link",
        message: `to reset your password please click the following link: ${
          req.protocol
        }://${req.get(
          "host"
        )}/api/v1/users/reset-password/${emergencyPassword}`,
      };
      await mailer(mailData);
      return res.status(201).json({
        status: "success",
        message: "please open your email for the link to reset your password",
      });
    } catch (err) {
      user.emergencyPassword = undefined;
      user.emergencyPasswordExpiryDate = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        status: "fail",
        message: "password reset fail, please try again",
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (!req.body.password || !req.body.passwordConfirmation) {
      return res.status(400).json({
        status: "fail",
        message: "please provide new password and new passwordConfirmation",
      });
    }
    const hashedPasswod = crypto
      .createHash("sha256")
      .update(req.params.emergencyPassword)
      .digest("hex");
    const user = await User.findOne({
      emergencyPassword: hashedPasswod,
      emergencyPasswordExpiryDate: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "emergency password is invalid or expired",
      });
    }
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    user.emergencyPassword = undefined;
    user.emergencyPasswordExpiryDate = undefined;
    await user.save();
    res.status(200).json({
      status: "success",
      message:
        "password updated successfully please login to confirm that your password has been reset",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        status: "fail",
        message:
          "please provide your current password, your new password, and also confrimation of your new password",
      });
    }
    const isSamePassword = await compare(currentPassword, req.user.password);
    if (!isSamePassword) {
      return res.status(400).json({
        status: "fail",
        message: "your current password does not match",
      });
    }
    const user = req.user;
    user.password = newPassword;
    user.passwordConfirmation = newPasswordConfirm;
    await user.save();
    access_token = await generateToken({ id: user._id });
    res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.checkWalletTag = async (req, res, next) => {
  try {
    const { candidateWalletTag } = req.body;
    console.log(candidateWalletTag);
    const usedWalletTag = await User.findOne({"wallet.walletTag": candidateWalletTag});
    console.log(usedWalletTag);
    if(!usedWalletTag) {
      return res.status(200).json({
        status: 'success',
        message: 'this walletTag has not been used'
      })
    }
    res.status(401).json({
      status: 'fail',
      message: 'this walletTag has been used'
    })
  } catch (error) {
    res.status(400).json(error)
  }
};
