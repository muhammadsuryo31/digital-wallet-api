const User = require("./../models/userModel");
const filterRequestBody = require('./../utils/requestBodyFilter')

exports.getCurrentUserAll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "no user with this id found",
      });
    }
    user.passwordChangeAt = undefined;
    user.__v = undefined;
    user.isVerified = undefined;
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.getCurrentUserWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "no user with this id found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        wallet: user.wallet,
      },
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.getCurrentUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "no user with this id found",
      });
    }
    const profile = {
      name: user.name,
      email: user.email,
      age: user.age,
      walletTag: user.wallet.walletTag,
    }
    res.status(200).json({
      status: "success",
      data: {
        profile
      },
    });
  } catch (error) {
    res.status(400).json(error);
  }
}

exports.getCurrentUserFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "no user with this id found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        friends: user.friends,
      },
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.patchCurrentUserProfile = async (req, res, next) => {
  try {
    const updatedData = filterRequestBody(req.body, 'name', 'email', 'age')
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedData, {
      new: true, runValidators: true
    });
    const profile = {
      name: updatedUser.name,
      email: updatedUser.email,
      age: updatedUser.age,
      walletTag: updatedUser.wallet.walletTag,
    }
    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    })
  } catch (error) {
    res.status(400).json(error);
  }
}

exports.patchCurrentUserFriends = async (req, res, next) => {
  try {
    const user = req.user
    if(user.wallet.walletTag === req.body.walletTag) {
      return res.status(400).json({
        status: 'fail',
        message: 'cannot add yourself'
      })
    }
    if (user.friends.includes(req.body.walletTag)) {
      return res.status(400).json({
        status: 'fail',
        message: 'this person is already in your friends list'
      })
    }
    const otherUser = await User.findOne({'wallet.walletTag': req.body.walletTag})
    if(!otherUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'no user with this walletTag is found'
      })
    }
    user.friends.push(otherUser.wallet.walletTag)
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    })
  } catch (error) {
    console.log(error);
    res.status(400).json(error)
  }
}