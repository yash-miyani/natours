const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protact, viewController.getAccount);
router.get('/my-tours', authController.protact, viewController.getMyTours);
router.post(
  '/submit-user-data',
  authController.protact,
  viewController.updateUserData,
);

module.exports = router;
