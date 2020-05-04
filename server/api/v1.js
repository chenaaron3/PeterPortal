var express = require("express");
var router = express.Router();
var fetch = require("node-fetch");
var coursesJson = require("./courses.json")
var ScheduleParser = require("./schedule-parser.js")
const WebSocAPI = require("websoc-api");

router.get('/', function(req, res) {
  res.send('Welcome to our API!');
});

// returns a list of all courses
router.get("/v1/courses", function(req, res, next) {
  fetch(process.env.ELASTIC_ENDPOINT_URL_COURSES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 
        JSON.stringify({"_source": ["id", "name"],
        "query": {
            "match_all":{}
          },
        "size": 10000
        })
  }).then((response) => response.json()).then((data) => res.send(generateArrayOfCourses(data)));
});

function generateArrayOfCourses(result) {
  var array_result = []
  result.hits.hits.forEach((e) => {
    array_result.push({course: e._source.id, name: e._source.name})
  })
  return {count: array_result.length, courses: array_result}
}

router.get("/v1/courses/:id", function(req, res, next) {
  fetch(process.env.ELASTIC_ENDPOINT_URL_COURSES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 
       JSON.stringify({
        "query": {
          "terms": {
            "_id": [ req.params.id ] 
          }
        }
      })
  }).then((response) => response.json()).then((data) => res.send(data.hits.hits[0]._source));
});

router.get("/v1/schedule/:term/:id", function(req, res, next) {
  // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  const opts = {
    term: req.params.term,
    department: coursesJson["courses"][req.params.id]["dept"],
    courseNumber: coursesJson["courses"][req.params.id]["num"]
  };
    
  WebSocAPI.callWebSocAPI(opts).then(json => res.json(
    {term: req.params.term, 
     course: coursesJson["courses"][req.params.id]["dept"] + " " + coursesJson["courses"][req.params.id]["num"],
     name: coursesJson["courses"][req.params.id]["name"],
     sessions: ScheduleParser.ParsedSectionsByDay(json) }));
});

module.exports = router;
