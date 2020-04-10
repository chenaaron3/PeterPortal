import requests
import json
import os
from dotenv import load_dotenv

# activate .env
load_dotenv()

elasticEndpointURL = os.getenv("ELASTIC_ENDPOINT_URL")

# Add missing professors
def addMissingProfessor(ucinetid, name, department):
    # check if not already indexed (ES GET)
    url = elasticEndpointURL + f"/professors/_doc/{ucinetid}"
    # response: found

    # if not already indexed
    # look up ucnetid on directory
    # get basics
    # look up related department from existing lists (generate from professors)
    # assign relatedDepartment
    # look up instructor history
    # assign coursesHistory
    
    # index to professor 
    # PUT /professors/_create/{ucinetid}
    
    # iterate coursesHistory
    # update professorHistory field for each course
    #  PUT /courses/_doc/{courseID}

if __name__ == "__main__":
    # poll sheets every 10 mins
    # lookup on Google Sheets
    # https://www.twilio.com/blog/2017/02/an-easy-way-to-read-and-write-to-a-google-spreadsheet-in-python.html
    # https://github.com/burnash/gspread
    # if spot change => make change