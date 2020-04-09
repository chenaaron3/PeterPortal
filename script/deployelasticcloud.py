import requests
import json
import os

"""
Setting Up Elasticsearch on AWS
1. Following the steps in (https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-gsg-create-domain.html)
2. Set access policy to "Allow open access to the domain"
3. Copy the endpoint URL to the elasticEndpointURL variable
Deploying to AWS
4. Run this script (python deployelasticcloud.py)
"""

# Username: PeterPortal
# Password: PeterPortal1!

elasticEndpointURL = 'https://search-icssc-om3pkghp24gnjr4ib645vct64q.us-west-2.es.amazonaws.com'
jsonToUpload = "resources/all_courses.json"
# jsonToUpload = "resources/all_professors.json"

headers = {
    'Content-type' : 'application/json'
}
path_to_json = os.path.abspath(os.path.join(os.path.dirname( __file__ ), jsonToUpload))

url = elasticEndpointURL + "/_bulk/"

with open(path_to_json) as f:
  data = f.read()

r = requests.put(url, data=data, headers=headers)
print("Deploy Finished")

# Below method only has 14 day trial. Keeping it just in case.
"""
Deploying Elasticsearch on Elastic Cloud
Creating Deployment:
1. Sign Up at https://www.elastic.co/cloud/elasticsearch-service/signup
2. Click Start your free trial
3. Name deployment ICSSC
4. Select AWS as cloud platform
5. Select US West (N. California) as region
6. Click Create deployment
Assigning Variables:
7. Copy username and password into variables below
8. Once configuration is complete, click on Elasticsearch on the sidebar
9. Click Copy Endpoint URL and paste it to the variable below
10. Copy the username, password, and elasticEndpointURL into the client/src/ElasticCloudInfo.js file
Enabling CORS:
10. Click on Edit on the sidebar
11. Expand User setting overrides
12. Copy the following lines on the bottom of the textbox:
http.cors.enabled : true    
http.cors.allow-credentials: true
http.cors.allow-origin : "*"  
http.cors.allow-methods : OPTIONS, HEAD, GET, POST, PUT, DELETE  
http.cors.allow-headers: X-Requested-With, X-Auth-Token, Content-Type, Content-Length, Authorization, Access-Control-Allow-Headers, Accept
13. Save and Confirm the changes
Indexing Bulk Data:
14. Run this script (python deployelasticcloud.py)
15. Data is now indexed on the cloud!
"""
# username = "elastic"
# password = "Gc7ecBMkO24984qIxxiqf2c0"
# elasticEndpointURL = "https://8f5e65d81d65440597feb43c188e1c50.us-west-1.aws.found.io:9243"