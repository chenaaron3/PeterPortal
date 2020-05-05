var express = require('express');
var router = express.Router();
var fetch = require("node-fetch");
var {executeQuery} = require('../config/database.js')

router.post('/_search', function(req, res, next) {
  r = fetch(process.env.ELASTIC_ENDPOINT_URL + "/professors/_search", 
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
  r.then((response) => response.json())
  .then((data) => res.send(data))
});

// gives average overall rating for professor
router.get("/avgRating", function(req, res, next){
  let sql = `SELECT AVG(rating) AS avgRating
             FROM reviews AS r 
             WHERE r.prof_id = "${req.query.profID}"`
  executeQuery(sql, function(results) {
    res.send(JSON.stringify(results));
  });
})

// gives average rating for professor grouped by classes
router.get("/avgRatings", function(req, res, next){
  let sql = `SELECT AVG(rating) AS avgRating, course_id
             FROM reviews AS r 
             WHERE r.prof_id = "${req.query.profID}"
             GROUP BY course_id`
  executeQuery(sql, function(results) {
    res.send(JSON.stringify(results));
  });
})

// gives average overall difficulty for professor
router.get("/avgDifficulty", function(req, res, next){
  let sql = `SELECT AVG(difficulty) AS avgDifficulty 
             FROM reviews AS r 
             WHERE r.prof_id = "${req.query.profID}"`
  executeQuery(sql, function(results) {
    res.send(JSON.stringify(results));
  });
})

// gives average difficulty for professor grouped by classes
router.get("/avgDifficulties", function(req, res, next){
  let sql = `SELECT AVG(difficulty) AS avgRating, course_id
             FROM reviews AS r 
             WHERE r.prof_id = "${req.query.profID}"
             GROUP BY course_id`
  executeQuery(sql, function(results) {
    res.send(JSON.stringify(results));
  });
})

module.exports = router;
