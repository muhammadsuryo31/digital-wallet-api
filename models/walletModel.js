const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    walletTag: {
        type: String,
        required: [true, 'Please provide a walletTag'],
        trim: true,
        unique: true,
        minlength: [5, 'walletTag must at least contain 5 characters or more'],
        maxlength: [50, 'walletTag must not contain more than 50 characters']
    },
    balance: {
        type: Number,
        default: 0,
        min: [0, 'balance must not be lower than zero']
    }
})

module.exports = walletSchema;