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
GE_DICTIONARY = {"Ia":"GE Ia: Lower Division Writing",
                 "Ib":"GE Ib: Upper Division Writing",
                 "II":"GE II: Science and Technology",
                 "III":"GE III: Social & Behavioral Sciences",
                 "IV":"GE IV: Arts and Humanities",
                 "Va":"GE Va: Quantitative Literacy",
                 "Vb":"GE Vb: Formal Reasoning",
                 "VI":"GE VI: Language Other Than English",
                 "VII":"GE VII: Multicultural Studies",
                 "VIII":"GE VIII: International/Global Issues"}

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

# driver: the Selenium Chrome driver
# returns a mapping from department code to school name. Uses the catalogue.
def getDepartmentToSchoolMapping(driver):
    # some need to be hard coded (These are mentioned in All Courses but not listed in their respective school catalogue)
    mapping = {"FIN":"The Paul Merage School of Business",
               "ARMN":"School of Humanities",
               "BSEMD":"School of Biological Sciences",
               "ECPS":"The Henry Samueli School of Engineering",
               "BANA":"The Paul Merage School of Business"}
    # get the soup object for catalogue
    catalogueSoup = scrape(driver, URL_TO_ALL_COURSES)
    # look through all the links in the sidebar
    for possibleSchoolLink in catalogueSoup.find(id="/").find_all("li"):
        # create school soup
        schoolUrl = CATALOGUE_BASE_URL + possibleSchoolLink.a['href'] + "#courseinventory"
        schoolSoup = scrape(driver, schoolUrl)
        # get the school name
        school = unicodedata.normalize("NFKD", schoolSoup.find(id="content").h1.getText())
        print("School:", school)
        # if this school has the "Courses" tab
        if schoolSoup.find(id="courseinventorytab") != None:
            # map school soup
            mapSoup(mapping, school, schoolSoup)   
        # look for department links
        departmentLinks = schoolSoup.find(class_="levelone")
        if departmentLinks != None:
            # go through each department link
            for departmentLink in departmentLinks.find_all("li"):
                # create department soup
                departmentUrl = CATALOGUE_BASE_URL + departmentLink.a["href"] + "#courseinventory"
                departmentSoup = scrape(driver, departmentUrl)
                # if this department has the "Courses" tab
                if departmentSoup.find(id="courseinventorytab") != None:
                    # map department soup
                    mapSoup(mapping, school, departmentSoup)
    return mapping

# mapping: the dictionary used to map department code to school name
# school: the school to map to
# soup: a soup that is loaded into a Courses page
# returns a mapping from department code to school name. Uses the catalogue.
def mapSoup(mapping:dict, school:str, soup):
    # get all the departments under this school
    for schoolDepartment in soup.find(id="courseinventorycontainer").find_all(class_="courses"):
        # if department is not empty (why tf is Chemical Engr and Materials Science empty)
        if schoolDepartment.h3 != None:
            # get the department name
            department = unicodedata.normalize("NFKD", schoolDepartment.h3.getText())
            print("\tDepartment:", department)
            # extract the first department code
            courseNumber, _, _ =  getCourseInfo(schoolDepartment.div)
            id_dept = " ".join(courseNumber.split()[0:-1])
            print("\tDepartment Code:", id_dept)
            # set the mapping
            mapping[id_dept] = school   

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

# id_number: the number part of a course id (122A)
# returns one of the three strings: (Lower Division (1-99), Upper Division (100-199), Graduate/Professional Only (200+))
def determineCourseLevel(id_number:str):
    # extract only the number 122A => 122
    courseNumber = int(re.sub(r"[^0-9]", "", id_number))
    if courseNumber < 100:
        return "Lower Division (1-99)"
    elif courseNumber < 200:
        return "Upper Division (100-199)"
    elif courseNumber >= 200:
        return "Graduate/Professional Only (200+)"
    else:
        print("COURSE LEVEL ERROR", courseNumber)

