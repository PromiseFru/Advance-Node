var bcrypt = require('bcrypt');
var passport = require('passport');

module.exports = function (app, myDataBase) {
    app.route("/").get((req, res) => {
        res.render('pug', {
            showLogin: true,
            showRegistration: true,
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

    app.post("/login", passport.authenticate("local", {
        failureRedirect: "/"
    }), (req, res) => {
        res.redirect("/profile");
    })

    app.get("/profile", ensureAuthenticated, (req, res) => {
        res.render(__dirname + "views/pug/profile", {
            username: req.user.username,
        });
    })

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    })

    app.route('/register').post((req, res, next) => {
        const hash = bcrypt.hashSync(req.body.password, 12)
        myDataBase.findOne({
            username: req.body.username
        }, (err, user) => {
            if (err) {
                next(err);
            } else if (user) {
                req.redirect('/');
            } else {
                myDataBase.insertOne({
                    username: req.body.username,
                    password: hash
                }, (err, doc) => {
                    if (err) {
                        res.redirect('/');
                    } else {
                        next(null, doc.ops[0]);
                    }
                })
            }
        }, passport.authenticate('local', {
            failureRedirect: '/'
        }), (req, res, next) => {
            res.redirect('/profile');
        })
    })
}