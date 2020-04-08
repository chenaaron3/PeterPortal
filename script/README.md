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
Generate Class JSON -> Deploy the Class JSON Data to ElasticSearch
Generate Professor JSON -> Deploy the Professor JSON Data to ElasticSearch

Generate Class JSON:
1. cd into script
2. Run 'python Scraper.py'

Generate Professor JSON:
1. cd into script
2. Run 'python professorscrape.py'

Cloud Deploy Data (in Bulk) to AWS ElasticSearch:  
1. cd into script
2. Uncomment corresponding 'indexToDelete' variable in deleteelasticcloud.py
3. Uncomment desired 'jsonToUpload' variable in deployelasticcloud.py
4. Run 'npm run deployElastic'