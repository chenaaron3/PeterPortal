var fs = require('fs')
var path = require('path');
var flatCache = require('flat-cache');

let CACHE_DIRECTORY = path.resolve('./api/v1/cache');

// returns if directory existed before
function checkDirectoryExists(){
    if(!fs.existsSync(CACHE_DIRECTORY)){
        fs.mkdirSync(CACHE_DIRECTORY);
        return false;
    }
    else{
        return true;
    }
}

// returns if doc existed before
function checkDocExists(docID){
    checkDirectoryExists();
    // construct the path
    let docPath = path.join(CACHE_DIRECTORY, docID)
    // create doc if it doesn't exist
    if (!fs.existsSync(docPath)) {
        fs.writeFile(docPath, "{}", function(err){if (err) throw err;})
        return false;
    }
    else{
        return true;
    }
}

// each route has its own doc (Example: "/api/v1/courses" has its own doc)
// each endpoint is the key (Example: "all" is a key)
let cacheMiddleware = (req, res, next) => {
    // Example: "apiv1courses"
    let docID = req.baseUrl.replace(/\//g, "");
    // Example: "all"
    let key = req.path;
    checkDocExists(docID);
    // create the cache given the doc
    let cache = flatCache.load(docID, CACHE_DIRECTORY);
    // check cache
    let value = cache.getKey(key)
    // cache hit
    if (value) {
        hit();
        res.json(value);
        return;
    }
    // cache miss
    else {
        res.jsonResponse = res.json;
        // overwrite res.json to save in cache before sending to client
        res.json = (body) => {
            miss();
            cache.setKey(key, body);
            cache.save(true);
            res.jsonResponse(body);
        }
        next();
    }
};

// uses general cache
let getKey = (key) => {
    let docID = "general"; 
    checkDocExists(docID);
    // create the general cache
    let cache = flatCache.load(docID, CACHE_DIRECTORY);
    let cacheValue = cache.getKey(key);
    // parse the value if it exists
    if(cacheValue){
        return JSON.parse(cacheValue);
    }
    else{
        return cacheValue;
    }
}

// uses general cache
let setKey = (key, value) => {
    let docID = "general"; 
    checkDocExists(docID);
    // create the general cache
    let cache = flatCache.load(docID, CACHE_DIRECTORY);
    // store the stringified json value
    cache.setKey(key, JSON.stringify(value));
    cache.save(true);
}

// uses statistic cache
let hit = () => {
    console.log("CACHE HIT!");
    let docID = "statistics"; 
    checkDocExists(docID);
    // create the statistic cache
    let cache = flatCache.load(docID, CACHE_DIRECTORY);
    // get the current hit value
    cache.setKey("hits", cache.getKey("hits") + 1)
    cache.save(true);
}

// uses statistic cache
let miss = () => {
    console.log("CACHE MISS!");
    let docID = "statistics"; 
    checkDocExists(docID);
    // create the statistic cache
    let cache = flatCache.load(docID, CACHE_DIRECTORY);
    // get the current miss value
    cache.setKey("misses", cache.getKey("misses") + 1)
    cache.save(true);
}

// returns data from statistics cache
let statistics = () => {
    let docID = "statistics"; 
    checkDocExists(docID);
    // create the statistic cache
    let cache = flatCache.load(docID, CACHE_DIRECTORY);
    return {hits:cache.getKey("hits"),misses:cache.getKey("misses")}
}

// clear cache doc
let clearCacheByID = (docID) => {
    checkDirectoryExists();
    let docPath = path.join(CACHE_DIRECTORY, docID);
    // check if doc exists
    if (fs.existsSync(docPath)) {
        flatCache.clearCacheById(docID, CACHE_DIRECTORY);
        return `Cleared ${docID}! Remaining docs: ${fs.readdirSync(CACHE_DIRECTORY)}`;
    }
    else{
        return `${docID} not found! Available docs: ${fs.readdirSync(CACHE_DIRECTORY)}`;
    }
}

// clear all docs
let clearCacheAll = () => {
    if(!checkDirectoryExists()){
        return `Cache already cleared!`;
    }
    else{
        let numFiles = fs.readdirSync(CACHE_DIRECTORY).length;
        // clears all docs
        flatCache.clearAll(CACHE_DIRECTORY);
        return `Cleared ${numFiles} docs!`;
    }
}

module.exports = {cacheMiddleware, getKey, setKey, hit, miss, statistics, clearCacheByID, clearCacheAll };