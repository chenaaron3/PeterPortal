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
# URL TO FORM EDIT: https://docs.google.com/forms/d/1fZMDeRrarp4_prTz7aCn5wMh2UVz5U9jj9G26v8MoXs
# URL TO FORM FILL: https://forms.gle/Y5SjHoHM7iW4bes17
PATH_TO_JSON_KEY = "resources/google_sheet.json"
MISSING_PROF_SHEET_URL = "https://docs.google.com/spreadsheets/d/1L4TMYuz1IO6brM7wPO7qVUKtPHviLx8ZbuKOyApmHCo/"
# ASSUMED SHEET SCHEMA (timestamp, ucinetid, name, department, requesterEmail, status)
STATUS_CELL_ID = "F"
ADMIN_APPROVE_STATUS = "APPROVE" 

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
    faculty_links = professorScraper.getFacultyLinks(driver)
    for link in faculty_links:
        department_soup = professorScraper.scrape(driver, link.replace("#faculty","#courseinventory"))
        department_codes = professorScraper.getAllDepartmentCodes(department_soup)
        # backup related departments
        if len(department_codes) == 0:
            department_codes = professorScraper.getHardcodedDepartmentCodes(link)
        if department_codes not in departmentGroups:
            departmentGroups.append(department_codes)
    return departmentGroups

# Docs: https://github.com/burnash/gspread
def pollProfessorRequest():
    # open Google Sheets
    sheet = client.open_by_url(MISSING_PROF_SHEET_URL).sheet1
    # retrieve records
    records = sheet.get_all_records()
    numRecords = len(records)
    # find all indices of records that have an approved status
    approvedRecordIndices = [i for i in range(len(records)) if records[i]["status"] == ADMIN_APPROVE_STATUS]
    # if any new records were made or an approval has been made
    if numRecords != pollProfessorRequest.totalRecords or len(approvedRecordIndices) > 0:
        print("CHANGE DETECTED!")
        # cache information
        leftOff = pollProfessorRequest.totalRecords
        pollProfessorRequest.totalRecords = numRecords
        indicesToCover = set(range(leftOff, len(records)))
        indicesToCover.update(approvedRecordIndices)
        # start processing from where we left off before or deal with approved records
        for i in sorted(indicesToCover):
            currentStatus = records[i]["status"]
            # if record has not been handled or admin has approved of an entry
            if currentStatus == "" or currentStatus == ADMIN_APPROVE_STATUS:
                # try to add the professor
                status = addMissingProfessor(records[i]["ucinetid"], records[i]["name"], records[i]["department"], currentStatus)
                # update the status
                sheet.update(f"{STATUS_CELL_ID}{i + 2}", status)
                print(status)

# ucinetid: ucinetid from form (eg. "igassko")
# name: name from form  (eg. "GASSKO, I.")
# department: department from form (eg. "I&C SCI")
# status: the current status of the entry (eg. "APPROVE" or "")
# returns the status of the update
def addMissingProfessor(ucinetid:str, name:str, department:str, status:str):
    print(f"Searching for {ucinetid}, {name}, {department}...")
    # check if not already indexed
    url = elasticEndpointURL + f"/professors/_doc/{ucinetid}"
    res = requests.get(url).json()
    # if already indexed
    if res["found"]:
        res = res["_source"]
        # check if requested department is not listed in related departments
        if department not in res["relatedDepartments"]:
            # if from different school
            if deptToSchoolMap[department] not in res["schools"]:
                res["schools"].append(deptToSchoolMap[department])
            # save old history to compare later
            oldHistory = list(res["courseHistory"])
            # add to accepted departments
            res["relatedDepartments"] += getRelatedDepartments(department)
            # search course history again
            professorScraper.getCourseHistory(driver, res, name)
            # if found any new classes
            if len(res["courseHistory"]) > len(oldHistory):
                # approve before indexing
                if not status == ADMIN_APPROVE_STATUS and not validateName(res["name"], name):
                    return "NEED ADMIN APPROVAL TO UPDATE"
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
            res["schools"] = [deptToSchoolMap[department]]
            # get relatedDepartments
            res["relatedDepartments"] = getRelatedDepartments(department)
            # get course history
            professorScraper.getCourseHistory(driver, res, name)
            # if taught no courses
            if len(res["courseHistory"]) == 0:
                return "REJECTED: This professor has no course history. Maybe the entered name or department is wrong."
            else:
                # approve before indexing
                if not status == ADMIN_APPROVE_STATUS and not validateName(res["name"], name):
                    return "NEED ADMIN APPROVAL TO ADD"
                # update courses' professorHistory on elastic search
                updateProfessorHistory(ucinetid, res["courseHistory"])
                # index professor on elastic search
                index(elasticEndpointURL + f"/professors/_doc/{ucinetid}", res)
                return "SUCCCESS: Added professor."
        # if is an invalid ucinetid
        else:
            return "ERROR: Invalid ucinetid."

# directoryName: name associated to the ucinetid given (eg. "Irene Gassko")
# givenName: websoc name of professor provided by user (eg. "GASSKO, I.")
# returns if the ucinetid's directory name has the matching name as the given name
# (prevents trolls from entering a valid websoc name and indexing to a different professor)
# if true => index safely, if false => need admin to approve of exceptions like ("Chen Yu Sheu", "SHEU, P.")
def validateName(directoryName:str, givenName:str):
    # split and extract directory name
    splitDirectoryName = directoryName.split()
    directoryLastName = splitDirectoryName[-1]
    directoryFirstInitial = splitDirectoryName[0][0]
    # split and extract given name
    splitGivenName = givenName.replace(",", "").split()
    givenLastName = splitGivenName[0]
    givenFirstInitial = splitGivenName[1][0]
    return directoryLastName.lower() == givenLastName.lower() and directoryFirstInitial.lower() == givenFirstInitial.lower()


# ucinetid: netid for professor that taught the courses in coursesIDs (eg. "psheu")
# courseIDs: list of courses to update (eg. ["EECS 116", "EECS 159B", "EECS 199"])
# returns nothing, directly alters data on elastic search
def updateProfessorHistory(ucinetid:str, courseIDs:list):
    for courseID in courseIDs:
        courseID = courseID.replace(" ","")
        url = elasticEndpointURL + f"/courses/_doc/{courseID}"
        res = requests.get(url).json()
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
    r = requests.put(url, data=json.dumps(data), headers=headers)

# department: a department to find a grouping for
# returns a department grouping
# Example: for "COMPSCI" return ["COMPSCI", "IN4MATX", "I&C SCI", "SWE", "STATS"]
def getRelatedDepartments(department:str):
    for departmentGroup in departmentGroups:
        if department in departmentGroup:
            return list(departmentGroup)
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
        # poll sheets every 5 mins
        pollProfessorRequest()
        time.sleep(60 * 1)
    driver.quit()
