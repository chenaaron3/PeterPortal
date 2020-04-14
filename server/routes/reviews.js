var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource reviews');
});

router.post("/post", function(req, res, next){
  console.log("Hi Poster!", JSON.stringify(req.body));
})

router.get('/professor', function(req, res, next)  {
  let sql = `SELECT * FROM reviews AS r WHERE r.prof_id = "${req.query.profID}" ORDER BY r.submitted_at DESC`

  res.locals.connection.query(sql, function (error, results, fields) {
      if(error) throw error;
      res.send(JSON.stringify(results));
  });
})

router.get('/course', function(req, res, next)  {
  let sql = `SELECT * FROM reviews AS r WHERE r.course_id = "${req.query.courseID}" ORDER BY r.submitted_at DESC`
  
  res.locals.connection.query(sql, function (error, results, fields) {
      if(error) throw error;
      res.send(JSON.stringify(results));
  });
})

router.post('/addReview', function(req, res) {
  
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')

  const data = {
    text: req.body.text,
    rating: req.body.rating,
    difficulty: req.body.difficulty,
    userID: req.body.userID,
    courseID: req.body.courseID,
    profID: req.body.profID,
    date: req.body.date,  //format: "2020-02-10"
    grade: req.body.grade,
    forCredit: req.body.forCredit,
  }

  let sql = `INSERT INTO reviews 
  (body, rating, difficulty, user_id, course_id, prof_id, submitted_at, grade, for_credit)
  VALUES( "${data.text}", ${data.rating}, ${data.difficulty}, "${data.userID}", "${data.courseID}", "${data.profID}", "${data.date}", "${data.grade}", ${data.forCredit})`

  res.locals.connection.query(sql , function(error, results, fields) {
    if(error) throw error;
    res.send(JSON.stringify(results));
  });
})

router.put('/upVoteReview', function(req, res) {
  let sql = `UPDATE reviews SET up_votes = up_votes + 1 WHERE id = ${req.body.reviewID}`

  res.locals.connection.query(sql, function(error, results, fields) {
    if(error) throw error;
    res.send(JSON.stringify(results));
  });
});

router.put('/downVoteReview', function(req, res) {
  let sql = `UPDATE reviews SET down_votes = down_votes + 1 WHERE id = ${req.body.reviewID}`

  res.locals.connection.query(sql, function(error, results, fields) {
    if(error) throw error;
    res.send(JSON.stringify(results));
  });
});



// router.put('/flagReview', function(req, res) {  
//   let sql = `UPDATE reviews SET flagged=true WHERE id = ${req.body.reviewID}`
//   res.locals.connection.query(sql, function (error, results, fields) {
//     if(error) throw error;
//     res.send(JSON.stringify(results));
//   });
// });

// router.get('/getFlagged', function(req, res) {
//   let sql = `SELECT * FROM reviews AS r WHERE r.flagged = true`
//   res.locals.connection.query(sql, function(error, results, fields) {
//     if(error) throw error;
//     res.send(JSON.stringify(results));
//   })
// })

router.delete('/deleteReview', function(req, res) {
  let sql = `DELETE FROM reviews WHERE id = ${req.body.reviewID}`

  res.locals.connection.query(sql, function(error, results, fields) {
    if(error) throw error;
    res.send(JSON.stringify(results));
  })
})


module.exports = router;
