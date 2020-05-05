var express = require("express");
var router = express.Router();
var fetch = require("node-fetch");

const COURSE_INDEX = "courses";

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
router.get("/", function (req, res, next) {
    fetch(`${process.env.ELASTIC_ENDPOINT_URL}/${COURSE_INDEX}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:
            JSON.stringify({
                "_source": ["id", "name"],
                "query": {
                    "match_all": {}
                },
                "size": 10000
            })
    }).then((response) => response.json())
        .then((data) => { console.log(data); return res.json(generateArrayOfCourses(data)) })
        .catch((err) => res.status(400).send(err.toString()));
});

// result: data returned from elasticsearch
// returns refined information about all courses
function generateArrayOfCourses(result) {
    var array_result = []
    result.hits.hits.forEach((e) => {
        array_result.push({ courseID: e._source.id.replace(/ /g, ''), name: e._source.name })
    })
    return { count: array_result.length, courses: array_result }
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
router.get("/:courseID", function (req, res, next) {
    getCourse(req.params.courseID, function (err, data) {
        if (err)
            res.status(400).send(err.toString());
        else {
            res.json(data);
        }
    });
});

function getCourse(id, callback) {
    fetch(`${process.env.ELASTIC_ENDPOINT_URL}/${COURSE_INDEX}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:
            JSON.stringify({
                "query": {
                    "terms": {
                        "_id": [id]
                    }
                }
            })
    }).then((response) => response.json())
        .then((data) => callback(null, data.hits.hits[0]._source))
        .catch((err) => callback(err, null));
}

module.exports = router;