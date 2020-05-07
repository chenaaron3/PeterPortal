var express = require('express');
var router = express.Router();
var {executeQuery, escape} = require('../config/database.js')

const REVIEW_STATUSES = ["published", "removed", "unverified"];

router.use('*', function(req, res, next){
    if(req.session.passport && req.session.passport.admin){
        console.log("Permission Granted!");
        next();
    }
    else{
        // res.status(401).send("You must be have administrative priviledge! Please login with Github first!")
        next();
    }
});

// get reviews of all statuses
router.get("/reviews", function(req, res){
    // couters to tell if all asynchronous functions are done
    count = 0
    finish = REVIEW_STATUSES.length;
    data = {};
    REVIEW_STATUSES.forEach((status) => {
        let sql = `SELECT * FROM reviews AS r 
        WHERE r.pub_status = "${status}" 
        ORDER BY r.submitted_at DESC`;
        // execute asynchronously
        executeQuery(sql, function(results) {
            count += 1;
            data[status] = results
            if(count == finish){
                res.json(data);
            }
        });
    })
});

// set the status of a review
// reviewID: the review to change the status of
// status: the new status to change it to
router.put("/reviews/setStatus", function(req, res){
    if(!REVIEW_STATUSES.includes(req.body.status)){
        res.status(400).send(`Invalid Status! Given: ${req.body.status}. Accepted: ${REVIEW_STATUSES}`);
        return;
    }
    let sql = `UPDATE reviews SET pub_status = ${escape(req.body.status)} WHERE id = ${req.body.reviewID}`
    executeQuery(sql, function(results) {
        res.json(results);
    });
});


//get all flagged reviews that need to be checked
router.get("/flagged", function(req, res){
    let sql = `SELECT * 
        FROM flagged as f, reviews as r
        WHERE f.review_id = r.id AND flag_status='pending' 
        ORDER BY reported_at ASC`;

    executeQuery(sql, function(results) {
        res.json(results);
    });
});

//update a flagged review
//status: 
router.put("/flagged/update", function(req, res){
    let sql = `UPDATE flagged
        SET flag_status = '${req.body.status}', fulfilled_at='${req.body.date}', fulfill_by='${req.body.username}'
        WHERE flag_id = ${req.body.flagID};`
    
    executeQuery(sql, function(results) {
        res.json(results);
    });
});


module.exports = router;