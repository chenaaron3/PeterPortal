var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource reviews');
});

router.get('/professor', function(req, res, next)  {
  let sql = `SELECT * FROM Reviews AS r WHERE r.profID = "${req.query.profID}" ORDER BY r.dateSubmitted DESC`
    res.locals.connection.query(sql, function (error, results, fields) {
        if(error) throw error;
        res.send(JSON.stringify(results));
    });
})

router.get('/course', function(req, res, next)  {
  let sql = `SELECT * FROM Reviews AS r WHERE r.courseID = "${req.query.courseID}" ORDER BY r.dateSubmitted DESC`
    res.locals.connection.query(sql, function (error, results, fields) {
        if(error) throw error;
        res.send(JSON.stringify(results));
    });
})

router.post('/addReview', function(req, res) {
  const data = {
    text: req.body.text,
    rating: req.body.rating,
    userID: req.body.userID,
    courseID: req.body.courseID,
    profID: req.body.profID,
    date: req.body.date,  //format: "2020-02-10"
    grade: req.body.grade,
    forCredit: req.body.forCredit,
  }
  let sql = `INSERT INTO Reviews 
  (reviewText, rating, userID, courseID, profID, dateSubmitted, grade, forCredit, flagged)
  VALUES( "${data.text}", ${data.rating}, ${data.userID}, ${data.courseID}, ${data.profID}, "${data.date}", "${data.grade}", ${data.forCredit}, False)`
  res.locals.connection.query(sql , function(error, results, fields) {
    if(error) throw error;
    res.send(JSON.stringify(results));
  });
})

router.put('/flagReview', function(req, res) {  
  let sql = `UPDATE Reviews SET flagged=true WHERE reviewID = ${req.body.reviewID}`
  res.locals.connection.query(sql, function (error, results, fields) {
    if(error) throw error;
    res.send(JSON.stringify(results));
  });
});




module.exports = router;
