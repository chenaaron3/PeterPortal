import requests
import json
import os

"""
Deleting an Index From Elasticsearch on AWS
1. Log on to AWS Elasticsearch console.
2. Copy the endpoint URL to the elasticEndpointURL variable
3. Run this script (python deleteelasticcloud.py)
"""

elasticEndpointURL = 'https://search-icssc-om3pkghp24gnjr4ib645vct64q.us-west-2.es.amazonaws.com'
indexToDelete = 'donaldbrenschoolofinformationandcomputersciences'

url = elasticEndpointURL + "/" + indexToDelete

r = requests.delete(url)
print(r.text)