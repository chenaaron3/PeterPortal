import requests
import json

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

with open('C:\\Users\\User\\Documents\\Code\\uci-catalogue-search\\ics_courses.json') as f:
  data = f.read()

# print(data)
# r = requests.put(url, data=json.dumps(data), headers=headers)    #non bulk
r = requests.put(url, data=data, headers=headers)                    #bulk api
# r = requests.get(url, data=json.dumps(doc), headers=headers)
# r = requests.delete(url)
print(r.text)