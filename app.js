var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
var mongoose = require('mongoose');

require('dotenv').config();

// Connect to database
var mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, {useUnifiedTopology: true, useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

// Set up session middleware
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true}));

// Set up passport.js for user authentication
passport.use(
  new LocalStrategy((username, password, cb) => {
      User.findOne({username: username}, (err, user) => {
          if (err) { return cb(err); }
          // User not found
          if (!user) {
              return cb(null, false, {message: 'Incorrect username'});
          }
          // Check password
          bcrypt.compare(password, user.password, (err, res) => {
              if (res) {
                  // Correct, log in
                  return cb(null, user);
              } else {
                  // Incorrect
                  return cb(null, false, {message: 'Incorrect password'});
              }
          });
      });
  })
);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
      cb(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: false}));

// Add local user variable
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// Set up routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Set up express app and view engine
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
