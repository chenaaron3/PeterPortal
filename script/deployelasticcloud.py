import requests
import json
import os
from dotenv import load_dotenv

# activate .env
load_dotenv()

"""
Setting Up Elasticsearch on AWS
1. Following the steps in (https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-gsg-create-domain.html)
2. Set access policy to "Allow open access to the domain"
3. Copy the endpoint URL to the elasticEndpointURL variable
Deploying to AWS
4. Run this script (python deployelasticcloud.py)
"""

old = "https://search-icssc-om3pkghp24gnjr4ib645vct64q.us-west-2.es.amazonaws.com"

elasticEndpointURL = os.getenv("ELASTIC_ENDPOINT_URL")
# elasticEndpointURL = old

# jsonToUpload = "resources/all_courses.json"
# jsonToUpload = "resources/all_professors.json"

headers = {
    'Content-type' : 'application/json'
}
path_to_json = os.path.abspath(os.path.join(os.path.dirname( __file__ ), jsonToUpload))

url = elasticEndpointURL + "/_bulk/"

with open(path_to_json) as f:
  data = f.read()

r = requests.put(url, data=data, headers=headers, auth=(os.getenv("ELASTIC_BASICAUTH_USER"), os.getenv("ELASTIC_BASICAUTH_PASS")))
# r = requests.put(url, data=data, headers=headers)
print(r)