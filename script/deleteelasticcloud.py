import requests
import json
import os
from dotenv import load_dotenv
import sys

# activate .env
load_dotenv()

"""
Deleting an Index From Elasticsearch on AWS
1. Log on to AWS Elasticsearch console.
2. Copy the endpoint URL to the elasticEndpointURL variable
3. Run this script with an index argument (python deleteelasticcloud.py [courses|professors])
"""

validIndices = ["courses", "professors"]

elasticEndpointURL = os.getenv("ELASTIC_ENDPOINT_URL")
if len(sys.argv) < 2:
  sys.exit("Error: Please provide an index as an argument")
if sys.argv[1] not in validIndices:
  sys.exit(f"Error: Index not available. Given: {sys.argv[1]}. Expected: {validIndices}")
indexToDelete = sys.argv[1]

url = elasticEndpointURL + "/" + indexToDelete

r = requests.delete(url)
print(r.text)