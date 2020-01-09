import unicodedata
import requests
import re
from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
import json

# Dependencies:
# - pip install beautifulsoup4 selenium
# - Install selenium Chrome driver (https://sites.google.com/a/chromium.org/chromedriver/downloads)
#     - add executable to PATH (https://selenium.dev/documentation/en/webdriver/driver_requirements/#quick-reference)
#     - update the path below

PATH_TO_SELENIUM_DRIVER = "C:\\WebDriver\\bin\\chromedriver.exe"
URL_TO_CATALOGUE = "http://catalogue.uci.edu/donaldbrenschoolofinformationandcomputersciences/#courseinventory"

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
            return "[" + str(self.values[0]) + "]"
        # if is value node
        elif self.type == "#":
            return str(self.values[0])
        # if is and node
        elif self.type == "&":
            # print within []
            res = "["
            for i in range(len(self.values)):
                res += "," if i != 0 else ""
                res += str(self.values[i])
            res += "]"
            return res
        # if is or node    
        elif self.type == "|":
            # print within {}
            res = "{"
            for i in range(len(self.values)):
                res += "," if i != 0 else ""
                res += str(self.values[i])
            res += "}"
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
            
# returns the Beautiful Soup Object
def scrape():
    # Use Selenium to load entire page
    driver = Chrome(executable_path=PATH_TO_SELENIUM_DRIVER)
    driver.get(URL_TO_CATALOGUE)
    html = driver.page_source
    # Use requests to load part of the page
#     html = requests.get(catalogueURL).text
    return BeautifulSoup(html, 'html.parser')

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
    courseBlockHeader = courseBlock.p.get_text().rstrip().lstrip().split(". ")
    # unicode normalization to compare strings
    return tuple(unicodedata.normalize("NFKD", x.rstrip().lstrip()) for x in courseBlockHeader if x != "")

# soup: the Beautiful Soup object returned from scrape()
# returns map of course to its requirement Node
def getAllRequirements(soup):
    # set of all class strings
    allClasses = getAllClasses(soup)
    # set of special requirements that doesn't involve a class
    specialRequirements = set()
    # set of class requirements that aren't listed on the page
    otherDepartmentRequirements = set()
    #school name
    school_name = re.sub('\s', '', soup.select("#content")[0].h1.get_text()).lower()
    print(school_name)

    json_string = ""
    # maps class to a Node
    graph = {}
    for course in soup.select(".courses"):
        print("Department:", course.h3.get_text())
        for courseBlock in course.find_all("div", "courseblock"):
            # course identification
            courseNumber, courseName, courseUnits = getCourseInfo(courseBlock)
            print("", courseNumber, courseName, courseUnits, sep="\t")
            # get course info (0:Course Description, 1:Prerequisite)
            unit_list = courseUnits.split(" ")[0]
            if "-" in courseUnits:
                unit_list = unit_list.split("-")
            else:
                unit_list = [unit_list] * 2
            
            courseInfo = courseBlock.div.find_all("p")
            print(courseInfo[0])

            metadata = {
                "index" : {
                    "_index" : school_name,
                    "_id" : courseNumber
                }
            }
            print(metadata)
            object_info = {
                "number" : courseNumber,
                "name" : courseName,
                "units" : [float(x) for x in unit_list],
                "description" : courseInfo[0].get_text()
            }
            json_string += json.dumps(metadata) + '\n' + json.dumps(object_info) + '\n'


            # try to find prerequisite
            if len(courseInfo) > 1:
                prereqRegex = re.compile(r"Prerequisite:(.*)")
                possibleReq = prereqRegex.match(courseInfo[1].get_text())
                # if matches prereq structure
                if possibleReq:
                    # only get the first sentence (following sentences are grade requirements like "at least C or better")
                    rawReqs = unicodedata.normalize("NFKD",possibleReq.group(1).split(".")[0].rstrip().lstrip())
                    # get all the individual class names                    
                    extractedReqs = re.split(r' and | or ', rawReqs.replace("(","").replace(")",""))
                    # tokenized version: replace each class by an integer
                    tokenizedReqs = rawReqs
                    special = False
                    for i in range(len(extractedReqs)):
                        # if doesnt have a number code, its probably a special requirement
                        if sum(c.isdigit() for c in extractedReqs[i]) == 0:
                            print("\t\tSPECIAL REQ:", rawReqs) 
                            specialRequirements.add(rawReqs)
                            special = True
                            break
                        # if course not listed on this page, add it to other department
                        if extractedReqs[i] not in allClasses:
                            otherDepartmentRequirements.add(extractedReqs[i])
                        # does the actual replacement
                        tokenizedReqs = tokenizedReqs.replace(extractedReqs[i], str(i), 1)
                    if special:
                        continue
                    # place a space between parentheses to tokenize
                    tokenizedReqs = tokenizedReqs.replace("(", "( ").replace(")", " )")
                    # tokenize each item
                    tokens = tokenizedReqs.split()
                    # get the requirement Node
                    node = nodify(tokens, extractedReqs)
                    # maps the course to its requirement Node
                    graph[courseNumber] = node
                    # debug information
                    print("\t\tREQS:", rawReqs)
                    print("\t\tREQSTOKENS:", tokens)
                    print("\t\tNODE:",node)
                # doesn't match Requirements description                    
                else:
                    print("\t\tNOREQS")
                    graph[courseNumber] = None
            # doesn't have any descriptions
            else:
                print("\t\tNOREQS")
                graph[courseNumber] = None
    print("Special Requirements:", sorted(specialRequirements))
    print("Other Requirements:", sorted(otherDepartmentRequirements))

    with open("ics_courses.json", "w") as f:
        f.write(json_string)
    return graph

# targetClass: the class to test requirements for
# takenClasses: the classes that have been taken
# expectedValue: the expected result
def testRequirements(targetClass, takenClasses, expectedValue):
    print("Target: ", targetClass, ", Node: ", requirements[targetClass], ", Taken: ", takenClasses, sep="")  
    print("Expected: ", expectedValue, ", Actual: ", requirements[targetClass].prereqsMet(takenClasses),"\n", sep="")

if __name__ == "__main__":
    soup = scrape()
    requirements = getAllRequirements(soup)
    print()
    testRequirements("COMPSCI 103", [""], False)
    testRequirements("COMPSCI 103", ["I&C SCI 45C"], True)
    testRequirements("COMPSCI 111", ["I&C SCI 46", "I&C SCI 6N"], False)
    testRequirements("COMPSCI 111", ["I&C SCI 46", "I&C SCI 6D", "I&C SCI 6N"], True)