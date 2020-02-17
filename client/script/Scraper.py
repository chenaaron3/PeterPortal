import unicodedata
import requests
import re
from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
import json
import os
import platform

from RequirementNode import Node, nodify
from Alias import ALIASES

# DO NOT CHANGE
# Automatically determines the path based on your operating system
PATH_TO_SELENIUM_DRIVER = os.path.abspath(os.path.join(os.path.dirname( __file__ ), 'chromedriver' + (".exe" if platform.system() == 'Windows' else "")))
URL_TO_ALL_COURSES = "http://catalogue.uci.edu/allcourses/"
CATALOGUE_BASE_URL = "http://catalogue.uci.edu"
GENERATE_JSON_NAME = "all_courses.json"

# allow non-digit prerequisite tokens if they contain one of these words 
# Example: Allow CHEM 1A to have "CHEM 1P or SAT Mathematics"
SPECIAL_PREREQUISITE_WHITE_LIST = ["SAT ", "ACT ", "AP "]
# tokenize these separately because they contain 'and' or 'or'
PRETOKENIZE = ["AP Physics C: Electricity and Magnetism"]
            
# driver: the Selenium Chrome driver
# returns the Beautiful Soup Object for a page url
def scrape(driver, url):
    # Use Selenium to load entire page
    driver.get(url)
    html = driver.page_source

    # Use requests to load part of the page (Way faster than Selenium)
    # html = requests.get(url).text
    return BeautifulSoup(html, 'html.parser')

# driver: the Selenium Chrome driver
# returns a list of class URLS from AllCourses
def getAllCoursesURLS(driver):
    # store all URLS in list
    courseURLS = []
    # gets the soup object
    allCoursesSoup = scrape(driver, URL_TO_ALL_COURSES)
    # get all the unordered lists
    for letterList in allCoursesSoup.find(id="atozindex").find_all("ul"):
        # get all the list items
        for courseURL in letterList.find_all('a', href=True):
            # prepend base url to relative path
            courseURLS.append(CATALOGUE_BASE_URL + courseURL['href'])
    return courseURLS

# soup: the Beautiful Soup object returned from scrape()
# returns set of all course names
def getAllClasses(soup):
    allClasses = set()
    for department in soup.select(".courses"):
        for courseBlock in department.find_all("div", "courseblock"):
            # course identification
            allClasses.add(getCourseInfo(courseBlock)[0])
    return allClasses

# courseBlock: a courseblock tag
# returns tuple(courseNumber, courseName, courseUnits)
# Example: ('I&C SCI 6B', "Boolean Logic and Discrete Structures", "4 Units.")
def getCourseInfo(courseBlock):
                         # id has number         # name fille   # units has word "Unit"
    courseInfoPatternWithUnits = r"(?P<id>.*[0-9]+[^.]*)\.[ ]+(?P<name>.*)\.[ ]+(?P<units>\d*\.?\d.*Units?)\."
    courseInfoPatternWithoutUnits = r"(?P<id>.*[0-9]+[^.]*)\. (?P<name>.*)\."
    courseBlockString = unicodedata.normalize("NFKD", courseBlock.p.get_text().strip())
    if "Unit" in courseBlockString:
        res = re.match(courseInfoPatternWithUnits, courseBlockString)
        return (res.group("id").strip(), res.group("name").strip(), res.group("units").strip())
    else:
        res = re.match(courseInfoPatternWithoutUnits, courseBlockString)
        return (res.group("id").strip(), res.group("name").strip(), "0 Units")

