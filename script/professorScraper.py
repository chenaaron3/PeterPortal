import unicodedata
import requests
import re
from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import json
import urllib
import time
import os
import platform
import io
import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import courseScraper
from progressBar import ProgressBar

PATH_TO_SELENIUM_DRIVER = os.path.abspath(os.path.join(os.path.dirname( __file__ ), 'chromedriver' + (".exe" if platform.system() == 'Windows' else "")))
# links
URL_TO_ALL_COURSES = "http://catalogue.uci.edu/allcourses/"
CATALOGUE_BASE_URL = "http://catalogue.uci.edu"
URL_TO_DIRECTORY = "https://directory.uci.edu/"
URL_TO_INSTRUCT_HISTORY = "http://www.reg.uci.edu/perl/InstructHist"

# output file names
FOUND_NAME = "output/found_profs.txt"
QUESTIONABLE_NAME = "output/questionable_profs.txt"
MISSING_NAME = "output/missing_profs.txt"
PROFESSOR_DATA_NAME = "resources/professor_data.json"
JSON_NAME = "resources/all_professors.json"

# stats
hits = 0
misses = 0

# driver: the Selenium Chrome driver
# url: url to scrape
# returns the Beautiful Soup Object for a page url
def scrape(driver, url):
    # Use Selenium to load entire page
    driver.get(url)
    html = driver.page_source
    return BeautifulSoup(html, 'html.parser')

# driver: the Selenium Chrome driver
# returns a map of all faculty links to scrape to their correspdoning school
# Example: {'http://catalogue.uci.edu/clairetrevorschoolofthearts/#faculty':'Claire Trevor School of the Arts',
#           'http://catalogue.uci.edu/thehenrysamuelischoolofengineering/departmentofbiomedicalengineering/#faculty':'The Henry Samueli School of Engineering', ...}
def getFacultyLinks(driver):
    print(f"\nCollecting Faculty Links from Sidebar...")
    # get the soup object for catalogue
    catalogueSoup = scrape(driver, URL_TO_ALL_COURSES)
    faculty_links = {}
    # all links in sidebar
    lis = catalogueSoup.find(id="/").find_all("li")
    bar = ProgressBar(len(lis), False)
    # look through all the links in the sidebar
    for possibleSchoolLink in lis:
        # create school soup
        schoolUrl = CATALOGUE_BASE_URL + possibleSchoolLink.a['href'] + "#faculty"
        schoolSoup = scrape(driver, schoolUrl)
        # get the school name
        school = unicodedata.normalize("NFKD", schoolSoup.find(id="content").h1.getText())
        # if this school has the "Faculty" tab
        if schoolSoup.find(id="facultytab") != None:
            # add school faculty page
            faculty_links[schoolUrl] = school
        else:
            # look for department links
            departmentLinks = schoolSoup.find(class_="levelone")
            if departmentLinks != None:
                # go through each department link
                for departmentLink in departmentLinks.find_all("li"):
                    # create department soup
                    departmentUrl = CATALOGUE_BASE_URL + departmentLink.a["href"] + "#faculty"
                    departmentSoup = scrape(driver, departmentUrl)
                    # if this department has the "Faculty" tab
                    if departmentSoup.find(id="facultytab") != None:
                        # add department faculty page
                        faculty_links[departmentUrl] = school
        bar.inc()
    return faculty_links

# soup: a soup that is loaded into a Courses page that is associated with a Faculty page
# returns a list of department codes that is in the same page as a Faculty page, used to disambiguate professors in Instructor History 
# Example: for DBH Faculty page ("http://catalogue.uci.edu/donaldbrenschoolofinformationandcomputersciences/#faculty"),
#          return the department codes listed in DBH Course page ("http://catalogue.uci.edu/donaldbrenschoolofinformationandcomputersciences/#courseinventory")
#          ["COMPSCI","IN4MATX","I&C SCI","SWE","STATS"]
def getAllDepartmentCodes(soup):
    departmentCodes = []
    courseInventory = soup.find(id="courseinventorycontainer")
    # check if the courses page even exists
    if courseInventory == None:
        return departmentCodes
    # get all the departments under this school
    for schoolDepartment in courseInventory.find_all(class_="courses"):
        # if department is not empty (why tf is Chemical Engr and Materials Science empty)
        if schoolDepartment.h3 != None:
            # extract the first department code
            courseNumber, _, _ =  courseScraper.getCourseInfo(schoolDepartment.div)
            id_dept = " ".join(courseNumber.split()[0:-1])
            departmentCodes.append(id_dept)
    return departmentCodes

