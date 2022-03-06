var express = require('express');
var router = express.Router();

// GET index page
router.get('/', function(req, res, next) {
  if (typeof currentUser !== 'undefined' && currentUser) {
    // User is logged in, redirect to home page
    res.redirect('/home');
  } 
  else {
    // Redirect to login page
    res.redirect('/log-in');  
  }
});

// GET home page
router.get('/home', function(req, res, next) {
  res.render('home', {title: 'Members Only'});
});

// GET log in page
router.get('/log-in', function(req, res, next) {
  res.render('log-in', {title: 'Log in'});
})

module.exports = router;
