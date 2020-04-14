var express = require('express');
var router = express.Router();
var fetch = require("node-fetch");
const cheerio = require('cheerio');

/* GET users listing. */
router.get('/', function(req, res, next) {
    let date = new Date(Date.now());
    date = new Date("03/30/2020");
    let year = date.getFullYear();
    getQuarterMapping(year, (mapping) => {
        respondWeek(date, mapping, res)
    })
    getQuarterMapping(year - 1, (mapping) => {
        respondWeek(date, mapping, res)
    })
});

function respondWeek(date, mapping, res)
{
    Object.keys(mapping).forEach(function(quarter) {
        if(date >= mapping[quarter]["begin"] && date <= mapping[quarter]["end"])
        {
            try{
                res.send(`Week ${Math.floor(dateSubtract(mapping[quarter]["begin"], date) / 7) + 1}, ${quarter}`);
            }
            catch{
                // summer session will hit twice
            }
        }
    });
}

function strip(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

function isInteger(num){
    return !isNaN(parseInt(num, 10))
}

function getDate(month, day, year)
{
    return new Date(`${month}/${day}/${year}`)
}

function dateSubtract(date1, date2)
{
    // To calculate the time difference of two dates 
    let Difference_In_Time = date2.getTime() - date1.getTime(); 
    // To calculate the no. of days between two dates 
    return Difference_In_Time / (1000 * 3600 * 24); 
}

async function getQuarterMapping(year, callback)
{
    // maps quarter description to day range
    let quarterToDayMapping = {}
    // url to academic calendar
    let url = `https://reg.uci.edu/calendars/quarterly/${year}-${year+1}/quarterly${year%100}-${(year%100)+1}.html`
    let res = await fetch(url);
    let text = await res.text();
    // scrape the calendar
    let $ = cheerio.load(text);
    // load all tables
    let tables = $('table[class="calendartable"]').toArray()
    tables.forEach(table => {
        processTable(table, $, quarterToDayMapping, year);
    })
    callback(quarterToDayMapping);
}

function processTable(table, $, quarterToDayMapping, year)
{
    // find the tbody
    let tbody = $(table).find('tbody')
    // reference all rows in the table
    let rows = tbody.find("tr").toArray()
    // the first row has all the labels for the table
    let tableLabels = $(rows[0]).find("td").toArray()
    // whether this table has instruction dates or not
    let validTable = false;
    rows.forEach(row => {
        // if found a valid row, the table is valid
        if(processRow(row, $, quarterToDayMapping, tableLabels, year))
            validTable = true;
    })
}

function processRow(row, $, quarterToDayMapping, tableLabels, year){
    let validTable = false;
    // get all information from row
    let rowInfo = $(row).find("td").toArray()
    if($(rowInfo[0]).text() == "Instruction begins")
    {
        for(let i = 1; i < 4; i++)
        {
            validTable = true;
            let dic = {};
            let tableLabel = strip($(tableLabels[i]).text());
            quarterToDayMapping[tableLabel] = dic;
            splitRowInfo = $(rowInfo[i]).text().split(" ");
            let month = splitRowInfo[0];
            let day = splitRowInfo[1];
            let myYear = tableLabel.split(" ")[1];
            myYear = isInteger(myYear) ? myYear : year + 1;
            dic["begin"] = getDate(month, day, myYear);
        }
    }
    else if($(rowInfo[0]).text() == "Instruction ends")
    {
        for(let i = 1; i < 4; i++)
        {
            let tableLabel = strip($(tableLabels[i]).text());
            splitRowInfo = $(rowInfo[i]).text().split(" ");
            let month = splitRowInfo[0];
            let day = splitRowInfo[1];
            let myYear = tableLabel.split(" ")[1];
            myYear = isInteger(myYear) ? myYear : year + 1;            
            quarterToDayMapping[tableLabel]["end"] = getDate(month, day, myYear);
        }
    }
    return validTable;
}

module.exports = router;