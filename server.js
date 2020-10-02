"use strict";
require('dotenv').config()
const express = require("express");
const myDB = require('./connection');
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.route("/").get((req, res) => {
  //Change the response to render the Pug template
  res.render(__dirname + '/views/pug/index', {title: "Hello", message: "Please login"});
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});