# soup: the Beautiful Soup object for a catalogue page
# json_data: maps class to its json data ({STATS 280: {metadata: {...}, data: {...}, node: Node}})
# specialRequirements: set of special requirements that doesn't involve a class
# returns nothing, stores information into objects passed in
def getAllRequirements(soup, json_data:dict, specialRequirements:set):
    # department name
    department = soup.find(id="content").h1.get_text()
    # strip off department id
    department = department[:department.find("(")].strip()
    if debug: print("Department:", department)

    for course in soup.select(".courses"):
        # if page is empty for some reason??? (http://catalogue.uci.edu/allcourses/cbems/)
        if len(course.select("h3")) == 0:
            return
        for courseBlock in course.find_all("div", "courseblock"):
            # course identification
            courseNumber, courseName, courseUnits = getCourseInfo(courseBlock)
            if debug: print("", courseNumber, courseName, courseUnits, sep="\t")
            # get course info (0:Course Description, 1:Prerequisite)
            courseInfo = courseBlock.div.find_all("p")
            # parse course description
            courseDescription = courseInfo[0].getText()

            # parse units
            unit_list = courseUnits.split(" ")[0]
            if "-" in courseUnits:
                unit_list = unit_list.split("-")
            else:
                unit_list = [unit_list] * 2
            # parse course number and department
            splitID = courseNumber.split()
            id_department = " ".join(splitID[0:-1])
            id_number = splitID[-1]

            # store meta data for Elasticsearch
            metadata = {
                "index" : {
                    "_index" : "courses",
                    "_id" : courseNumber.replace(" ", "")
                }
            }
            # store class data into dictionary
            dic = {"id":courseNumber, "id_department": id_department, "id_number": id_number,"name": courseName, 
                    "dept_alias": ALIASES[id_department] if id_department in ALIASES else [],
                    "units":[float(x) for x in unit_list],"description":courseDescription, "department": department, 
                    "prerequisiteJSON":"", "prerequisiteList":[], "prerequisite":"", "dependencies":[],"repeatability":"","grading option":"",
                    "concurrent":"","same as":"","restriction":"","overlaps":"","corequisite":"","ge_types":[],"ge_string":""}
            # EXAMPLE
            """
            {
             "id": "COMPSCI 111", 
             "id_department": "COMPSCI", 
             "id_number": "111", 
             "name": "Digital Image Processing", 
             "units": [4.0, 4.0], 
             "description": "Introduction to the fundamental concepts of digital...", 
             "department": "Computer Science Courses", 
             "prerequisiteJSON": "{AND:[{OR:['I&C SCI 46','CSE 46']},'I&C SCI 6D',{OR:['MATH 3A','I&C SCI 6N']}]}", 
             "prerequisiteList": ["I&C SCI 46", "CSE 46", "I&C SCI 6D", "MATH 3A", "I&C SCI 6N"], 
             "prerequisite": "Prerequisite: (I&C\u00a0SCI\u00a046 or CSE 46) and I&C\u00a0SCI\u00a06D..."}
             "dependencies": [], 
             "repeatability": "", 
             "grading option": "", 
             "concurrent": "", 
             "same as": "", 
             "restriction": "Restriction: School of Info & Computer Sci...",              
             "overlaps": "", 
             "corequisite": "", 
             "ge_types": [],
             "ge_string": ""
            """
            # stores dictionaries in json_data to add dependencies later 
            json_data[courseNumber] = {}
            json_data[courseNumber]["metadata"] = metadata
            json_data[courseNumber]["data"] = dic
            json_data[courseNumber]["node"] = None
            
            # iterate through each p tag for the course
            for c in courseInfo:
                pTagText = c.getText().strip()
                # if starts with ( and has I or V in it, probably a GE tag
                if len(pTagText) > 0 and pTagText[0] == "(" and ("I" in pTagText or "V" in pTagText):
                    dic["ge_string"] = pTagText
                    # try to parse GE types
                    ges = re.findall("[IV]+", pTagText)
                    if debug: print("\t\tGE:", end="")
                    for ge in ges:
                        dic["ge_types"].append(roman_to_int(ge))
                        if debug: print(ge + "(" + str(roman_to_int(ge)) + ") ", end="")
                    if debug: print()
                # try to match keywords like "grading option", "repeatability"
                for keyWord in dic.keys():
                    if re.match("^" + keyWord + ".*", pTagText.lower()):
                        dic[keyWord] = pTagText
                        break
            
            # try to find prerequisite
            if len(courseInfo) > 1:
                # sometimes prerequisites are in the same ptag as corequisites
                prereqRegex = re.compile(r"((?P<fullcoreqs>Corequisite:[^\n]*)\n)?(?P<fullreqs>Prerequisite[^:]*:(?P<reqs>.*))")
                possibleReq = prereqRegex.search(unicodedata.normalize("NFKD",courseInfo[1].get_text()))
                # if matches prereq structure
                if possibleReq:
                    dic["corequisite"] = "" if possibleReq.group("fullcoreqs") == None else possibleReq.group("fullcoreqs")
                    dic["prerequisite"] = "" if possibleReq.group("fullreqs") == None else possibleReq.group("fullreqs")
                    # only get the first sentence (following sentences are grade requirements like "at least C or better")
                    rawReqs = unicodedata.normalize("NFKD",possibleReq.group("reqs").split(".")[0].strip())
                    # look for pretokenized items
                    for pretoken in PRETOKENIZE:
                        if pretoken in rawReqs:
                            rawReqs = rawReqs.replace(pretoken, pretoken.replace(" and ", "/").replace(" or ", "/"))
                    # get all the individual class names                    
                    extractedReqs = re.split(r' and | or ', rawReqs.replace("(","").replace(")",""))
                    # tokenized version: replace each class by an integer
                    tokenizedReqs = rawReqs
                    special = False
                    # if doesnt have a link to another course, probably a special requirement
                    if len(courseInfo[1].select("a")) == 0:
                        if debug: print("\t\tSPECIAL REQ NO LINK:", rawReqs) 
                        specialRequirements.add(rawReqs)
                        special = True
                    # if has a link
                    if not special:
                        for i in range(len(extractedReqs)):
                            courseRegex = re.compile(r"^([^a-z]+ )+[A-Z0-9]+$")
                            # if doesnt match course code regex, its probably a special requirement unless whitelisted
                            if not courseRegex.match(extractedReqs[i].strip()) and not any([True for exception in SPECIAL_PREREQUISITE_WHITE_LIST if exception in extractedReqs[i]]):
                                if debug: print("\t\tSPECIAL REQ BAD FORMAT:", rawReqs) 
                                specialRequirements.add(rawReqs)
                                special = True
                                break
                            # does the actual replacement
                            tokenizedReqs = tokenizedReqs.replace(extractedReqs[i].strip(), str(i), 1)
                        # if nothing went wrong while processing tokens
                        if not special:
                            # place a space between parentheses to tokenize
                            tokenizedReqs = tokenizedReqs.replace("(", "( ").replace(")", " )")
                            # tokenize each item
                            tokens = tokenizedReqs.split()
                            # get the requirement Node
                            node = nodify(tokens, extractedReqs, courseNumber)
                            # stringify node
                            dic["prerequisiteJSON"] = str(node)
                            # add list of prereq classes for dependency generation
                            dic["prerequisiteList"] = extractedReqs
                            # maps the course to its requirement Node
                            json_data[courseNumber]["node"] = node
                            # debug information
                            if debug:
                                print("\t\tREQS:", rawReqs)
                                print("\t\tREQSTOKENS:", tokens)
                                print("\t\tNODE:",node)
                # doesn't match Requirements description                    
                else:
                    if debug: print("\t\tNOREQS")
            # doesn't have any descriptions
            else:
                if debug: print("\t\tNOREQS")

