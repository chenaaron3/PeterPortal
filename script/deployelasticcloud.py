import requests
import json
import os
from dotenv import load_dotenv
import sys

# activate .env
load_dotenv()

"""
Setting Up Elasticsearch on AWS
1. Following the steps in (https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-gsg-create-domain.html)
2. Set access policy to "Allow open access to the domain"
3. Copy the endpoint URL to the elasticEndpointURL variable
Deploying to AWS
4. Run this script (python deployelasticcloud.py [courses|professors])
"""

indexToJSON = {"courses": "resources/all_courses.json", 
               "professors": "resources/all_professors.json"}

elasticEndpointURL = os.getenv("ELASTIC_ENDPOINT_URL")
if len(sys.argv) < 2:
  sys.exit("Error: Please provide an index as an argument")
if sys.argv[1] not in indexToJSON:
  sys.exit(f"Error: Index not available. Given: {sys.argv[1]}. Expected: {list(indexToJSON.keys())}")
jsonToUpload = indexToJSON[sys.argv[1]]

headers = {
    'Content-type' : 'application/json'
}
path_to_json = os.path.abspath(os.path.join(os.path.dirname( __file__ ), jsonToUpload))

url = elasticEndpointURL + "/_bulk/"

with open(path_to_json) as f:
  data = f.read()

r = requests.put(url, data=data, headers=headers)
print(r)