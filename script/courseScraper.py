import unicodedata
import re
from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options
import json
import os
import platform

from requirementNode import Node, nodify, CONFLICT_PREREQ_NAME
from alias import ALIASES
from progressBar import ProgressBar
import professorScraper
import prerequisiteScraper

# DO NOT CHANGE
# Automatically determines the path based on your operating system
PATH_TO_SELENIUM_DRIVER = os.path.abspath(os.path.join(os.path.dirname( __file__ ), 'chromedriver' + (".exe" if platform.system() == 'Windows' else "")))

# scrape links
CATALOGUE_BASE_URL = "http://catalogue.uci.edu"
URL_TO_ALL_COURSES = CATALOGUE_BASE_URL + "/allcourses/"

# output file names
GENERATE_JSON_NAME = "resources/all_courses.json"
DEPT_SCHOOL_MAP_NAME = "resources/dept_school_map.json"
COURSES_DATA_NAME = "resources/course_data.json"
SPECIAL_REQS_NAME = "output/special_reqs.txt"
SCHOOL_LIST_NAME = "output/school_list.txt"

# references
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
# url: url to scrape
# returns the Beautiful Soup Object for a page url
def scrape(driver, url):
    # Use Selenium to load entire page
    driver.get(url)
    html = driver.page_source
    # Use requests to load part of the page (Way faster than Selenium)
    # html = requests.get(url).text
    return BeautifulSoup(html, 'html.parser')

# s: string to normalize (usually parsed from beautiful soup object)
# returns a normalized string that can be safely compared to other strings
def normalizeString(s:str):
    return unicodedata.normalize("NFKD", s)

# driver: the Selenium Chrome driver
# returns a mapping from department code to school name. Uses the catalogue.
# Example: {"I&C SCI":"Donald Bren School of Information and Computer Sciences","IN4MATX":"Donald Bren School of Information and Computer Sciences"}
def getDepartmentToSchoolMapping(driver):
    print("\nMapping Departments to Schools...")
    # some need to be hard coded (These are mentioned in All Courses but not listed in their respective school catalogue)
    mapping = {"FIN":"The Paul Merage School of Business",
               "ARMN":"School of Humanities",
               "BSEMD":"School of Biological Sciences",
               "ECPS":"The Henry Samueli School of Engineering",
               "BANA":"The Paul Merage School of Business"}
    # get the soup object for catalogue
    catalogueSoup = scrape(driver, URL_TO_ALL_COURSES)
    # get all li from sidebar
    lis = catalogueSoup.find(id="/").find_all("li")
    bar = ProgressBar(len(lis), debug)
    # look through all the links in the sidebar
    for possibleSchoolLink in lis:
        # create school soup
        schoolUrl = CATALOGUE_BASE_URL + possibleSchoolLink.a['href'] + "#courseinventory"
        schoolSoup = scrape(driver, schoolUrl)
        # get the school name
        school = normalizeString(schoolSoup.find(id="content").h1.getText())
        if debug: print("School:", school)
        # if this school has the "Courses" tab
        if schoolSoup.find(id="courseinventorytab") != None:
            # map school soup
            mapCoursePageToSchool(mapping, school, schoolSoup)   
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
                    mapCoursePageToSchool(mapping, school, departmentSoup)
        bar.inc()
    # write to file
    f = open(DEPT_SCHOOL_MAP_NAME, "w")
    f.write(json.dumps(mapping))
    f.close()
    return mapping

# mapping: the dictionary used to map department code to school name
# school: the school to map to
# soup: a soup that is loaded into a Courses page
# returns nothing, mutates the mapping passed in
def mapCoursePageToSchool(mapping:dict, school:str, soup):
    # get all the departments under this school
    for schoolDepartment in soup.find(id="courseinventorycontainer").find_all(class_="courses"):
        # if department is not empty (why tf is Chemical Engr and Materials Science empty)
        if schoolDepartment.h3 != None:
            # get the department name
            department = normalizeString(schoolDepartment.h3.getText())
            # extract the first department code
            courseID, _, _ =  getCourseInfo(schoolDepartment.div)
            id_dept = " ".join(courseID.split()[0:-1])
            if debug: print(f"\t{id_dept}")
            # set the mapping
            mapping[id_dept] = school   

# driver: the Selenium Chrome driver
# returns a list of class URLS from AllCourses
# Example: ["http://catalogue.uci.edu/allcourses/ac_eng/","http://catalogue.uci.edu/allcourses/afam/",...]
def getAllCourseURLS(driver):
    print(f"\nCollecting Course URLs from {URL_TO_ALL_COURSES}...")
    # store all URLS in list
    courseURLS = []
    # gets the soup object
    allCoursesSoup = scrape(driver, URL_TO_ALL_COURSES)
    letterLists = allCoursesSoup.find(id="atozindex").find_all("ul")
    bar = ProgressBar(len(letterLists), debug)
    # get all the unordered lists
    for letterList in letterLists:
        # get all the list items
        for courseURL in letterList.find_all('a', href=True):
            # prepend base url to relative path
            courseURLS.append(CATALOGUE_BASE_URL + courseURL['href'])
        bar.inc()
    return courseURLS

