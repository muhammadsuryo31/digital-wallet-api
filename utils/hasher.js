const bcrypt = require('bcrypt');

exports.hash = async (password) => {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword
}

exports.compare = async (inputedPassword, hashedPassword) => {
    const isSamePassword = await bcrypt.compare(inputedPassword, hashedPassword);
    return isSamePassword
}