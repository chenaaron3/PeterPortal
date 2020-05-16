const dotenv = require('dotenv');
const path = require('path')
var passport = require("passport");
var {executeQuery, escape} = require("../config/database.js")
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GitHubStrategy = require('passport-github').Strategy;

dotenv.config({ path: path.resolve(__dirname, '../.env') });

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    let sql = `SELECT * FROM users AS r WHERE r.email = ${escape(user.email)}`
    executeQuery(sql, function(results) {
        user.userID = results[0].user_id;
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: "/users/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            var userData = {
                email: profile.emails[0].value,
                name: profile.displayName,
                picture: profile._json.picture
            };
            done(null, userData);
        }
    )
);

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: (process.env.NODE_ENV == "development" ? "" : `https://${process.env.DOMAIN}`) + "/users/auth/facebook/callback",
    profileFields: ['id', 'emails', 'displayName', 'photos']
  },
  function(accessToken, refreshToken, profile, done) {
    var userData = {
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0].value
    };
    done(null, userData);
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: "/users/auth/github/callback",
    scope: [ 'user:email', 'user:displayName' ]
  },
  function(accessToken, refreshToken, profile, done) {
    var userData = {
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0].value,
        username: profile.username
    };
    done(null, userData);
  }
));