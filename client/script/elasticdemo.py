import requests
import json
import os


headers = {
    'Content-type' : 'application/json'
}

doc = {
  "q" : "Introduction"
}

# data = {
#   "name" : "Raman Gupta"
# }

url = "http://localhost:9200/_bulk/"

path_to_json = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'ics_courses.json'))
print("FILE:", path_to_json)

with open(path_to_json) as f:
  data = f.read()

# print(data)
# r = requests.put(url, data=json.dumps(data), headers=headers)    #non bulk
r = requests.put(url, data=data, headers=headers)                    #bulk api
# r = requests.get(url, data=json.dumps(doc), headers=headers)
# r = requests.delete(url)
print(r.text)