# link: a url to the Faculty page that does not have an associated Courses page (eg. "http://catalogue.uci.edu/thepaulmerageschoolofbusiness/#faculty")
# returns a list of department codes that most of the professors have in common (used https://www.reg.uci.edu/perl/InstructHist to find similarities)
# Example: ["MGMT","MGMT EP","MGMT FE","MGMT HC","MGMTMBA","MGMTPHD","MPAC"]
def getHardcodedDepartmentCodes(link:str):
    lookup = {"http://catalogue.uci.edu/thepaulmerageschoolofbusiness/#faculty":["MGMT","MGMT EP","MGMT FE","MGMT HC","MGMTMBA","MGMTPHD","MPAC"],
              "http://catalogue.uci.edu/interdisciplinarystudies/pharmacologyandtoxicology/#faculty":["PHRMSCI","PHARM","BIO SCI"],
              "http://catalogue.uci.edu/schooloflaw/#faculty":["LAW"],
              "http://catalogue.uci.edu/schoolofmedicine/#faculty":[]}
    if link in lookup:
        return lookup[link]
    else:
        raise Exception("WARNING! " + link + " does not have an associated Courses page! Use https://www.reg.uci.edu/perl/InstructHist to hardcode.")

# soup: a soup that is loaded into a Faculty page
# departmentCodes: a list of departments from the same school as the professor (eg. ["COMPSCI","IN4MATX","I&C SCI","SWE","STATS"])
# school: the school the professor is listed under (eg. "Donald Bren School of Information and Computer Sciences")
# returns nothing, mutates the global facultyDictionary and outputs debug information
def getAllProfessors(soup, departmentCodes:list, school:str):
    global hits
    global misses
    faculties = soup.select(".faculty")
    bar = ProgressBar(len(faculties), False)
    # find all faculty blocks
    for faculty in faculties:
        # extract name and title
        name = faculty.find("span", class_="name")
        title = faculty.find("span", class_="title")
        # search up their info from the directory
        results = getDirectoryInfo(driver, name.text.replace(".",""))
        # if has no results
        if results == None:
            # debug output
            fmissing.write(unicodedata.normalize("NFKD", name.text) + "\n")
            misses += 1
        # if has results
        else:
            # add to dictionary if not already seen
            if results["ucinetid"] not in facultyDictionary:
                results['schools'] = [school]
                results['relatedDepartments'] = list(departmentCodes)
                getCourseHistory(driver, results)
                name_text = unicodedata.normalize("NFKD", name.text)
                # split names to test validity
                name_split = name_text.split()
                result_name_split = results["name"].split()
                # check for valid faulty results
                if name_split[0].lower() != result_name_split[0].lower() or name_split[-1].lower() != result_name_split[-1].lower():
                    # if have class history, probably got the right person
                    if len(results['courseHistory']) > 0:
                        # debug output
                        ffound.write(name_text + ":" + str(results) + "\n")
                        hits += 1
                        facultyDictionary[results["ucinetid"]] = results
                    else:
                        misses += 1
                # name on faculty page checks out with directory name
                else:
                    # debug output
                    ffound.write(name_text + ":" + str(results) + "\n")
                    hits += 1
                    facultyDictionary[results["ucinetid"]] = results
            # if show up in multiple faculty pages
            else:
                results = facultyDictionary[results["ucinetid"]]
                if school not in results['schools']:
                    results['schools'].append(school)
                    fquestionable.write(str(results) + "\n")
                results['relatedDepartments'] += departmentCodes
                getCourseHistory(driver, results)
        bar.inc()
    print("Hits:", hits, "Misses:", misses)

