import unicodedata
import requests
import re
from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
import json
import os
import platform

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

class Node:
    def __init__(self, type = "?"):
        # holds other nodes
        self.values = []
        # can be ?|&,|,#
        self.type = type
    
    # classHistory: list of classes taken
    # return whether or not this requirement is met
    def prereqsMet(self, classHistory : list):
        # if origin only has 1 value
        if self.type == "?":
            return self.values[0].prereqsMet(classHistory)
        # if is value node
        elif self.type == "#":
            return self.values[0] in classHistory
        # if is and node
        elif self.type == "&":
            # every sub requirement must be met
            for subReq in self.values:
                if not subReq.prereqsMet(classHistory):
                    return False
            return True
        # if is or node
        elif self.type == "|":
            # at least 1 sub requirement must be met
            for subReq in self.values:
                if subReq.prereqsMet(classHistory):
                    return True
            return False
        # should never reach here       
        else:
            print("prereqsMet::Invalid Node Type", self.type)   
    
    # and nodes are surrounded with []
    # or nodes are surrounded with {}
    # Example: 1 and 2 and (3 or (4 and 5)) and 6 -> [1,2,{3,[4,5]},6]
    # returns a string representation of this requirement
    def __str__(self):
        # if origin only has 1 value
        if self.type == "?":
            return "{AND:[" + str(self.values[0]) + "]}"
        # if is value node
        elif self.type == "#":
            return "'" + str(self.values[0]) + "'"
        # if is and node
        elif self.type == "&":
            # print within []
            res = "{AND:["
            for i in range(len(self.values)):
                res += "," if i != 0 else ""
                res += str(self.values[i])
            res += "]}"
            return res
        # if is or node    
        elif self.type == "|":
            # print within {}
            res = "{OR:["
            for i in range(len(self.values)):
                res += "," if i != 0 else ""
                res += str(self.values[i])
            res += "]}"
            return res
        # should never reach here
        else:
            print("Node:__str__::Invalid Node Type", self.type)  

# tokens: list of tokens that represent a class requirement. Consist of integers, 'and', 'or', '(', ')'
# lookup: list of classes that the integers in the tokens list represent
# returns a Node representing the requirements                 
def nodify(tokens, lookup):
    # uses stack to see which and/or node to add a value in
    stack = [Node("?")]
    for token in tokens:
        # create a new sub requirement
        if token == "(":
            stack.insert(0, Node())
        # adds the sub requirement
        elif token == ")":
            subNode = stack.pop(0)
            stack[0].values.append(subNode)
        # sets the type to &
        elif token == "and":
            stack[0].type = "&"
        # sets the type to |
        elif token == "or":
            stack[0].type = "|"
        # adds a class requirement
        else: 
            newNode = Node("#")
            newNode.values.append(lookup[int(token)])
            stack[0].values.append(newNode)
    # is something went wrong
    if len(stack) != 1:
        print("Non Matching Parentheses!")
        return None
    return stack[0]       
            
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
    courseInfoPatternWithUnits = "(?P<id>.*[0-9]+[^.]*)\.[ ]+(?P<name>.*)\.[ ]+(?P<units>\d*\.?\d.*Units?)\."
    courseInfoPatternWithoutUnits = "(?P<id>.*[0-9]+[^.]*)\. (?P<name>.*)\."
    courseBlockString = unicodedata.normalize("NFKD", courseBlock.p.get_text().rstrip().lstrip())
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
    department = soup.find(id="content").h1.get_text().strip()
    # strip off department id
    department = department[:department.find("(")]
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
            # parse course ID
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
                    "units":[float(x) for x in unit_list],"description":courseDescription, "department": department, 
                    "prerequisiteJSON":"", "prerequisiteList":[], "prerequisite":"", "dependencies":[],"repeatability":"","grading option":"",
                    "concurrent":"","same as":"","restriction":"","overlaps":"","corequisite":""}
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
             "school": "donaldbrenschoolofinformationandcomputersciences", 
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
            """
            # stores dictionaries in json_data to add dependencies later 
            json_data[courseNumber] = {}
            json_data[courseNumber]["metadata"] = metadata
            json_data[courseNumber]["data"] = dic
            json_data[courseNumber]["node"] = None
            
            # try to match keywords to extract course data
            for c in courseInfo:
                for keyWord in dic.keys():
                    if re.match("^" + keyWord + ".*", c.getText().lower()):
                        dic[keyWord] = c.getText()
                        break
            
            # try to find prerequisite
            if len(courseInfo) > 1:
                prereqRegex = re.compile(r"Prerequisite[^:]*:(?P<reqs>.*)")
                possibleReq = prereqRegex.match(courseInfo[1].get_text())
                # if matches prereq structure
                if possibleReq:
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
                            node = nodify(tokens, extractedReqs)
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
def writeJsonData(json_data:dict):
    # string that represents the JSON file we want to generate
    json_string = ""
    # loop through each course to jsonify
    for courseNumber in json_data:
        json_string += json.dumps(json_data[courseNumber]["metadata"]) + '\n' + json.dumps(json_data[courseNumber]["data"]) + '\n'
    # remove existing file
    if os.path.exists(GENERATE_JSON_NAME):
        os.remove(GENERATE_JSON_NAME)
    with open(GENERATE_JSON_NAME, "a") as f:
        f.write(json_string)

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
    # getAllRequirements(scrape(driver, "http://catalogue.uci.edu/allcourses/i_c_sci/"), json_data, specialRequirements)
    # setDependencies(json_data)

    print("Special Requirements:")
    for sReq in sorted(specialRequirements):
        print(sReq)
    print()
    testRequirements("I&C SCI 33", [""], False)
    testRequirements("I&C SCI 33", ["I&C SCI 32A"], True)
    testRequirements("I&C SCI 163", ["I&C SCI 61"], False)
    testRequirements("I&C SCI 163", ["I&C SCI 61", "I&C SCI 10"], True)
    driver.quit()