const { verify } = require('./../utils/JWT');
const User = require('./../models/userModel')

const authenticate = async (req, res, next) => {
    try {
        const access_token = req.headers.access_token
        if(!access_token) {
            return res.status(400).json({
                status: 'fail',
                message: 'you are not logged in'
            })
        }
        const tokenData = await verify(access_token);
        const user = await User.findById(tokenData.id).select('+password')
        if(!user) {
            return res.status(400).json({
                status: 'fail',
                message: 'no user found'
            })
        }
        const isPasswordChange = user.changePasswordAfter(tokenData.iat);
        if (isPasswordChange) {
          return res.status(401).json({
            status: 'fail',
            message: 'user with this token is changing the password, please do a re-login'
          })
        }
        req.user = user
        next();
    } catch (error) {
        res.status(400).json(error)
    }
}

module.exports = authenticate