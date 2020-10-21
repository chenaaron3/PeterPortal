import re
import os
import platform
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from urllib.parse import urlencode
import json
from requirementNode import Node, nodify
import courseScraper

PATH_TO_SELENIUM_DRIVER = os.path.abspath(os.path.join(os.path.dirname(
    __file__), 'chromedriver' + (".exe" if platform.system() == 'Windows' else "")))
SPECIAL_PREREQUISITE_WHITE_LIST = [
    "SAT ", "ACT ", "AP ", "PLACEMENT EXAM or authorization"]

# scrape links
URL_TO_PREREQUISITE_DATABASE = "https://www.reg.uci.edu/cob/prrqcgi"

# output file names
PREREQUISITE_DATA_NAME = "resources/prerequisite_data.json"

# driver: the Selenium Chrome driver
# url: url to scrape
# returns the Beautiful Soup Object for a page url


def scrape(driver, url):
    # Use Selenium to load entire page
    # driver.get(url)
    # html = driver.page_source
    # Use requests to load part of the page (Way faster than Selenium)
    html = requests.get(url).text
    return BeautifulSoup(html, 'html.parser')

# scrape all available prerequisite data


def getAllPrerequisites():
    url = URL_TO_PREREQUISITE_DATABASE
    soup = scrape(driver, url)
    # get all searchable departments
    departments = courseScraper.normalizeString(
        soup.find("option").getText()).split("\r\n")[1:]
    # store data about prerequisites
    prerequisite_data = {}
    # iterate through all departments
    for department in departments:
        if department:
            department = department.strip()
            # scrape the prerequisite page for a given department
            scrapePrerequisitePage(department, prerequisite_data)
    return prerequisite_data

# department: department string to scrape (eg. "COMPSCI")
# prerequisite_data: dictionary to store the prerequisite data in
# scrape a certain prerequisite page and stores data into a dictionary


def scrapePrerequisitePage(department, prerequisite_data):
    query = {"dept": department, "action": "view_all"}
    # form the query url
    url = URL_TO_PREREQUISITE_DATABASE + "?" + urlencode(query)
    soup = scrape(driver, url)
    # replace <br> tag with newline
    for br in soup.find_all("br"):
        br.replace_with("\n")
    # find all courses and prereqs tags
    courses = soup.findAll("td", {"class": "course"})
    prereqs = soup.findAll("td", {"class": "prereq"})
    for i in range(len(courses)):
        # refine courseID
        courseID = courseScraper.normalizeString(
            courses[i].getText()).strip().replace(" ", "")
        courseID = re.sub("\*.*", "", courseID).strip()
        # refine prereq
        prereq = courseScraper.normalizeString(prereqs[i].getText()).strip()
        prereq = re.sub("\s+", " ", prereq)
        # trim the prerequisite
        prerequisite_data[courseID] = trimPrerequisite(prereq)
        # convert the minterms into a node
        cnfNode, extractedReqs = CNFToNode(
            prerequisite_data[courseID]["courseMinterms"])
        # assign prerequisiteList
        prerequisite_data[courseID]["prerequisiteList"] = extractedReqs
        # reduce the node to remove redundant information
        if cnfNode:
            # if has enough terms to reduce
            if cnfNode.type == "&":
                reduced = reduceCNFNode(cnfNode)
            # remove redundant impurities
            cnfNode.collapse()
            # consistent formatting
            courseReqs = cnfNode.prettyPrint()
            # trim outer parentheses if is an AND node
            if courseReqs[0] == "(" and courseReqs[-1] == ")" and cnfNode.type == "&":
                courseReqs = courseReqs[2:-2]
            prerequisite_data[courseID]["courseReqs"] = courseReqs
            prerequisite_data[courseID]["fullReqs"] = courseReqs
            # add specialReqs if any
            if prerequisite_data[courseID]["specialMinterms"]:
                prerequisite_data[courseID]["fullReqs"] += " AND " + \
                    " AND ".join(
                        prerequisite_data[courseID]["specialMinterms"])
            # assign prerequisiteJSON
            prerequisite_data[courseID]["prerequisiteJSON"] = str(cnfNode)
        # if only have special reqs
        else:
            prerequisite_data[courseID]["prerequisiteJSON"] = ""


