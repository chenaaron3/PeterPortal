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

router.get("/auth/google",
  function(req, res) {
    req.session.returnTo = req.headers.referer;
    passport.authenticate("google", { scope: ["profile", "email"]})(req, res);
  }
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: true }),
  callbackHandler
);

router.get('/auth/facebook',
  function(req, res){
    req.session.returnTo = req.headers.referer;
    passport.authenticate('facebook', { scope : ['email'] })(req, res);
  });

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/', session: true }),
  callbackHandler
);

function callbackHandler(req, res){
  let sql = `SELECT * FROM users AS r WHERE r.email = "${req.user.email}"`
  executeQuery(sql, function(results) {
    if (results.length == 0) {
      let sql = `INSERT INTO users VALUES('${req.user.email}', '${req.user.name}')`
      
      executeQuery(sql, function(results) {
        console.log(results)
      });
    }
  });

  let returnTo = req.session.returnTo;
  delete req.session.returnTo;    
  res.redirect(returnTo);
}

router.get('/logout', function(req, res){
  console.log('SESSION', req.session)
  console.log('USER', req.user)
  req.logout();
  res.redirect('back');
});

module.exports = router;
