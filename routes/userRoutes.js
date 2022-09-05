const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const userController = require('./../controllers/userController');
const authenticate = require("./../middlewares/authenticate");

router.route("/auth").post(authController.userAuth);
router.route("/verify/:userId").patch(authController.verifyUser);
router.route("/forgot-password").post(authController.forgotPassword);
router
  .route("/reset-password/:emergencyPassword")
  .patch(authController.resetPassword);
router.route("/check-walletTag").get(authController.checkWalletTag);

router.use(authenticate);
router.route("/delete-account").delete(authController.deleteCurrentUser);
router.route("/change-password").patch(authController.changePassword);
router.route("/").get(userController.getCurrentUserAll);
router.route('/wallets').get(userController.getCurrentUserWallet);
router.route('/profiles').get(userController.getCurrentUserProfile).patch(userController.patchCurrentUserProfile);
router.route('/friends').get(userController.getCurrentUserFriends).patch(userController.patchCurrentUserFriends);

module.exports = router;