# driver: the Selenium Chrome driver
# query: the name of the professor to look up (eg. "Kei Akagi")
# returns the directory information about a professor
# Example: {'name': 'Kei Akagi', 'ucinetid': 'kakagi', 'phone': '(949) 824-2171', 'title': "Chancellor's Professor", 'department': 'Arts-Music'}
def getDirectoryInfo(driver, query):
    data = {'uciKey': query}
    # first search through post request
    response = requests.post(URL_TO_DIRECTORY, data = data, headers = {'Content-Type': 'application/x-www-form-urlencoded'})
    json_data = response.json()
    info = {"name":"","ucinetid":"","phone":"","title":"","department":""}
    # if post request has results
    if (len(json_data) > 1):
        # filter out students
        results = [x for x in json_data if type(x) is list and x[1]['type'] != 'student']
        # if nothing left of the results, return
        if len(results) < 1:
            return None
        result = results[0][1]
        # parse the information
        info = {"name":result['Name'],"ucinetid":result['UCInetID'], "phone":result['Phone Number'],"title":result['Title'],"department":result['Department']}
    # if post request has no results
    else:
        # use selenium to make a request
        new_url = URL_TO_DIRECTORY +'query/'+ urllib.parse.quote(query)
        driver.get(new_url)
        # wait for results to load
        try:
            WebDriverWait(driver, 1).until(
                EC.presence_of_element_located((By.TAG_NAME, "tr"))
            )
            html = driver.page_source
            # construct soup for search result
            search_soup = BeautifulSoup(html, 'html.parser')
            txt_url = search_soup.find("tbody").tr.td.find('a').get('href') + '.txt'
            # construct soup for detailed page
            info_soup = scrape(driver, URL_TO_DIRECTORY + txt_url)
            # parse name, netid, phone, title, department
            for line in info_soup.body.text.strip().split("\n"):
                segments = line.split(": ")
                category, entry = segments[0].lower(), segments[1]
                if category in info:
                    info[category] = entry
        # if no results loaded
        except Exception:
            return None
    return info

# driver: the Selenium driver
# query: a dictionary with professor information (eg. {'name': 'Kei Akagi', 'ucinetid': 'kakagi', 'phone': '(949) 824-2171', 'title': "Chancellor's Professor", 'department': 'Arts-Music', 'relatedDepartments': ['ARTS', 'ART', 'DANCE', 'DRAMA', 'MUSIC']})
# socName: the Schedule of Classes name if known
# returns nothing, adds a field 'courseHistory' to the dictionary passed in 
def getCourseHistory(driver, query:dict, socName=""):
    # set of courseHistory
    courseHistory = set()
    # reformat name to Lastname, First Initial (Kei Akagi => Akagi, K.)
    normalName = query["name"]
    reformatName = normalName.split()[-1] + ", " + normalName[0] + "."
    if socName != "":
        reformatName = socName
    # make get request to Instructor History page
    PARAMS = {"order":"term",
              "action":"Submit",
              "input_name":reformatName,
              "term_yyyyst":"ANY",
              "start_row":""}
    historySoup = scrape(driver, URL_TO_INSTRUCT_HISTORY + "?" + urllib.parse.urlencode(PARAMS))
    # parse the first page
    parseHistoryPage.firstEntry = ""
    shouldContinue = parseHistoryPage(historySoup, query["relatedDepartments"], courseHistory)
    # set up parameters for prev page
    row = 1
    PARAMS["action"] = "Prev"
    PARAMS["start_row"] = str(row)
    # keep loading next page
    while(shouldContinue):
        historySoup = scrape(driver, URL_TO_INSTRUCT_HISTORY + "?" + urllib.parse.urlencode(PARAMS))
        shouldContinue = parseHistoryPage(historySoup, query["relatedDepartments"], courseHistory)
        row += 101
        PARAMS["start_row"] = str(row)
    query['courseHistory'] = list(courseHistory)