# json_data: collection of class information generated from getAllRequirements
# sets the dependencies for courses
def setDependencies(json_data:dict):
    # go through each prerequisiteList to add dependencies
    for courseNumber in json_data:
        # iterate prerequisiteList
        for prerequisite in json_data[courseNumber]["data"]["prerequisiteList"]:
            # prereq needs to exist as a class
            if prerequisite in json_data:
                json_data[prerequisite]["data"]["dependencies"].append(courseNumber)

# json_data: collection of class information generated from getAllRequirements and setDependencies
def writeJsonData(json_data:dict,filename=GENERATE_JSON_NAME):
    # string that represents the JSON file we want to generate
    json_string = ""
    # loop through each course to jsonify
    for courseNumber in json_data:
        json_string += json.dumps(json_data[courseNumber]["metadata"]) + '\n' + json.dumps(json_data[courseNumber]["data"]) + '\n'
    # remove existing file
    if os.path.exists(filename):
        os.remove(filename)
    with open(filename, "a") as f:
        f.write(json_string)

# json_data: collection of class information generated from getAllRequirements
# used to create the dictionary for aliases
def printAllDepartments(jsont_data:dict):
    departments = {}
    for c in json_data:
        d = json_data[c]["data"]["id_department"]
        if d not in departments:
            departments[d] = []
    print("{" + "\n".join("{!r}: {!r},".format(k, departments[k]) for k in sorted(departments)) + "}")

# Used for GEs to convert Roman Numeral to integers
def roman_to_int(s):
        rom_val = {'I': 1, 'V': 5}
        int_val = 0
        for i in range(len(s)):
            if i > 0 and rom_val[s[i]] > rom_val[s[i - 1]]:
                int_val += rom_val[s[i]] - 2 * rom_val[s[i - 1]]
            else:
                int_val += rom_val[s[i]]
        return int_val

# targetClass: the class to test requirements for
# takenClasses: the classes that have been taken
# expectedValue: the expected result
def testRequirements(targetClass, takenClasses, expectedValue):
    print("Target: ", targetClass, ", Node: ", json_data[targetClass]["node"], ", Taken: ", takenClasses, sep="")  
    print("Expected: ", expectedValue, ", Actual: ", json_data[targetClass]["node"].prereqsMet(takenClasses),"\n", sep="")

if __name__ == "__main__":
    # whether to print out info
    debug = False
    # the Selenium Chrome driver
    driver = Chrome(executable_path=PATH_TO_SELENIUM_DRIVER)
    # store all of the data
    json_data = {}
    # debugging information
    specialRequirements = set()

    # UNCOMMENT ONE OF THE FOLLOWING 
    # 1. SCRAPE ALL CLASSES
    for classURL in getAllCoursesURLS(driver):
        getAllRequirements(scrape(driver, classURL), json_data, specialRequirements)
    setDependencies(json_data)
    writeJsonData(json_data)
    # 2. SCRAPE ICS CATALOGUE
    # getAllRequirements(scrape(driver, "http://catalogue.uci.edu/allcourses/art/"), json_data, specialRequirements)
    # setDependencies(json_data)
    # writeJsonData(json_data, "test.json")

    # print("Special Requirements:")
    # for sReq in sorted(specialRequirements):
    #     print(sReq)
    # print()
    # testRequirements("I&C SCI 33", [""], False)
    # testRequirements("I&C SCI 33", ["I&C SCI 32A"], True)
    # testRequirements("I&C SCI 163", ["I&C SCI 61"], False)
    # testRequirements("I&C SCI 163", ["I&C SCI 61", "I&C SCI 10"], True)
    driver.quit()