# soup: the Beautiful Soup object for a catalogue department page
# json_data: maps class to its json data ({STATS 280: {metadata: {...}, data: {...}, node: Node}})
# departmentToSchoolMapping: maps department code to its school {I&C SCI: Donald Bren School of Information and Computer Sciences}
# returns nothing, scrapes all courses in a department page and stores information into a dictionary
def getAllCourses(soup, json_data:dict, departmentToSchoolMapping:dict):
    # department name
    department = normalizeString(soup.find(id="content").h1.get_text())
    # strip off department id
    department = department[:department.find("(")].strip()
    if debug: print("Department:", department)

    for course in soup.select(".courses"):
        # if page is empty for some reason??? (http://catalogue.uci.edu/allcourses/cbems/)
        if len(course.select("h3")) == 0:
            return
        for courseBlock in course.find_all("div", "courseblock"):
            # course identification
            courseID, courseName, courseUnits = getCourseInfo(courseBlock)
            if debug: print("", courseID, courseName, courseUnits, sep="\t")
            # get course body (0:Course Description, 1:Prerequisite)
            courseBody = courseBlock.div.find_all("p")
            # parse course description
            courseDescription = normalizeString(courseBody[0].getText())

            # parse units
            unit_range = courseUnits.split(" ")[0]
            if "-" in courseUnits:
                unit_range = unit_range.split("-")
            else:
                unit_range = [unit_range] * 2

            # parse course number and department
            splitID = courseID.split()
            id_department = " ".join(splitID[0:-1])
            id_number = splitID[-1]
            # error detection
            if id_department not in departmentToSchoolMapping:
                noSchoolDepartment.add(id_department)

            # store meta data for Elasticsearch
            metadata = {
                "index" : {
                    "_index" : "courses",
                    "_id" : courseID.replace(" ", "")
                }
            }

            # Examples at https://github.com/icssc-projects/PeterPortal/wiki/Course-Search
            # store class data into dictionary
            dic = {"id":courseID, "id_department": id_department, "id_number": id_number, 
                    "id_school": departmentToSchoolMapping[id_department] if id_department in departmentToSchoolMapping else "", 
                    "name": courseName, 
                    "course_level": determineCourseLevel(courseID),
                    "dept_alias": ALIASES[id_department] if id_department in ALIASES else [],
                    "units":[float(x) for x in unit_range],"description":courseDescription, "department": department, "professorHistory":[],
                    "prerequisiteJSON":"", "prerequisiteList":[], "prerequisite":"", "dependencies":[],"repeatability":"","grading option":"",
                    "concurrent":"","same as":"","restriction":"","overlaps":"","corequisite":"","ge_types":[],"ge_string":"", "terms":[]}

            # key with no spaces
            courseID = courseID.replace(" ", "")
            # stores dictionaries in json_data to add dependencies later 
            json_data[courseID] = {"metadata":metadata,
                                        "data":dic}
            
            # populates the dic with simple information
            parseCourseBody(courseBody, dic)

            # try to parse prerequisite
            if len(courseBody) > 1:
                node = parsePrerequisite(courseBody[1], dic)
                # maps the course to its requirement Node
                # json_data[courseID]["node"] = node
            # doesn't have any prerequisites
            else:
                if debug: print("\t\tNOREQS")

# courseBlock: a courseblock tag
# returns tuple(courseID, courseName, courseUnits)
# Example: ('I&C SCI 6B', "Boolean Logic and Discrete Structures", "4 Units.")
def getCourseInfo(courseBlock):
                         # id has number         # name fille   # units has word "Unit"
    courseInfoPatternWithUnits = r"(?P<id>.*[0-9]+[^.]*)\.[ ]+(?P<name>.*)\.[ ]+(?P<units>\d*\.?\d.*Units?)\."
    courseInfoPatternWithoutUnits = r"(?P<id>.*[0-9]+[^.]*)\. (?P<name>.*)\."
    courseBlockString = normalizeString(courseBlock.p.get_text().strip())
    if "Unit" in courseBlockString:
        res = re.match(courseInfoPatternWithUnits, courseBlockString)
        return (res.group("id").strip(), res.group("name").strip(), res.group("units").strip())
    else:
        res = re.match(courseInfoPatternWithoutUnits, courseBlockString)
        return (res.group("id").strip(), res.group("name").strip(), "0 Units")

