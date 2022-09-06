const Transaction = require("./../models/transactionModel");
const filterRequestBody = require("./../utils/requestBodyFilter");
const User = require("./../models/userModel");

exports.postTransaction = async (req, res, next) => {
  try {
    const user = req.user;
    const transactionData = filterRequestBody(
      req.body,
      "ammount",
      "recheiverWalletTag",
      "transactionMessage"
    );
    if (user.wallet.walletTag === transactionData.recheiverWalletTag) {
      return res.status(400).json({
        status: "fail",
        message: "cannot transfer to yourself",
      });
    }
    const otherUser = await User.findOne({
      "wallet.walletTag": transactionData.recheiverWalletTag,
    });
    if (!otherUser) {
      return res.status(404).json({
        status: "fail",
        message: "no user with this walletTag is found",
      });
    }
    transactionData.senderName = user.name;
    transactionData.senderWalletTag = user.wallet.walletTag;
    transactionData.recheiverName = otherUser.name;
    const estimatedBalance = user.wallet.balance - transactionData.ammount;
    const estimatedOtherUserBalance =
      otherUser.wallet.balance * 1 + transactionData.ammount * 1;
    console.log(user._id);
    console.log(otherUser._id);
    await User.findByIdAndUpdate(
      user._id,
      { $set: { "wallet.balance": estimatedBalance } },
      {
        new: true,
        runValidators: true,
      }
    );
    const updatedOtherUser = await User.findByIdAndUpdate(
      otherUser._id,
      { $set: { "wallet.balance": estimatedOtherUserBalance } },
      {
        new: true,
        runValidators: true,
      }
    );
    console.log(updatedOtherUser);
    const transaction = await Transaction.create(transactionData);
    transaction.__v = undefined;
    res.status(201).json({
      status: "success",
      data: {
        transaction,
      },
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const queryObject = { ...req.query };
    const excludeKeyword = ["page", "sort", "limit", "fields"];
    excludeKeyword.forEach((el) => {
      delete queryObject[el];
    });
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt|regex)\b/g,
      (match) => `$${match}`
    );
    let query = Transaction.find({
      $or: [
        { senderWalletTag: req.user.wallet.walletTag },
        { recheiverWalletTag: req.user.wallet.walletTag },
      ],
    });
    query = query.find(JSON.parse(queryString));

    if (req.query.sort) {
      const multipleSorter = req.query.sort.split(",").join(" ");
      query = query.sort(multipleSorter);
    } else {
      query = query.sort("-transactionsDate");
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    const numberOfData = await Transaction.countDocuments();
    const transactions = await query;
    res.status(200).json({
      status: "success",
      results: transactions.length,
      limit: limit,
      numberOfData,
      data: {
        transactions,
      },
    });
  } catch (error) {
    res.status(400).json(error);
  }
};
