"use strict";
require('dotenv').config()
const express = require("express");
const myDB = require('./connection');
const fccTesting = require("./freeCodeCamp/fcctesting.js");
var routes = require('./routes');
var auth = require('./auth');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({
  url: URI
});

const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('view engine', 'pug');

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
);

myDB(async client => {
  const myDataBase = await client.db("test").collection("users");

  routes(app, myDataBase);

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found')
  })

  auth(app, myDataBase);

  let currentUsers = 0;

  io.on('connection', socket => {
    console.log('A user has connected');
    ++currentUsers;
    io.emit('user', {
      name: socket.request.user.name,
      currentUsers,
      connected: true
    });
    socket.on('chat message', (message) => {
      io.emit('chat message', { name: socket.request.user.name, message });
    });
    
    socket.on('disconnect', () => {
      console.log('A user has disconnected');
      --currentUsers;
      io.emit('user', {
        name: socket.request.user.name,
        currentUsers,
        connected: false
      });
    });
  });
}).catch(err => {
  app.route("/").get((req, res) => {
    res.render("pug", {
      title: err,
      message: "Unable to Login"
    });
  });
});

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');

  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io:', message);
  accept(null, false);
}

http.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});