# id_number: the number part of a course id (122A)
# returns one of the three strings: (Lower Division (1-99), Upper Division (100-199), Graduate/Professional Only (200+))
# Example: "I&C Sci 33" => "(Lower Division (1-99)", "COMPSCI 143A" => "Upper Division (100-199)", "CompSci 206" => "Graduate/Professional Only (200+)"
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

# courseBody: a collection of ptags within a courseblock
# dic: a dictionary to store parsed information
# returns nothing, mutates the dictionary passed in
def parseCourseBody(courseBody, dic:dict):
    # iterate through each ptag for the course
    for c in courseBody:
        pTagText = normalizeString(c.getText().strip())
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
            possibleMatch = re.match(f"^{keyWord}[? ](?P<value>.*)", pTagText.lower())
            if possibleMatch and len(dic[keyWord]) == 0:
                dic[keyWord] = possibleMatch.group("value")
                break

# tag: the second ptag from courseBody
# dic: a dictionary to store parsed information
# returns a requirement Node if successfully parsed, None otherwise
def parsePrerequisite(tag, dic:dict):
    # sometimes prerequisites are in the same ptag as corequisites
    prereqRegex = re.compile(r"((?P<fullcoreqs>Corequisite:(?P<coreqs>[^\n]*))\n)?(?P<fullreqs>Prerequisite[^:]*:(?P<reqs>.*))")
    possibleReq = prereqRegex.search(normalizeString(tag.get_text()))
    # if matches prereq structure
    if possibleReq:
        dic["corequisite"] = "" if possibleReq.group("coreqs") == None else possibleReq.group("coreqs")
        dic["prerequisite"] = "" if possibleReq.group("reqs") == None else possibleReq.group("reqs")
        # only get the first sentence (following sentences are grade requirements like "at least C or better")
        rawReqs = normalizeString(possibleReq.group("reqs").split(".")[0].strip())
        # look for pretokenized items
        for pretoken in PRETOKENIZE:
            if pretoken in rawReqs:
                rawReqs = rawReqs.replace(pretoken, pretoken.replace(" and ", "/").replace(" or ", "/"))
        # get all courses                    
        extractedReqs = re.split(r' and | or ', rawReqs.replace("(","").replace(")",""))
        # tokenized version: replace each class by an integer
        tokenizedReqs = rawReqs
        special = False
        # if doesnt have a link to another course, probably a special requirement
        if len(tag.select("a")) == 0:
            if debug: print("\t\tSPECIAL REQ NO LINK:", rawReqs) 
            specialRequirements.add(rawReqs)
            return
        # if has a link, continue tokenizing
        for i in range(len(extractedReqs)):
            courseRegex = re.compile(r"^([^a-z]+ )+[A-Z0-9]+$")
            # if doesnt match course code regex, its probably a special requirement unless whitelisted
            if not courseRegex.match(extractedReqs[i].strip()) and not any([True for exception in SPECIAL_PREREQUISITE_WHITE_LIST if exception in extractedReqs[i]]):
                if debug: print("\t\tSPECIAL REQ BAD FORMAT:", rawReqs) 
                specialRequirements.add(rawReqs)
                return
            # does the actual replacement
            tokenizedReqs = tokenizedReqs.replace(extractedReqs[i].strip(), str(i), 1)
        # place a space between parentheses to tokenize
        tokenizedReqs = tokenizedReqs.replace("(", "( ").replace(")", " )")
        # tokenize each item
        tokens = tokenizedReqs.split()
        # get the requirement Node
        node = nodify(tokens, extractedReqs, dic["id"])
        # stringify node
        dic["prerequisiteJSON"] = str(node)
        # add list of classes mentioned in prereq for dependency generation
        dic["prerequisiteList"] = extractedReqs
        # debug information
        if debug:
            print("\t\tREQS:", rawReqs)
            print("\t\tREQSTOKENS:", tokens)
            print("\t\tNODE:",node)
        return node
    # doesn't match prereq structure                    
    else:
        if debug: print("\t\tNOREQS")

# json_data: collection of class information generated from getAllCourses
# sets the prerequisite info based on the prerequisite database instead of the catalogue
def setReliablePrerequisites(json_data:dict):
    print("\nSetting Reliable Prerequisites...")
    prerequisite_data = json.load(open(prerequisiteScraper.PREREQUISITE_DATA_NAME, "r"))
    bar = ProgressBar(len(prerequisite_data), debug)
    # go through each prerequisite course
    for courseID in prerequisite_data:
        # if course exists in catalogue
        if courseID in json_data:
            # rewrite the prerequisite data
            json_data[courseID]["data"]["prerequisiteJSON"] = prerequisite_data[courseID]["prerequisiteJSON"]
            json_data[courseID]["data"]["prerequisiteList"] = prerequisite_data[courseID]["prerequisiteList"]
            json_data[courseID]["data"]["prerequisite"] = prerequisite_data[courseID]["fullReqs"]
        bar.inc()