# raw: the prerequisite string in CNF
"""
For COMPSCI 171
( STATS 67 ( coreq ) OR STATS 67 ( min grade = D- ) OR STATS 7 ( coreq ) OR STATS 7 ( min grade = D- ) OR AP STATISTICS ( min score = 3 ) )
AND
( STATS 67 ( coreq ) OR STATS 67 ( min grade = D- ) OR STATS 120A ( min grade = D- ) OR STATS 120A ( coreq ) )
AND
( I&C SCI 46 ( min grade = D- ) OR CSE 46 ( min grade = D- ) )
AND
( MATH 2B OR AP CALCULUS BC ( min score = 4 ) )
AND
NO REPEATS ALLOWED IF GRADE = C OR BETTER
AND
( SCHOOL OF I&C SCI ONLY OR COMPUTER SCI & ENGR MAJORS ONLY )
"""
# returns a dictionary of the trimmed minterms {"courseMinterms": , "specialMinterms":, "courseReqs":, "fullReqs": }
"""
For COMPSCI 171
{ courseMinterms:
["( STATS 7 OR STATS 67 OR AP STATISTICS )", 
"( STATS 67 OR STATS 120A )", 
"( CSE 46 OR I&C SCI 46 )", 
"( MATH 2B OR AP CALCULUS BC )"],
specialMinterms: 
["( BETTER OR NO REPEATS ALLOWED IF GRADE = C )", 
"( SCHOOL OF I&C SCI ONLY OR COMPUTER SCI & ENGR MAJORS ONLY )"]}
"""


def trimPrerequisite(raw):
    # get rid of newlines
    raw = raw.replace("\n", " ")
    # get the minterms
    minterms = raw.split(" AND ")
    minterms = trimTag(minterms)
    courseMinterms, specialMinterms = trimSpecialCourse(minterms)
    courseMinterms = trimDuplicates(courseMinterms)
    return {"courseMinterms": courseMinterms, "specialMinterms": specialMinterms,
            "courseReqs": " AND ".join(courseMinterms), "fullReqs": " AND ".join(courseMinterms + specialMinterms)}

# removes the tags in each minterm
# Original: ( STATS 67 ( coreq ) OR STATS 67 ( min grade = D- ) OR STATS 7 ( coreq ) OR STATS 7 ( min grade = D- ) OR AP STATISTICS ( min score = 3 ) )
# Trimmed: ( STATS 67 OR STATS 67 OR STATS 7 OR STATS 7 OR AP STATISTICS )


def trimTag(minterms):
    # trim each minterm of their tags
    for i in range(len(minterms)):
        innerParenthesesRegex = " \([^\)]*\)"
        minterm = minterms[i].strip()
        # remove outer parentheses
        if minterm[0] == "(" and minterm[-1] == ")":
            minterm = minterm[2:-2]
        # removing possible surrounding parentheses (eg. ( PLACEMENT EXAM or authorization (see SOC comments for authorization policy/instructions) ))
        courses = []
        for course in minterm.split(" OR "):
            if course[0] == "(" and course[-1] == ")":
                courses.append(course[2:-2])
            else:
                courses.append(course)
        minterm = " OR ".join(courses)
        # remove all inner parentheses tags
        minterm = re.sub(innerParenthesesRegex, "", minterm)
        # assign new minterm
        minterms[i] = minterm
    return minterms

# classifies course and special minterms


def trimSpecialCourse(minterms):
    # all courseIDs should match this regex
    courseRegex = re.compile(r"^([^a-z]+ )+[A-Z]*[0-9]+[A-Z]*$")
    courseMinterms = []
    specialMinterms = []
    for i in range(len(minterms)):
        minterm = minterms[i]
        # if all courses are valid
        # course not a negation, course matches regex or is an exception
        if minterm.split()[0] != "NO" and all([(True if courseRegex.match(course) else any([True for exception in SPECIAL_PREREQUISITE_WHITE_LIST if exception in course])) for course in minterm.split(" OR ")]):
            courseMinterms.append(minterm)
        else:
            # add outer parentheses if is an OR clause
            if " OR " in minterm:
                minterm = "( " + minterm + " )"
            specialMinterms.append(minterm)
    return (courseMinterms, specialMinterms)

# removes the duplicates in each minterm then sorts it
# Original: ( STATS 67 OR STATS 67 OR STATS 7 OR STATS 7 OR AP STATISTICS )
# Trimmed: ( STATS 7 OR STATS 67 OR AP STATISTICS )


def trimDuplicates(minterms):
    # remove duplicate courses within each minterm
    for i in range(len(minterms)):
        minterm = minterms[i]
        # create a set of courses
        courseSet = set([course for course in minterm.split(" OR ")])
        # sort and join the courses
        minterms[i] = "( " + " OR ".join(sorted(courseSet,
                                                key=lambda x: (len(x), x))) + " )"
    return list(set(minterms))

# courseMinterms: the minterms of a CNF prerequisite
# returns the node representation of the CNF prerequisite


def CNFToNode(courseMinterms):
    if len(courseMinterms) == 0:
        return (None, [])
    # stringify all the courses to parse
    rawReqs = " AND ".join(courseMinterms)
    # store unique courses in a list
    extractedReqs = list(
        set(re.split(r' AND | OR ', rawReqs.replace("( ", "").replace(" )", ""))))
    tokenizedMinterms = []
    # tokenize each minterm
    for minterm in courseMinterms:
        mintermTokens = []
        # iterate through each course in the minterm
        for course in re.split(r' AND | OR ', minterm.replace("( ", "").replace(" )", "")):
            # add the index in extractedReqs
            mintermTokens.append(str(extractedReqs.index(course)))
        # reconstruct into a minterm of indices
        tokenizedMinterms.append("( " + " OR ".join(mintermTokens) + " )")
    # reconstruct into CNF of indices
    tokenizedReqs = " AND ".join(tokenizedMinterms)
    # turn string into tokens
    tokens = tokenizedReqs.split()
    # turn tokens into a CNF node
    node = nodify(tokens, extractedReqs, "")
    return (node, extractedReqs)

