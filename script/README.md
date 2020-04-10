# Python Dependencies:  
    pip install beautifulsoup4 selenium elasticsearch requests progressbar python-dotenv gspread oauth2client

# Basic Workflows:
A. Generate Class JSON -> Deploy the Class JSON Data to ElasticSearch  
B. Generate Professor JSON -> Deploy the Professor JSON Data to ElasticSearch

## Generate Class JSON:
1. cd into script
2. Run 'python courseScraper.py'

## Generate Professor JSON:
1. cd into script
2. Run 'python professorScraper.py'

## Cloud Deploy Data (in Bulk) to AWS ElasticSearch:  
1. cd into script
2. Optionally uncomment corresponding 'indexToDelete' variable in deleteelasticcloud.py
3. Optionally delete the existing index by running 'python deleteelasticcloud.py'
4. Uncomment desired 'jsonToUpload' variable in deployelasticcloud.py
5. Index the data by running 'python deployelasticcloud.py'

# Deploying Scripts to AWS EC2 Instance:  
## Create an AWS EC2 Instance
1. Go to AWS EC2 Dashboard (https://aws.amazon.com/ec2/)  
2. Click 'Launch Instance'  
3. Select 'Ubuntu Server 18.04 LTS (HVM)'  
4. Click 'Review and Launch'  
5. Click 'Launch'  
6. Download keypair .pem file and store it at PATH_TO_PEM  

## Connect to AWS EC2 Instance
1. Open Command Prompt  
2. Follow instructions on https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html  
    - /path/my-key-pair.pem => PATH_TO_PEM  
    - ec2-user => 'ubuntu' (https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connection-prereqs.html#connection-prereqs-get-info-about-instance)  
    - ec2-198-51-100-1.compute-1.amazonaws.com => Public DNS value on AWS EC2 Dashboard  
    
## Setup Selenium in AWS EC2 Instance  
1. Install pip with the following commands:
    ```
    sudo apt update
    sudo apt install python3-pip
    ```
2. Install python dependencies specified above.
3. Install ChromeDriver with the following commands:
    ```
    cd ~
    mkdir temp
    cd temp
    wget https://chromedriver.storage.googleapis.com/2.37/chromedriver_linux64.zip
    sudo apt install unzip
    unzip chromedriver_linux64.zip
    sudo mv chromedriver /usr/bin/chromedriver
    ```
4. Install Google Chrome with the following commands:
    ```
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo apt install ./google-chrome-stable_current_amd64.deb
    ```

## Setup PeterPortal  
1. Clone the repository with the following commands:
    ```
    cd ~
    git clone https://github.com/icssc-projects/PeterPortal.git
    ```
2. Checkout to the correct branch

## Before Running courseScraper.py or courseScraper.py
1. Make sure to assign PATH_TO_SELENIUM_DRIVER variable to '/usr/bin/chromedriver' before running
2. Make sure the Selenium Driver is running headless
    ```
    ...
    # imports
    from selenium.webdriver import Chrome
    from selenium.webdriver.chrome.options import Options
    ...
    if __name__ == "__main__":
        ...
        # intiializing Selenium Driver
        options = Options()
        options.headless = True
        driver = Chrome(executable_path=PATH_TO_SELENIUM_DRIVER, options=options)
        ...
    ```

# Possbile Errors:  
    Error: 'chromedriver.exe' executable may have wrong permissions.  
        Solution: run chmod 755 chromedriver.exe in the client/script directory  
    Error: Failed at the camaro@3.0.16 install script.
        Solution: update npm to latest version
    Error: UnicodeEncodeError: 'charmap' codec can't encode character '\u2013' in position 105: character maps to <undefined>
        Solution: run 'chcp 65001' in terminal


