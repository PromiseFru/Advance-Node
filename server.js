"use strict";
require('dotenv').config()
const express = require("express");
const myDB = require('./connection');
const fccTesting = require("./freeCodeCamp/fcctesting.js");
var session = require('express-session');
var passport = require('passport');
var ObjectID = require("mongodb").ObjectID;
var LocalStrategy = require('passport-local');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');

myDB(async client => {
  const myDataBase = await client.db("test").collection("users");

  app.route("/").get((req, res) => {
    res.render('pug', {
      showLogin: true,
      title: "Connected to Database",
      message: "Please Login"
    });
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  app.post("/login", passport.authenticate("local", {failureRedirect: "/"}), (req, res) => {
    res.redirect("/profile");
  })

  app.get("/profile", ensureAuthenticated, (req, res) => {
    res.render(__dirname + "views/pug/profile");
  })

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      myDataBase.findOne({ username: username }, function (err, user) {
        console.log('User '+ username +' attempted to log in.');
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (password !== user.password) { return done(null, false); }
        return done(null, user);
      });
    }
  ));

}).catch(err => {
  app.route("/").get((req, res) => {
    res.render("pug", {
      title: err,
      message: "Unable to Login"
    });
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});