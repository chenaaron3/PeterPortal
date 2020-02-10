var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
const WebSocAPI = require('websoc-api');




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/websoc/:department/:courseNum', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  const opts = {
    term: '2020 Winter',

    department: req.params.department,
    courseNumber: req.params.courseNum
}
  const result = WebSocAPI.callWebSocAPI(opts);
  result.then((json) => res.json(json));
});

module.exports = router;
