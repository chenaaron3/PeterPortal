var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var subdomain = require('express-subdomain');

var cors = require('cors');
var dotenv = require('dotenv');
// var indexRouter = require('./routes/index');
var apiRouter = require('./api/v1');
// var usersRouter = require('./routes/users');
var reviewsRouter = require('./routes/reviews');
var coursesRouter = require('./routes/courses')
var professorsRouter = require('./routes/professors')
var weekRouter = require('./routes/week')

var app = express();
var mysql = require("mysql");

var corsOptions = {
	origin: "http://localhost:3000"
}
port = process.env.PORT || 3001;

// dotenv.config();

// Database connection
// app.use(function(req, res, next){
// 	res.locals.connection = mysql.createConnection({
// 		host     : process.env.REVIEWS_DB_ENDPOINT,
// 		user     : process.env.DB_USERNAME,
// 		password : process.env.DB_PASSWORD,
// 		database : 'peterportal'
// 	});
// 	res.locals.connection.connect();
// 	next();
// });

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Serve the api via subdomain api.peter-portal.com
app.use(subdomain('api', apiRouter));

// // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/reviews', reviewsRouter);
app.use("/courses", coursesRouter)
app.use("/professors", professorsRouter)
app.use("/week", weekRouter)

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/build/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.get('/', (req, res) => res.send('Hello World!'))

module.exports = app;