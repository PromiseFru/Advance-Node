"use strict";
require('dotenv').config()
const express = require("express");
const myDB = require('./connection');
const fccTesting = require("./freeCodeCamp/fcctesting.js");
var routes = require('./routes');
var auth = require('./auth');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const app = express();

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

  io.on('connection', socket => {
    console.log('A user has connected');
  });
  
}).catch(err => {
  app.route("/").get((req, res) => {
    res.render("pug", {
      title: err,
      message: "Unable to Login"
    });
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});