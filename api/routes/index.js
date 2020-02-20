var express = require("express");
var router = express.Router();
var fetch = require("node-fetch");
const WebSocAPI = require("websoc-api");

function ParsedCourseTime(timeString) {
  /*
  Used to parse the horribly inconsistent time string formats

  Assumptions:
  1. earliest possible course time is 6am
  2. latest possible course time is 9pm
  3. course durations never exceed 5 hours
  Acceptable Inputs:
  valid start hours        6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9
  valid start am hours     6,7,8,9,10,11
  valid start pm hours                   12,1,2,3,4,5,6,7,8,9
  valid end hours            7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10
  valid end am hours         7,8,9,10,11
  valid end pm hours                     12,1,2,3,4,5,6,7,8,9,10

  no +12h                                12

  Input: "Th &nbsp; 12:30-12:50p "
  */
  var MAX_DURATION = 5;

  var dashedSplit = timeString.split("-"); // ex. ["Th &nbsp; 12:30", "12:50p "]
  var dayBeginSplit = dashedSplit[0].split("&nbsp;"); // ex. ["Th ", " 12:30"]

  var beginTime = dayBeginSplit[dayBeginSplit.length - 1].trim(); // ex. "6:00"
  var endTime = dashedSplit[1].trim(); // "6:50p"

  var beginHour = parseInt(beginTime.split(":")[0]);
  var beginMin = parseInt(beginTime.split(":")[1]);

  var endHour = parseInt(endTime.split(":")[0]);
  var endMin = parseInt(endTime.split(":")[1].replace("p", ""));
  var isPm = endTime.indexOf("p") != -1;

  if (isPm) {
    var military = endHour == 12 ? 12 : endHour + 12;
    if (military - beginHour > MAX_DURATION) {
      beginHour += 12;
    }
    if (endHour != 12) {
      endHour += 12;
    }
  }

  // Ensures that minutes is always two digits
  // beginHour + ':' + ("0" + beginMin).slice(-2)
  return {
    beginHour: beginHour,
    beginMin: beginMin,
    endHour: endHour,
    endMin: endMin,
    sessionDuration: (endHour - beginHour) * 60 + endMin - beginMin
  };
}

function ParsedSectionsByDay(scheduleJson) {
  var courseSections = { M: [], Tu: [], W: [], Th: [], F: [] }

  for (var s in scheduleJson.schools[0].departments[0].courses[0]
    .sections) {
    var sections = scheduleJson.schools[0].departments[0].courses[0]
      .sections[s];
      console.log(sections);
    for (var m in sections.meetings) {
      var meeting = sections.meetings[m];
      if (/M/.test(meeting.days)) {
        courseSections.M.push({
          sectionType: sections.sectionType,
          instructors: sections.instructors,
          sectionNum: sections.sectionNum,
          bldg: meeting.bldg,
          time: ParsedCourseTime(meeting.time)
        });
      }
      if (/Tu/.test(meeting.days)) {
        courseSections.Tu.push({
          sectionType: sections.sectionType,
          instructors: sections.instructors,
          sectionNum: sections.sectionNum,
          bldg: meeting.bldg,
          time: ParsedCourseTime(meeting.time)
        });
      }
      if (/W/.test(meeting.days)) {
        courseSections.W.push({
          sectionType: sections.sectionType,
          instructors: sections.instructors,
          sectionNum: sections.sectionNum,
          bldg: meeting.bldg,
          time: ParsedCourseTime(meeting.time)
        });
      }
      if (/Th/.test(meeting.days)) {
        courseSections.Th.push({
          sectionType: sections.sectionType,
          instructors: sections.instructors,
          sectionNum: sections.sectionNum,
          bldg: meeting.bldg,
          time: ParsedCourseTime(meeting.time)
        });
      }
      if (/F/.test(meeting.days)) {
        courseSections.F.push({
          sectionType: sections.sectionType,
          instructors: sections.instructors,
          sectionNum: sections.sectionNum,
          bldg: meeting.bldg,
          time: ParsedCourseTime(meeting.time)
        });
      }
    }
}

console.log(courseSections);
return courseSections;
};




/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});


router.get("/websoc/:term/:department/:courseNum", function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  const opts = {
    term: req.params.term,
    department: req.params.department,
    courseNumber: req.params.courseNum
  };
  
 WebSocAPI.callWebSocAPI(opts).then(json => res.json(ParsedSectionsByDay(json)));

});

module.exports = router;
