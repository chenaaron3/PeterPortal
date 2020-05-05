var express = require("express");
var router = express.Router();
var ScheduleParser = require("./schedule-parser.js")
const WebSocAPI = require("websoc-api");

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