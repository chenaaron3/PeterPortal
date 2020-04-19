const dotenv = require('dotenv');
const path = require('path')
var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;


dotenv.config({ path: path.resolve(__dirname, '../.env') });


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: "/users/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            console.log(profile)
            var userData = {
                email: profile.emails[0].value,
                name: profile.displayName,
                token: accessToken
            };
            done(null, userData);
        }
    )
);

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: "/users/auth/facebook/callback",
    profileFields: ['id', 'emails', 'displayName']
  },
  function(accessToken, refreshToken, profile, done) {
    var userData = {
        email: profile.emails[0].value,
        name: profile.displayName,
    };
    done(null, userData);
  }
));