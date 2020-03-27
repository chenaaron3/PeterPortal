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


def scrape(driver, url):
    # Use Selenium to load entire page
    # driver.get(url)
    # html = driver.page_source
    school_options = ['ARTS', 'ICS', 'ENGR', 'GSM', 'BIOSCI', 'DEPTED', 'HUM', 'LAW', 'COM',
                    'HS', 'PUBHLTH', 'PHRMSCI', 'NURSCI', 'PHYSSCI', 'SOCECO', 'SOCSCI']
    
    data = {'first': 'ICS', 'second': 'no-dept-selected'}
    x = requests.post(URL_TO_CATALOGUE, data = data)

    html = x.text
    # Use requests to load part of the page (Way faster than Selenium)
    # html = requests.get(url).text
    return BeautifulSoup(html, 'html.parser')

def getAllProfessors(soup, json_data):

    emailRegex = re.compile(r"\s+(?P<email>(?P<ucinetid>.*)@.*uci.edu)")
    phoneRegex = re.compile(r"\(\d{3}\) \d{3}-\d{4}")
    table = soup.find('div', id='content')
    x = 0
    for info in table.select('p'):
        name = info.b.text.strip()
        email = emailRegex.search(info.text)
        phone = phoneRegex.search(info.text)
        if email and phone:
            print('Name:', name, "email:", email.group('email'), "phone:",phone.group(0))
            x += 1
    print(x)
    # for info in soup.select("#result_top"):
    #     name = info.p.b.text
    #     email = emailRegex.search(info.text)
    #     phone = phoneRegex.search(info.text)
    #     if email and phone:
    #         print(name, email.group('email'), phone.group(0))



if __name__ == "__main__":
    # whether to print out info
    debug = False
    # the Selenium Chrome driver
    driver = 0#Chrome(executable_path=PATH_TO_SELENIUM_DRIVER)
    # store all of the data
    json_data = {}
    # maps department code to school 
    # school_options = ['ARTS', 'ICS', 'ENGR', 'GSM', 'BIOSCI', 'DEPTED', 'HUM', 'LAW', 'COM',
    #                 'HS', 'PUBHLTH', 'PHRMSCI', 'NURSCI', 'PHYSSCI', 'SOCECO', 'SOCSCI']
    # for school in school_options:
    #     data = {'first': school, 'second': 'no-dept-selected'}
    #     x = requests.post(URL_TO_CATALOGUE, data = data)
        
    #     print(x.text)

    soup = scrape(driver, URL_TO_CATALOGUE)
    getAllProfessors(soup, json_data)

    print(json_data)
    # driver.quit()