var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Message = require('../models/message');
const { body, validationResult } = require('express-validator');

// For authentication
var bcrypt = require('bcryptjs');
var passport = require('passport')
var LocalStrategy = require("passport-local").Strategy;

// Middleware to check login
function checkLogin(req, res, next) {
  if (req.user) {
    next();
  }
  else {
    res.redirect('/log-in');
  }
}

// GET index page
router.get('/', checkLogin, function(req, res, next) {
  res.redirect('/home');
});

// GET home page
router.get('/home', checkLogin, function(req, res, next) {
  // Find all messages to show on home page
  Message.find({}).sort({timestamp: -1}).populate('author').
    exec(function(err, results) {
      if (err) { return next(err); }
      // Success, render page
      res.render('home', {title: 'Members Only', posts: results});
    });
});

// GET sign up page
router.get('/sign-up', function(req, res, next) {
  res.render('sign-up', {title: 'Sign up'});
});

// POST from sign up page for user creation
router.post('/sign-up', [
  // Validate and sanitize user information
  body('first_name').trim().isLength({min: 1}).withMessage('First name must not be empty.').isAlpha('es-ES').withMessage('First name must contain only letters.').escape(),
  body('last_name').trim().isLength({min: 1}).withMessage('Last name must not be empty.').isAlpha('es-ES').withMessage('Last name must contain only letters.').escape(),
  body('birthday', 'Invalid birthday date.').optional({checkFalsy: true}).isISO8601().toDate(),
  body('username').trim().isLength({min: 1}).withMessage('Username must not be empty.').isAlphanumeric('en-US', {ignore: '-_'}).withMessage('Username must contain only letters, numbers, underscores or hyphens.').escape().
    custom(username => {
      // Check if username is already in use
      var takenUser = User.findOne({'username': username});
      if (takenUser != null) {
        // Add error if in use
        throw new Error('Username is already in use.');
      }
      return true;
    }),

  // Password validation
  body('password').trim().isLength({min: 8}).withMessage('Password must not have at least 8 characters.').custom(password => {
    // Create password regular expression
    var pattern = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@!%\*#\?])(?=.{8,})');
    if (!pattern.test(password)) {
      throw new Error('Password doesn\'t meet requirements: at least one lowercase letter, one uppercase letter, a number and a especial character ($, @, !, %, *, # or ?).')
    }
    return true;
  }),

  // Process request
  (req, res, next) => {
    // Validate password confirmation
    body('password_conf').trim().isLength({min: 1}).withMessage('Password confirmation is required.').custom(password_conf => {
      // Check if it matches original password
      if(password_conf !== req.body.password) {
        throw new Error('Password and confirmation must match.');
      }
      return true;
    });
    // Extract validation errors
    const errors = validationResult(req);

    // Create temporary user
    var user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      birthday: req.body.birthday,
      username: req.body.username,
      password: '',
      membership: false,
      admin: false
    });

    if (!errors.isEmpty()) {
      // Render page with error messages
      res.render('sign-up', {title: 'Sign up', user: user, errors: errors.array()});
      return;
    }
    else {
      // Secure password using bcrypt
      bcrypt.hash(req.body.password, 10, (err, hashed) => {
        if (err) { return next(err); }
        // Change password in created user and save to DB
        user.password = hashed;
        user.save(err => {
          if (err) { return next(err); }
          // Success, redirect to index
          res.redirect('/');
        })
      })
    }
  }
]);

// GET log in page
router.get('/log-in', function(req, res, next) {
  res.render('log-in', {title: 'Log in'});
});

// POST to log in user
router.post('/log-in', 
  passport.authenticate('local', {successRedirect: '/home', failureRedirect: '/log-in', failureFlash: true}),);

// POST to log out user
router.post('/log-out', function(req, res, next) {
  req.logOut();
  res.redirect('/');
});

// GET to form to create a new message
router.get('/new-message', checkLogin, function(req, res, next) {
  res.render('new-message', {title: 'Create a message'});
});

// POST a new message
router.post('/new-message', checkLogin, [
  // Sanitize and validate input
  body('title', 'Title must not be empty.').trim().isLength({min: 1}).escape(),
  body('content', 'Content must not be empty.').trim().isLength({min: 1}).escape(),

  // Process request
  (req, res, next) => {
    // Extract errors
    const errors = validationResult(req);

    // Create temporary message
    var message = new Message({
      title: req.body.title,
      content: req.body.content,
      timestamp: Date.now(),
      author: req.user.id
    });

    if (!errors.isEmpty()) {
      // There are errors, render form with error messages
      res.render('new-message', {title: 'Create a message', message: message, errors: errors.array()});
    }
    else {
      // No errors, save message and redirect to home page
      message.save(err => {
        if (err) { return next(err); }
        res.redirect('/home');
      });
    }
  }
]);

// GET to delete message page
router.get('/delete/:id', checkLogin, function(req, res, next) {
  // Get message from id
  Message.findById(req.params.id).populate('author').
    exec(function(err, result) {
      if (err) { return next(err); }

      // Throw error if message not found
      if (result == null) {
        var err = new Error('Message not found.');
        err.status = 404;
        return next(err);
      }

      // Throw error if user doesn't have permissions
      if (!(req.user.admin || req.user.id.toString() == result.author._id.toString())) {
        var err = new Error('You\'re not allowed to perform this operation. Only admins and message authors can delete messages.');
        err.status = 403;
        return next(err);
      }

      // Render delete page
      res.render('delete-message', {title: 'Delete message', message: result});
    });
});

// POST to delete message
router.post('/delete/:id', checkLogin, function(req, res, next) {
  // Get message from id and remove
  Message.findByIdAndRemove(req.params.id, function deleteMessage(err) {
    if (err) { return next(err); }
    // Success, redirect to home page
    res.redirect('/home');
  });
});

module.exports = router;