# soup: a soup that is loaded into a Instructor History page
# relatedDepartments: a list of the professor's related departments (eg. ['ARTS', 'ART', 'DANCE', 'DRAMA', 'MUSIC'])
# courseHistory: a set that holds all the course codes of a professor
# returns whether or not to continue parsing
# Example: False when no valid entries show up or passed year threshold, True otherwise
def parseHistoryPage(soup, relatedDepartments, courseHistory):
    CUR_YEAR = datetime.datetime.now().year % 100
    firstEntry = True
    # maps the field names from Instructor History page to an index
    FIELD_LABELS = {"qtr":0,"empty":1,"instructor":2,"courseCode":3,"dept":4,"courseNo":5,"type":6,"title":7,"units":8,"maxCap":9,"enr":10,"req":11}
    YEAR_THRESHOLD = 5
    entries = soup.find_all("tr")

    # check if any results show up
    validEntryFound = False
    # loop through all row entries
    for entry in entries:
        # find all field entries
        fields = entry.find_all("td", recursive=False)
        # if is a valid entry
        #  correct number of field values       not a label row
        if len(fields) == len(FIELD_LABELS) and fields[FIELD_LABELS["qtr"]].text.strip() != "Qtr":
            # check first entry on the page
            if firstEntry:
                firstEntry = False
                myEntry = fields[0].text.strip() + fields[2].text.strip() + fields[3].text.strip()
                # if same as last page, stop parsing
                if parseHistoryPage.firstEntry == myEntry:
                    return False
                parseHistoryPage.firstEntry = myEntry

            validEntryFound = True
            # if QTR field breaches threshold
            qtr_year = fields[FIELD_LABELS["qtr"]].text.strip()
            year = int(re.sub("[^0-9]", "", qtr_year))
            if CUR_YEAR - year > YEAR_THRESHOLD:
                return False

            dept = fields[FIELD_LABELS["dept"]].text.strip()
            # if dept is related to professor
            if dept in relatedDepartments:
                courseCode = dept + " " + fields[FIELD_LABELS["courseNo"]].text.strip()
                courseHistory.add(courseCode)

    return validEntryFound

# json_data: collection of class information generated from getAllRequirements and setDependencies
def writeToJson():
    print(f"\nWriting JSON to {JSON_NAME}...")
    bar = ProgressBar(len(facultyDictionary), False)

    # string that represents the JSON file we want to generate
    json_string = ""
    # loop through each course to jsonify
    for faculty in facultyDictionary:
        metadata = {
            "index" : {
                "_index" : "professors",
                "_id" : faculty
            }
        }
        json_string += json.dumps(metadata) + '\n' + json.dumps(facultyDictionary[faculty]) + '\n'
        bar.inc()

    with open(JSON_NAME, "w") as f:
        f.write(json_string)

if __name__ == "__main__":
    # open up files
    fmissing = io.open(MISSING_NAME, "w", encoding="utf-8")
    fquestionable = io.open(QUESTIONABLE_NAME, "w", encoding="utf-8")
    ffound = io.open(FOUND_NAME, "w", encoding="utf-8")
    fprofessorData = io.open(PROFESSOR_DATA_NAME, "w", encoding="utf-8")

    # maps faculty ucnetid to their information
    facultyDictionary = {}

    # the Selenium Chrome driver
    options = Options()
    options.headless = True
    driver = Chrome(executable_path=PATH_TO_SELENIUM_DRIVER, options=options)

    # dictionary of faculty links to the school name
    faculty_links = getFacultyLinks(driver)
    print("\nTOTAL PROGRESS:")
    bar = ProgressBar(len(faculty_links), True)
    print()

    for link in faculty_links:
        # faculty in school of medicine do not teach
        if link == "http://catalogue.uci.edu/schoolofmedicine/#faculty":
            continue
        # retrive related departments
        department_soup = scrape(driver, link.replace("#faculty","#courseinventory"))
        department_codes = getAllDepartmentCodes(department_soup)
        # backup related departments
        if len(department_codes) == 0:
            department_codes = getHardcodedDepartmentCodes(link)

        print(f"Now Scraping {link}...")
        # scraping professors on the link
        getAllProfessors(scrape(driver, link), department_codes, faculty_links[link])
        print("TOTAL PROGRESS:")
        bar.inc()
        print()

    # output to json file
    writeToJson()

    # debug output
    fprofessorData.write(json.dumps(facultyDictionary))
    print(hits, misses)
    print(hits / (hits + misses))

    # clean up resources
    driver.quit()
    fmissing.close()
    fquestionable.close()
    ffound.close()
    fprofessorData.close()