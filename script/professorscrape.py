import unicodedata
import requests
import re
from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
from bs4 import BeautifulSoup
from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import boto3
import json
import time


# Dependencies:
# - pip install beautifulsoup4 selenium
# - Install selenium Chrome driver (https://sites.google.com/a/chromium.org/chromedriver/downloads)
#     - add executable to PATH (https://selenium.dev/documentation/en/webdriver/driver_requirements/#quick-reference)
#     - update the path below

PATH_TO_SELENIUM_DRIVER = "C:\\WebDriver\\bin\\chromedriver.exe"
URL_TO_CATALOGUE = "https://www.faculty.uci.edu/act_advanced_search.cfm?type_of_search=department"
URL_TO_ALL_COURSES = "http://catalogue.uci.edu/allcourses/"
CATALOGUE_BASE_URL = "http://catalogue.uci.edu"
URL_TO_CATALOGUE = "http://catalogue.uci.edu/donaldbrenschoolofinformationandcomputersciences/#faculty"
URL_TO_DIRECTORY = "https://directory.uci.edu/"


def scrape(driver, url):
    # Use Selenium to load entire page
    driver.get(url)
    html = driver.page_source

    # Use requests to load part of the page (Way faster than Selenium)
    # html = requests.get(url).text
    return BeautifulSoup(html, 'html.parser')
    # school_options = ['ARTS', 'ICS', 'ENGR', 'GSM', 'BIOSCI', 'DEPTED', 'HUM', 'LAW', 'COM',
    #                 'HS', 'PUBHLTH', 'PHRMSCI', 'NURSCI', 'PHYSSCI', 'SOCECO', 'SOCSCI']
    
    # soup_dict = {}
    # for school in school_options: 
    #     data = {'first': school, 'second': 'no-dept-selected'}
    #     x = requests.post(URL_TO_CATALOGUE, data = data)
    #     html = x.text
    #     soup_dict[school] = BeautifulSoup(html, 'html.parser')

    # return soup_dict

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
    print(courseURLS)
    return courseURLS

def getDirectoryInfo(query):
    data = {'uciKey': query}
    response = requests.post(URL_TO_DIRECTORY, data = data, headers = {'Content-Type': 'application/x-www-form-urlencoded'})
    json_data = response.json()
    return json_data

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
        if schoolSoup.find(id="facultytab") != None:
            # map school soup
            print(school, " has tab")
        # look for department links
        departmentLinks = schoolSoup.find(class_="levelone")
        if departmentLinks != None:
            # go through each department link
            for departmentLink in departmentLinks.find_all("li"):
                # create department soup
                departmentUrl = CATALOGUE_BASE_URL + departmentLink.a["href"] + "#courseinventory"
                departmentSoup = scrape(driver, departmentUrl)
                # if this department has the "Courses" tab
                if departmentSoup.find(id="facultytab") != None:
                    # map department soup
                    
                    print(departmentUrl, " has tab")
    return 0

def getAllProfessors(soup, json_data):

    for faculty in soup.select(".faculty"):
        name = faculty.find("span", class_="name")
        title = faculty.find("span", class_="title")
        results = getDirectoryInfo(name.text.replace(".",""))
        results = [x for x in results if type(x) is list and x[1]['type'] != 'student']
        if len(results) == 0:
            print(name.text, title.text)
            print(results)

    # for school, soup in soup_dict.items():
    #     emailRegex = re.compile(r"\s+(?P<email>(?P<ucinetid>.*)(@|at|_AT_).*uci\.edu)")
    #     phoneRegex = re.compile(r"\(\d{3}\) ?\d{3}-\d{4}")
    #     table = soup.find('div', id='content')
    #     # print("SCHOOL: ", school)  
    #     x = 0
    #     for info in table.select('p'):
    #         name = info.b.text.strip()
    #         email = emailRegex.search(info.text)
    #         phone = phoneRegex.search(info.text)
    #         # print('Name:', name, "email:", email.group('ucinetid') if email else None, "phone:",phone.group(0) if phone else None)
    #         x += 1
    #         if email:
    #             id = email.group('ucinetid')
    #             metadata = {
    #                     "index" : {
    #                         "_index" : "profesors",
    #                         "_id" : email.group('ucinetid')
    #                     }
    #                 }
    #             dic = {
    #                 "name": name, "phone":phone, "school": school, "ucinetid": IndexError
    #             }
                
    #             json_data[id] = {}
    #             json_data[id]['metadata'] = metadata
    #             json_data[id]['data'] = dic
    #         else:
    #             print(school, name)
            


        # print("SCHOOL: ", school, ", ", x) 



if __name__ == "__main__":
    # whether to print out info
    debug = False
    # the Selenium Chrome driver
    driver = Chrome(executable_path=PATH_TO_SELENIUM_DRIVER)
    # store all of the data
    json_data = {}
    # maps department code to school 
    getDepartmentToSchoolMapping(driver)

    # school_soup = scrape(driver, URL_TO_CATALOGUE)
    # getAllProfessors(school_soup, json_data)

    # print(json_data)
    driver.quit()