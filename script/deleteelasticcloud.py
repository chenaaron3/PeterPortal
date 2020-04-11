import requests
import json
import os
from dotenv import load_dotenv

# activate .env
load_dotenv()

"""
Deleting an Index From Elasticsearch on AWS
1. Log on to AWS Elasticsearch console.
2. Copy the endpoint URL to the elasticEndpointURL variable
3. Run this script (python deleteelasticcloud.py)
"""

old = "https://search-icssc-om3pkghp24gnjr4ib645vct64q.us-west-2.es.amazonaws.com"

elasticEndpointURL = os.getenv("ELASTIC_ENDPOINT_URL")
# elasticEndpointURL = old

<<<<<<< HEAD
indexToDelete = 'courses'
=======
# indexToDelete = 'courses'
>>>>>>> df180f7d48ae1c6504f3850af9746f9745ab1438
# indexToDelete = 'professors'

url = elasticEndpointURL + "/" + indexToDelete

r = requests.delete(url, auth=(os.getenv("ELASTIC_BASICAUTH_USER"), os.getenv("ELASTIC_BASICAUTH_PASS")))
# r = requests.delete(url)
print(r.text)