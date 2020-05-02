var express = require('express');
var {executeQuery} = require('../config/database.js')
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

  executeQuery(sql, function(results) {
    res.send(JSON.stringify(results));
  });
})

router.get('/course', function(req, res, next)  {
  let sql = `SELECT * FROM reviews AS r WHERE r.course_id = "${req.query.courseID}" ORDER BY r.submitted_at DESC`

  executeQuery(sql, function(results) {
    res.send(JSON.stringify(results));
  });
})

router.post('/addReview', function(req, res) {
  
  const data = {
    text: req.body.text,
    rating: req.body.rating,
    difficulty: req.body.difficulty,
    userID: req.user ? `"${req.user.userID}"`: "NULL",
    courseID: req.body.courseID,
    profID: req.body.profID,
    date: req.body.date,  //format: "2020-02-10"
    grade: req.body.grade,
    pubStatus: req.user ? "published": "unverified"
  }

  let sql = `INSERT INTO reviews 
  (body, rating, difficulty, user_id, course_id, prof_id, submitted_at, grade, pub_status)
  VALUES( "${data.text}", ${data.rating}, ${data.difficulty}, ${data.userID}, "${data.courseID}", "${data.profID}", "${data.date}", "${data.grade}", "${data.pubStatus}")`

  executeQuery(sql, function(results) {
    res.send(JSON.stringify(results));
  });
})

router.put('/upVoteReview', function(req, res) {
  console.log("CHECK", req)
  let sql = `SELECT * FROM votes WHERE user_id="${req.user.userID}" AND review_id=${req.body.reviewID}`

  executeQuery(sql, function(results) {
    //if there is no vote
    if (results.length == 0) {
      sql = `UPDATE reviews SET up_votes = up_votes + 1 WHERE id = ${req.body.reviewID};
      INSERT INTO votes VALUES("${req.user.userID}", ${req.body.reviewID}, true);`

      executeQuery(sql, function(results) {
        res.send(JSON.stringify(results));
      });
    } else if (!results[0].up) {
      //change it to down review
      // sql = `UPDATE reviews SET up_votes = up_votes + 1, down_votes = down_votes - 1 WHERE id = ${req.body.reviewID};
      //   UPDATE votes SET up=true WHERE email="${req.user.email}" AND review_id=${req.body.reviewID};`

      // executeQuery(sql, function(results) {});
      res.send("You already downvoted the review.")
    } else { //if it is a upvote delete it
      sql = `UPDATE reviews SET up_votes = up_votes - 1 WHERE id = ${req.body.reviewID};
      DELETE FROM votes WHERE user_id="${req.user.userID}" AND review_id=${req.body.reviewID}`

      executeQuery(sql, function(results) {
        res.send(JSON.stringify(results));
      });
    }
  });
});

router.put('/downVoteReview', function(req, res) {
  let sql = `SELECT * FROM votes WHERE user_id="${req.user.userID}" AND review_id=${req.body.reviewID}`

  executeQuery(sql, function(results) {
    //if there is no vote
    if (results.length == 0) {
      sql = `UPDATE reviews SET down_votes = down_votes + 1 WHERE id = ${req.body.reviewID};
      INSERT INTO votes VALUES("${req.user.userID}", ${req.body.reviewID}, false);`

      executeQuery(sql, function(results) {
        res.send(JSON.stringify(results));
      });
    } else if (results[0].up) {
      //change it to down review
      // sql = `UPDATE reviews SET up_votes = up_votes - 1, down_votes = down_votes + 1 WHERE id = ${req.body.reviewID};
      //   UPDATE votes SET up=false WHERE email="${req.user.email}" AND review_id=${req.body.reviewID};`

      // executeQuery(sql, function(results) {});
      res.send("You already upvoted the review.")

    } else { //if it is a downvote delete it
      sql = `UPDATE reviews SET down_votes = down_votes - 1 WHERE id = ${req.body.reviewID};
      DELETE FROM votes WHERE user_id="${req.user.userID}" AND review_id=${req.body.reviewID};`

      executeQuery(sql, function(results) {
        res.send(JSON.stringify(results));
      });
    }
  });
});

// router.put('/flagReview', function(req, res) {  
//   let sql = `UPDATE reviews SET flagged=true WHERE id = ${req.body.reviewID}`
//   connection.query(sql, function (error, results, fields) {
//     if(error) throw error;
//     res.send(JSON.stringify(results));
//   });
// });

// router.get('/getFlagged', function(req, res) {
//   let sql = `SELECT * FROM reviews AS r WHERE r.flagged = true`
//   connection.query(sql, function(error, results, fields) {
//     if(error) throw error;
//     res.send(JSON.stringify(results));
//   })
// })

router.delete('/deleteReview', function(req, res) {
  let sql = `DELETE FROM reviews WHERE id = ${req.body.reviewID}`

  executeQuery(sql, function(results) {
    res.send(JSON.stringify(results));
  });
})


module.exports = router;
