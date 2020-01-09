import requests
import json

headers = {
    'Content-type' : 'application/json'
}

doc = {
  "q" : "angel"
}

# data = {
#   "name" : "Raman Gupta"
# }

url = "http://localhost:9200/bank"

with open('C:\\Users\\User\\Documents\\Code\\uci-catalogue-search\\ics_courses.json') as f:
  data = f.read()

# r = requests.put(url, data=json.dumps(data), headers=headers)
# r = requests.put(url, data=data, headers=headers)
# r = requests.get(url)
r = requests.delete(url)
print(r.text)