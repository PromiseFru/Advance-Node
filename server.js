"use strict";
require('dotenv').config()
const express = require("express");
const myDB = require('./connection');
const fccTesting = require("./freeCodeCamp/fcctesting.js");
var session = require('express-session');
var passport = require('passport');
var routes = require('./routes');
var auth = require('./auth');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));

app.use(passport.initialize());
app.use(passport.session());

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.set('view engine', 'pug');

myDB(async client => {
  const myDataBase = await client.db("test").collection("users");

  routes(app, myDataBase);

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found')
  })

  auth(app, myDataBase);
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