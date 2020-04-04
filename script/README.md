Dependencies:  
    Do these once:  
    - pip install beautifulsoup4 selenium requests  
    - Download elasticsearch (https://www.elastic.co/downloads/elasticsearch)  

Possbile Errors:  
    Error: 'chromedriver.exe' executable may have wrong permissions.  
        Solution: run chmod 755 chromedriver.exe in the client/script directory  
    Error: Failed at the camaro@3.0.16 install script.
        Solution: update npm to latest version
    Error: UnicodeEncodeError: 'charmap' codec can't encode character '\u2013' in position 105: character maps to <undefined>
        Solution: run 'chcp 65001' in terminal

Basic Workflow:
Generate Class JSON -> Deploy the Class JSON Data to ElasticSearch -> View the Webpage on React

Generate JSON:
1. cd into script
2. Run 'npm run genJSON'

Cloud Deploy Data (in Bulk) to AWS ElasticSearch:  
1. cd into script
2. Run 'npm run deployElastic'

How to Locally View Webpage on React:
1. cd into script
2. Run yarn start or npm start
3. Start searching classes on the searchbar