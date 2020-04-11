import requests
import json
import os
import platform
import gspread
import time
import datetime
from oauth2client.service_account import ServiceAccountCredentials
from dotenv import load_dotenv
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options

import professorScraper
import courseScraper

PATH_TO_SELENIUM_DRIVER = os.path.abspath(os.path.join(os.path.dirname( __file__ ), 'chromedriver' + (".exe" if platform.system() == 'Windows' else "")))
# 
PATH_TO_JSON_KEY = "resources/google_sheet.json"
MISSING_PROF_FORM_URL = "https://docs.google.com/forms/d/1fZMDeRrarp4_prTz7aCn5wMh2UVz5U9jj9G26v8MoXs"
MISSING_PROF_SHEET_URL = "https://docs.google.com/spreadsheets/d/1L4TMYuz1IO6brM7wPO7qVUKtPHviLx8ZbuKOyApmHCo/"

# ASSUMED SHEET SCHEMA (timestamp, ucinetid, name, department, requesterEmail, status)
STATUS_CELL_ID = "F"

# Source: https://www.twilio.com/blog/2017/02/an-easy-way-to-read-and-write-to-a-google-spreadsheet-in-python.html
def authenticateGoogleSheets():
    # use creds to create a client to interact with the Google Drive API
    scope = scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name(PATH_TO_JSON_KEY, scope)
    client = gspread.authorize(creds)
    return client

def getSeleniumDriver():
    options = Options()
    options.headless = True
    return Chrome(executable_path=PATH_TO_SELENIUM_DRIVER, options=options)

# returns a list of related department groups
def getDepartmentGroups():
    departmentGroups = []
    f = open(professorScraper.PROFESSOR_DATA_NAME)
    professor_data = json.load(f)
    f.close()
    for professor in professor_data:
        if professor_data[professor]["relatedDepartments"] not in departmentGroups:
            departmentGroups.append(professor_data[professor]["relatedDepartments"])
    return departmentGroups

# Docs: https://github.com/burnash/gspread
def pollProfessorRequest():
    # open Google Sheets
    sheet = client.open_by_url(MISSING_PROF_SHEET_URL).sheet1
    # retrieve records
    records = sheet.get_all_records()
    numRecords = len(records)
    # if any new records were made
    if numRecords != pollProfessorRequest.totalRecords:
        print("CHANGE DETECTED!")
        # cache information
        leftOff = pollProfessorRequest.totalRecords
        pollProfessorRequest.totalRecords = numRecords
        # start processing from where we left off before
        for i in range(leftOff, len(records)):
            # if record has not been handled
            if records[i]["status"] == "":
                # try to add the professor
                status = addMissingProfessor(records[i]["ucinetid"], records[i]["name"], records[i]["department"])
                # update the status
                sheet.update(f"{STATUS_CELL_ID}{i + 2}", status)
                print(status)

# ucinetid: ucinetid from form
# name: name from form
# department: department from form
# returns the status of the update
def addMissingProfessor(ucinetid:str, name:str, department:str):
    print(f"Searching for {ucinetid}, {name}, {department}...")
    # check if not already indexed
    url = elasticEndpointURL + f"/professors/_doc/{ucinetid}"
    res = requests.get(url, auth=(os.getenv("ELASTIC_BASICAUTH_USER"), os.getenv("ELASTIC_BASICAUTH_PASS"))).json()
    # if already indexed
    if res["found"]:
        res = res["_source"]
        # check if requested department is not listed in related departments
        if department not in res["relatedDepartments"]:
            # save old history to compare later
            oldHistory = list(res["courseHistory"])
            # add to accepted departments
            res["relatedDepartments"].append(department)
            # search course history again
            professorScraper.getCourseHistory(res, name)
            # if found any new classes
            if len(res["courseHistory"]) > len(oldHistory):
                # find added classes
                addedClasses = set(res["courseHistory"]).difference(set(oldHistory))
                # update courses' professorHistory on elastic search
                updateProfessorHistory(ucinetid, addedClasses)
                # update professor on elastic search
                index(elasticEndpointURL + f"/professors/_doc/{ucinetid}", res)
                return f"UPDATED: Added {addedClasses}."
            else:
                return "NO EFFECT: Professor recieved no updates. Maybe the entered name or department is wrong."
        # otherwise mark as duplicate
        else:
            return "DUPLICATE: Professor with given department already exists in database."
    # if not already indexed
    else:
        # look up ucinetid from the directory
        res = professorScraper.getDirectoryInfo(driver, ucinetid)
        # if is a valid ucinetid
        if res != None:
            # get school
            res["school"] = deptToSchoolMap[department]
            # get relatedDepartments
            res["relatedDepartments"] = getRelatedDepartments(department)
            # get course history
            professorScraper.getCourseHistory(res, name)
            # if taught no courses
            if len(res["courseHistory"]) == 0:
                return "REJECTED: This professor has no course history. Maybe the entered name or department is wrong."
            else:
                # update courses' professorHistory on elastic search
                updateProfessorHistory(ucinetid, res["courseHistory"])
                # index professor on elastic search
                index(elasticEndpointURL + f"/professors/_doc/{ucinetid}", res)
                return "SUCCCESS: Added professor."
        # if is an invalid ucinetid
        else:
            return "ERROR: Invalid ucinetid."

# ucinetid: netid for professor that taught the courses in coursesIDs (eg. "psheu")
# courseIDs: list of courses to update (eg. ["EECS 116", "EECS 159B", "EECS 199"])
# returns nothing, directly alters data on elastic search
def updateProfessorHistory(ucinetid:str, courseIDs:list):
    for courseID in courseIDs:
        courseID = courseID.replace(" ","")
        url = elasticEndpointURL + f"/courses/_doc/{courseID}"
        res = requests.get(url, auth=(os.getenv("ELASTIC_BASICAUTH_USER"), os.getenv("ELASTIC_BASICAUTH_PASS"))).json()
        # if course exists
        if res["found"]:
            res = res["_source"]
            # if not already recorded
            if ucinetid not in res["professorHistory"]:
                # add professor
                res["professorHistory"].append(ucinetid)
                # reindex
                index(url, res)

# url: the url to send the request to
# data: the data to index
# returns nothing
def index(url:str, data:dict):
    headers = {
        'Content-type' : 'application/json'
    }
    r = requests.put(url, data=json.dumps(data), headers=headers, auth=(os.getenv("ELASTIC_BASICAUTH_USER"), os.getenv("ELASTIC_BASICAUTH_PASS")))

# department: a department to find a grouping for
# returns a department grouping
# Example: for "COMPSCI" return ["COMPSCI", "IN4MATX", "I&C SCI", "SWE", "STATS"]
def getRelatedDepartments(department:str):
    for departmentGroup in departmentGroups:
        if department in departmentGroup:
            return departmentGroup
    return []

if __name__ == "__main__":
    # activate .env
    load_dotenv()
    elasticEndpointURL = os.getenv("ELASTIC_ENDPOINT_URL")

    # create client to access sheets
    client = authenticateGoogleSheets()
    # create a Selenium Chrome driver
    driver = getSeleniumDriver()

    # create dept to school mapping
    f = open(courseScraper.DEPT_SCHOOL_MAP_NAME)
    deptToSchoolMap = json.load(f)
    f.close()
    # create related department groups
    departmentGroups = getDepartmentGroups()

    # initialize records to 0
    pollProfessorRequest.totalRecords = 0

    while True:
        print(f"{datetime.datetime.now()}: Polling")
        # poll sheets every 10 mins
        pollProfessorRequest()
        time.sleep(60 * 5)
    driver.quit()
