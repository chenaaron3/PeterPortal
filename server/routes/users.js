var express = require('express');
var passport = require("passport");
var executeQuery = require("../config/database.js")
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.user);
});

router.get('/getName', function(req, res, next) {
  res.json( {name: req.user ? req.user.name: undefined});
});

router.get('/loggedIn', function(req, res, next) {
  res.json({status: req.user ? true: false});
});

/* GET Google Authentication API. */
router.get("/auth/google",
  function(req, res) {
    req.session.returnTo = req.headers.referer;
    passport.authenticate("google", { scope: ["profile", "email"]})(req, res);
  }
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: true }),
  function(req, res) {
      var token = req.user.token;
      let sql = `SELECT * FROM users AS r WHERE r.email = "${req.user.email}"`
      executeQuery(sql, function(results) {
        if (results.length == 0) {
          let sql = `INSERT INTO users VALUES('${req.user.email}', '${req.user.name}')`
          
          executeQuery(sql, function(results) {
            console.log(results)
          });
        }
      });
      // let age = 1000 * 60 * 60 * 24 // 1 day
      // res.cookie('email', req.user.email, { maxAge: age, httpOnly: true, secure: true});
      // res.cookie('name', req.user.name, { maxAge: age, httpOnly: true, secure: true});
      let returnTo = req.session.returnTo;
      delete req.session.returnTo;    
      res.redirect(returnTo);
  }
);

router.get('/logout', function(req, res){
  console.log('SESSION', req.session)
  console.log('USER', req.user)
  req.logout();
  res.redirect('back');
});


module.exports = router;
