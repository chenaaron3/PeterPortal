import requests
import json
import os

headers = {
    'Content-type' : 'application/json'
}

url = "localhost:9200/_bulk/"

path_to_json = os.path.abspath(os.path.join(os.path.dirname( __file__ ), 'ics_courses.json'))

with open(path_to_json) as f:
  data = f.read()

r = requests.put(url, data=data, headers=headers) 
print(r.text)