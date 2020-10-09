require('dotenv').config();
var ObjectID = require("mongodb").ObjectID;
var LocalStrategy = require('passport-local');
var passport = require('passport');
var session = require('express-session');
var GitHubStrategy = require('passport-github').Strategy;

module.exports = function (app, myDataBase) {
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

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        myDataBase.findOne({
            _id: new ObjectID(id)
        }, (err, doc) => {
            done(null, doc);
        });
    });

    passport.use(new LocalStrategy(
        function (username, password, done) {
            myDataBase.findOne({
                username: username
            }, function (err, user) {
                console.log('User ' + username + ' attempted to log in.');
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (!bcrypt.compareSync(password, user.password)) {
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ));

    passport.use(new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: 'https://repl.it/@FruPromise/auth/github/callback'
        },
        function (accessToken, refreshToken, profile, cb) {
            console.log(profile);
            //Database logic here with callback containing our user object
        }
    ));
}