# json_data: collection of class information generated from getAllCourses
# sets the dependencies for courses
def setDependencies(json_data:dict):
    print("\nSetting Course Dependencies...")
    bar = ProgressBar(len(json_data), debug)
    # go through each prerequisiteList to add dependencies
    for courseID in json_data:
        # iterate prerequisiteList
        for prerequisite in json_data[courseID]["data"]["prerequisiteList"]:
            prerequisite = prerequisite.replace(" ", "")
            # prereq needs to exist as a class
            if prerequisite in json_data:
                readableCourseID = json_data[courseID]["data"]["id"]
                json_data[prerequisite]["data"]["dependencies"].append(readableCourseID)
        bar.inc()

# json_data: collection of class information generated from getAllCourses
# sets the professorHistory for courses
def setProfessorHistory(json_data:dict):
    print("\nSetting Professor History...")
    # collection of professor information generated from professorScraper.py
    professor_data = json.load(open(professorScraper.PROFESSOR_DATA_NAME))
    bar = ProgressBar(len(professor_data), debug)
    # go through each profesor data values
    for professor in professor_data.values():
        # go through each course that professor has taught
        for courseID in professor["courseHistory"]:
            courseID = courseID.replace(" ", "")
            # course needs to exist as a class
            if courseID in json_data:
                json_data[courseID]["data"]["professorHistory"].append(professor["ucinetid"])
        bar.inc()

# json_data: collection of class information generated from getAllCourses
def writeJsonData(json_data:dict,filename=GENERATE_JSON_NAME):
    print(f"\nWriting JSON to {filename}...")
    bar = ProgressBar(len(json_data), debug)
    # string that represents the JSON file we want to generate
    json_string = ""
    # loop through each course to jsonify
    for courseID in json_data:
        json_string += json.dumps(json_data[courseID]["metadata"]) + '\n' + json.dumps(json_data[courseID]["data"]) + '\n'
        bar.inc()
    # remove existing file
    if os.path.exists(filename):
        os.remove(filename)
    with open(filename, "a") as f:
        f.write(json_string)

# json_data: collection of class information generated from getAllCourses
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
    # whether to use cached data instead of rescraping (for faster development/testing)
    cache = True
    # the Selenium Chrome driver
    options = Options()
    options.headless = True
    driver = Chrome(executable_path=PATH_TO_SELENIUM_DRIVER, options=options)

    # store all of the data
    json_data = {} if not cache else json.load(open(COURSES_DATA_NAME, "r"))
    # scrape data if not using cache option
    if not cache:
        # maps department code to school 
        departmentToSchoolMapping = getDepartmentToSchoolMapping(driver) if not cache else {}
        # debugging information
        specialRequirements = set()
        noSchoolDepartment = set()
        conflictFile = open(CONFLICT_PREREQ_NAME, "w")
        conflictFile.write("Following courses have conflicting AND/OR logic in their prerequisites\n")
        conflictFile.close()

        # get urls to scrape
        allCourseURLS = getAllCourseURLS(driver)
        print("\nParsing Each Course URL...")
        bar = ProgressBar(len(allCourseURLS), debug)
        # populate json_data
        for classURL in allCourseURLS:
            getAllCourses(scrape(driver, classURL), json_data, departmentToSchoolMapping)
            bar.inc()
        json.dump(json_data, open(COURSES_DATA_NAME, "w"))

    # set reliable prerequisites
    setReliablePrerequisites(json_data)
    # set dependencies between each course
    setDependencies(json_data)
    # set professor history
    setProfessorHistory(json_data)
    # write data to index into elasticSearch
    writeJsonData(json_data)

    if not cache:
        # Debug information about school
        schoolFile = open(SCHOOL_LIST_NAME, "w")
        schoolFile.write("List of Schools:\n")
        for school in sorted(list(set(departmentToSchoolMapping.values()))):
            schoolFile.write(school + "\n")
        schoolFile.close()
        if len(noSchoolDepartment) == 0:
            print("SUCCESS! ALL DEPARTMENTS HAVE A SCHOOL!")
        else:
            print("FAILED!", noSchoolDepartment, "DO NOT HAVE A SCHOOL!! MUST HARD CODE IT AT getDepartmentToSchoolMapping")

        # Debug information about special requirements
        specialFile = open(SPECIAL_REQS_NAME, "w")
        specialFile.write("Special Requirements:\n")
        for sReq in sorted(specialRequirements):
            specialFile.write(sReq+"\n")
        specialFile.close()

    # testRequirements("I&C SCI 33", [""], False)
    # testRequirements("I&C SCI 33", ["I&C SCI 32A"], True)
    # testRequirements("I&C SCI 163", ["I&C SCI 61"], False)
    # testRequirements("I&C SCI 163", ["I&C SCI 61", "I&C SCI 10"], True)
    driver.quit()