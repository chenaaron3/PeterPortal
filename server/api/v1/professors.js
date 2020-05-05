var express = require("express");
var router = express.Router();
var fetch = require("node-fetch");

const PROFESSOR_INDEX = "professors";

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
router.get("/", function (req, res, next) {
    fetch(`${process.env.ELASTIC_ENDPOINT_URL}/${PROFESSOR_INDEX}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:
            JSON.stringify({
                "_source": ["ucinetid", "name"],
                "query": {
                    "match_all": {}
                },
                "size": 10000
            })
    }).then((response) => response.json())
        .then((data) => res.json(generateArrayOfProfessors(data)))
        .catch((err) => res.status(400).send(err.toString()));
});

// result: data returned from elasticsearch
// returns refined information about all professors
function generateArrayOfProfessors(result) {
    var array_result = []
    result.hits.hits.forEach((e) => {
        array_result.push({ ucinetid: e._source.ucinetid, name: e._source.name })
    })
    return { count: array_result.length, professors: array_result }
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
router.get("/:ucinetid", function (req, res, next) {
    getProfessor(req.params.ucinetid, function (err, data) {
        if (err)
            res.status(400).send(err.toString());
        else {
            res.json(data);
        }
    });
});

function getProfessor(ucinetid, callback) {
    fetch(`${process.env.ELASTIC_ENDPOINT_URL}/${PROFESSOR_INDEX}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:
            JSON.stringify({
                "query": {
                    "terms": {
                        "_id": [ucinetid]
                    }
                }
            })
    }).then((response) => response.json())
        .then((data) => callback(null, data.hits.hits[0]._source))
        .catch((err) => callback(err, null));
}

module.exports = router;