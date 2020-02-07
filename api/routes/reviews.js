var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource reviews');
});

router.get('/professor', function(req, res, next)  {
    res.locals.connection.query('select * from Reviews', function (error, results, fields) {
        if(error) throw error;
        res.send(JSON.stringify(results));
    });
})

module.exports = router;