# soup: the Beautiful Soup object for a catalogue page
# json_data: maps class to its json data ({STATS 280: {metadata: {...}, data: {...}, node: Node}})
# departmentToSchoolMapping: maps department code to its school (I&C SCI: Donald Bren School of Information and Computer Sciences)
# returns nothing, stores information into objects passed in
def getAllRequirements(soup, json_data:dict, departmentToSchoolMapping:dict):
    # department name
    department = unicodedata.normalize("NFKD", soup.find(id="content").h1.get_text())
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
            courseDescription = unicodedata.normalize("NFKD", courseInfo[0].getText())

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
            if id_department not in departmentToSchoolMapping:
                noSchoolDepartment.add(id_department)
            # Examples at https://github.com/icssc-projects/PeterPortal/wiki/Course-Search
            # store class data into dictionary
            dic = {"id":courseNumber, "id_department": id_department, "id_number": id_number, 
                    "id_school": departmentToSchoolMapping[id_department] if id_department in departmentToSchoolMapping else "", 
                    "name": courseName, 
                    "course_level": determineCourseLevel(courseNumber),
                    "dept_alias": ALIASES[id_department] if id_department in ALIASES else [],
                    "units":[float(x) for x in unit_list],"description":courseDescription, "department": department, 
                    "prerequisiteJSON":"", "prerequisiteList":[], "prerequisite":"{}", "dependencies":[],"repeatability":"","grading option":"",
                    "concurrent":"","same as":"","restriction":"","overlaps":"","corequisite":"","ge_types":[],"ge_string":""}
            # stores dictionaries in json_data to add dependencies later 
            json_data[courseNumber] = {}
            json_data[courseNumber]["metadata"] = metadata
            json_data[courseNumber]["data"] = dic
            json_data[courseNumber]["node"] = None
            
            # iterate through each p tag for the course
            for c in courseInfo:
                pTagText = unicodedata.normalize("NFKD", c.getText().strip())
                # if starts with ( and has I or V in it, probably a GE tag
                if len(pTagText) > 0 and pTagText[0] == "(" and ("I" in pTagText or "V" in pTagText):
                    # try to parse GE types
                    ges = re.compile("(?P<type>[IV]+)\.?(?P<subtype>[abAB]?)")
                    if debug: print("\t\tGE:", end="")
                    for ge in ges.finditer(pTagText):
                        # normalize IA and VA to Ia and Va
                        extractedGE = ge.group("type") + ge.group("subtype").lower()
                        # normalize in full string also
                        pTagText = pTagText.replace(ge.group("type") + ge.group("subtype"), extractedGE)
                        # add to ge_types
                        dic["ge_types"].append(GE_DICTIONARY[extractedGE])
                        if debug: print(GE_DICTIONARY[extractedGE] + " ", end="")
                    if debug: print()
                    # store the full string
                    dic["ge_string"] = pTagText
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
    # maps department code to school 
    departmentToSchoolMapping = getDepartmentToSchoolMapping(driver)
    # debugging information
    specialRequirements = set()
    noSchoolDepartment = set()

    # UNCOMMENT ONE OF THE FOLLOWING 
    # 1. SCRAPE ALL CLASSES
    for classURL in getAllCoursesURLS(driver):
        getAllRequirements(scrape(driver, classURL), json_data, departmentToSchoolMapping)
    setDependencies(json_data)
    writeJsonData(json_data)

    # 2. SCRAPE ICS CATALOGUE
    # getAllRequirements(scrape(driver, "http://catalogue.uci.edu/allcourses/art/"), json_data, departmentToSchoolMapping)
    # setDependencies(json_data)
    # writeJsonData(json_data, "test.json")

    print("List of Schools:", sorted(list(set(departmentToSchoolMapping.values()))))
    if len(noSchoolDepartment) == 0:
        print("SUCCESS! ALL DEPARTMENTS HAVE A SCHOOL!")
    else:
        print("FAILED!", noSchoolDepartment, "DO NOT HAVE A SCHOOL!! MUST HARD CODE IT AT getDepartmentToSchoolMapping")

    # print("Special Requirements:")
    # for sReq in sorted(specialRequirements):
    #     print(sReq)
    # print()
    # testRequirements("I&C SCI 33", [""], False)
    # testRequirements("I&C SCI 33", ["I&C SCI 32A"], True)
    # testRequirements("I&C SCI 163", ["I&C SCI 61"], False)
    # testRequirements("I&C SCI 163", ["I&C SCI 61", "I&C SCI 10"], True)
    driver.quit()