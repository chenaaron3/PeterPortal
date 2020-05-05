var express = require("express");
var router = express.Router();
var fetch = require("node-fetch");
var coursesJson = require("./courses.json")
var ScheduleParser = require("./schedule-parser.js")
const WebSocAPI = require("websoc-api");
var swaggerRouter = require("../config/swagger");

const COURSE_INDEX = "courses";
const PROFESSOR_INDEX = "professors";

// route to documentation
router.use("/docs", swaggerRouter);

router.get('/', function(req, res) {
  res.send('Welcome to our API!');
});

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course Descriptions
 */

/**
 * @swagger
 * path:
 *  /courses/:
 *    get:
 *      summary: Get all courses
 *      tags: [Courses]
 *      responses:
 *        "200":
 *          description: A list of course id and names
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  count:
 *                    type: integer
 *                    example: 1
 *                  courses:
 *                    $ref: '#/components/schemas/CourseList'
 */
router.get("/courses", function(req, res, next) {
  fetch(`${process.env.ELASTIC_ENDPOINT_URL}/${COURSE_INDEX}/_search`, {
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
  }).then((response) => response.json())
  .then((data) => {console.log(data); return res.json(generateArrayOfCourses(data))})
  .catch((err) => res.status(400).send(err.toString()));
});

// result: data returned from elasticsearch
// returns refined information about all courses
// Example:
// {
//   "count":5898,
//   "courses":[{
//               "courseID":"ACENG20D",
//               "name":"Academic Writing"
//              },...]
// }
function generateArrayOfCourses(result) {
  var array_result = []
  result.hits.hits.forEach((e) => {
    array_result.push({courseID: e._source.id.replace(/ /g,''), name: e._source.name})
  })
  return {count: array_result.length, courses: array_result}
}

/**
 * @swagger
 * path:
 *  /courses/{courseID}:
 *    get:
 *      summary: Get detailed information for a specific course
 *      tags: [Courses]
 *      parameters:
 *        - in: path
 *          name: courseID
 *          required: true
 *          schema:
 *            $ref: '#/components/schemas/CourseID'
 *      responses:
 *        "200":
 *          description: Detailed information for a class
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CourseDetails'
 */
router.get("/courses/:courseID", function(req, res, next) {
  getCourse(req.params.courseID, function(err, data){
    if(err)
      res.status(400).send(err.toString());
    else{
      res.json(data);
    }
  });
});

function getCourse(id, callback){
  fetch(`${process.env.ELASTIC_ENDPOINT_URL}/${COURSE_INDEX}/_search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: 
     JSON.stringify({
      "query": {
        "terms": {
          "_id": [ id ] 
        }
      }
    })
  }).then((response) => response.json())
  .then((data) => callback(null, data.hits.hits[0]._source))
  .catch((err) => callback(err, null));
}

/**
 * @swagger
 * tags:
 *   name: Professors
 *   description: Professor Information
 */

/**
 * @swagger
 * path:
 *  /professors/:
 *    get:
 *      summary: Get all professors
 *      tags: [Professors]
 *      responses:
 *        "200":
 *          description: A list of professor ucinetid and names
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  count:
 *                    type: integer
 *                    example: 1
 *                  professors:
 *                    $ref: '#/components/schemas/ProfessorList'
 */
router.get("/professors", function(req, res, next){
  fetch(`${process.env.ELASTIC_ENDPOINT_URL}/${PROFESSOR_INDEX}/_search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: 
      JSON.stringify({"_source": ["ucinetid", "name"],
      "query": {
          "match_all":{}
        },
      "size": 10000
      })
  }).then((response) => response.json())
  .then((data) => {console.log(data); return res.json(generateArrayOfProfessors(data))})
  .catch((err) => res.status(400).send(err.toString()));
});

// result: data returned from elasticsearch
// returns refined information about all professors
// Example:
// {
//   "count":1547,
//   "professors":[{
//               "ucinetid":"kakagi",
//               "name":"Kei Akagi"
//              },...]
// }
function generateArrayOfProfessors(result) {
  var array_result = []
  result.hits.hits.forEach((e) => {
    array_result.push({ucinetid: e._source.ucinetid, name: e._source.name})
  })
  return {count: array_result.length, professors: array_result}
}

/**
 * @swagger
 * path:
 *  /professors/{ucinetid}:
 *    get:
 *      summary: Get detailed information for a specific professor
 *      tags: [Professors]
 *      parameters:
 *        - in: path
 *          name: ucinetid
 *          required: true
 *          schema:
 *            $ref: '#/components/schemas/ProfessorID'
 *      responses:
 *        "200":
 *          description: Detailed information for a professor
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ProfessorDetails'
 */
router.get("/professors/:ucinetid", function(req, res, next) {
  getProfessor(req.params.ucinetid, function(err, data){
    if(err)
      res.status(400).send(err.toString());
    else{
      res.json(data);
    }
  });
});

function getProfessor(ucinetid, callback){
  fetch(`${process.env.ELASTIC_ENDPOINT_URL}/${PROFESSOR_INDEX}/_search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: 
     JSON.stringify({
      "query": {
        "terms": {
          "_id": [ ucinetid ] 
        }
      }
    })
  }).then((response) => response.json())
  .then((data) => callback(null, data.hits.hits[0]._source))
  .catch((err) => callback(err, null));
}

// term: school year + season (eg. "2020 Spring")
// id: the courseID with no spaces (eg. "COMPSCI143A")
// returns schedule information for a course 
router.get("/schedule/:term/:id", function(req, res, next) {
  getCourse(req.params.id, function(err, data){
    const opts = {
      term: req.params.term,
      department: data["id_department"],
      courseNumber: data["id_number"]
    };
      
    WebSocAPI.callWebSocAPI(opts).then(json => res.json(
      {term: req.params.term, 
       course: data["id"],
       name: data["name"],
       sessions: ScheduleParser.ParsedSectionsByDay(json) }));
  });
});

module.exports = router;