# cnfNode: a Node object in CNF form
# CNF node Assumptions: node.type should be "AND", each node in node.values should be type "#" or "OR", all values in the sub "OR" node should be type "#"
# uses AND Distributive Law to reduce
# returns if node was reduced. Modifies the node to remove redundant minterms. Modified node will not be in CNF.


def reduceCNFNode(cnfNode):
    reducedNodes = []
    # keep reducing until no further reduction can be performed
    while True:
        # if no nodes to reduce (possible if all previous nodes were removed from reduction)
        if len(cnfNode.values) == 0:
            break
        counts = {}
        # find duplicate courses
        for node in cnfNode.values:
            # if single value
            if node.type == "#":
                countNode(node, counts)
            # if multiple values
            elif node.type == "|":
                for valueNode in node.values:
                    countNode(valueNode, counts)
        # finds the maximum duplicate value
        maxDuplicate = max(counts.values())
        # if no duplicates, nothing to reduce
        if maxDuplicate == 1:
            break
        violatingCourse = None
        # find the first course with max value
        for course, count in sorted(counts.items()):
            # reduce this course
            if count == maxDuplicate:
                violatingCourse = course
                break
        # create the reduced node
        reducedNode = reduceNode(cnfNode, violatingCourse)
        # store it to add back later
        reducedNodes.append(reducedNode)
        # recursively reduce the cnf node generated in the reduced node
        reduceCNFNode(reducedNode.values[1])
    # add back all reduced nodes
    if len(reducedNodes) > 0:
        cnfNode.values += reducedNodes
    return len(reducedNodes) != 0

# node: the node to reduce (eg. (A | B) & (A | C))
# course: the violating course to reduce (eg. A)
# returns the reduced node
# Example: (A | (B & C))


def reduceNode(node, course):
    # find all minterms with violating course (0, 1)
    violatingIndices = [i for i in range(
        len(node.values)) if course in node.values[i]]
    # create OR node for reduction ( | )
    reductionNode = Node("|")
    # put violating course as first value (A | )
    reductionNode.values = [Node("#", [course])]
    # create AND node to store remaining ( & )
    subCNFNode = Node("&")
    # put as second value (A | ( & ))
    reductionNode.values.append(subCNFNode)
    # for each violating minterm, find the residual to put in the subCNFNode
    for violatingIndex in violatingIndices:
        violatingMintermNode = node.values[violatingIndex]
        # if minterm is type # (A), no residual
        if violatingMintermNode.type == "#":
            # do nothing
            pass
        # if minterm is type | (A | B | C), has residual
        elif violatingMintermNode.type == "|":
            residual = None
            # if minterm has 3 or more values (A | B | C) - (A) = (B | C)
            if len(violatingMintermNode.values) >= 3:
                # create OR node for residual
                residual = Node("|")
                # find all nodes except violating node
                for n in violatingMintermNode.values:
                    nValue = n.values[0]
                    if nValue != course:
                        residual.values.append(Node("#", [nValue]))
            # if minterm has 2 values (A | B) - (A) = (B)
            elif len(violatingMintermNode.values) == 2:
                # create # node for minterm - violating course
                residual = Node("#")
                v1 = violatingMintermNode.values[0].values[0]
                v2 = violatingMintermNode.values[1].values[0]
                # assign the non-violating course
                if v1 == course:
                    residual.values.append(v2)
                else:
                    residual.values.append(v1)
            # add new node into subCNFNode (A | ((B | C) & (D) & ... ))
            subCNFNode.values.append(residual)
    # remove all violating minterms
    for violatingIndex in sorted(violatingIndices, reverse=True):
        del node.values[violatingIndex]
    # return the reductionNode created
    return reductionNode

# node: the node to count
# counts: dictionary to store counts
# checks that the node is type # and accounts for it


def countNode(node, counts):
    if node.type != "#":
        raise Exception("Node should be of type # but was type " + node.type)
    course = node.values[0]
    if course not in counts:
        counts[course] = 0
    counts[course] += 1


if __name__ == "__main__":
    # the Selenium Chrome driver
    options = Options()
    options.headless = True
    driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
    # driver = Chrome(executable_path=PATH_TO_SELENIUM_DRIVER, options=options)
    prerequisite_data = getAllPrerequisites()
    # store data into a file
    json.dump(prerequisite_data, open(PREREQUISITE_DATA_NAME, "w"))
