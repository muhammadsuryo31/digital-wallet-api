const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    ammount: {
        type: Number,
        required: [true, 'a transaction must have an ammount to be transfered']
    },
    transactionsDate: {
        type: Date,
        default: Date.now()
    },
    senderName: {
        type: String,
        required: [true, 'a transaction must have sender name']
    },
    senderWalletTag: {
        type: String,
        required: [true, 'a transaction must have sender wallettag']
    },
    recheiverName: {
        type: String,
        required: [true, 'a transaction must have recheiver name']
    },
    recheiverWalletTag: {
        type: String,
        required: [true, 'a transaction must have recheiver wallettag']
    },
    transactionMessage: {
        type: String
    }
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction;