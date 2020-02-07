Dependencies:  
    Do these once:  
    - pip install beautifulsoup4 selenium requests  
    - Download elasticsearch (https://www.elastic.co/downloads/elasticsearch)  

Possbile Errors:  
    Error: 'chromedriver.exe' executable may have wrong permissions.  
    Solution: run chmod 755 chromedriver.exe in the client/script directory  

Basic Workflow:
Generate Class JSON -> Deploy the Class JSON Data to ElasticSearch -> View the Webpage on React

How to Generate Class JSON:
1. cd into client/script
2. Run 'python Scraper.py'
3. View the json named ics_courses.json in the client/script folder  
COPY PASTA:  
```
cd client/script  
python Scraper.py  
cat ics_courses.json  
cd ../..
```

Configure Data Deployment Settings:
1. Add the following lines to the bottom of your 'path-to-elasticsearch/config/elasticsearch.yml' file.  
```
http.cors.enabled : true    
http.cors.allow-origin : "*"  
http.cors.allow-methods : OPTIONS, HEAD, GET, POST, PUT, DELETE  
http.cors.allow-headers : X-Requested-With,X-Auth-Token,Content-Type, Content-Length  
```

Locally Deploy Data (in Bulk) to ElasticSearch:
1. Start the ElasticSearch instance by running your 'path-to-elasticsearch/bin/elasticsearch.bat' file  
2. cd into client/script
3. Run 'python deployelastic.py'  
COPY PASTA:  
```
cd client/script  
python deployelastic.py  
cd ../..
```

Cloud Deploy Data (in Bulk) to ElasticSearch:  
1. Look into the client/script/deployelasticcloud.py file for instructions

How to Locally View Webpage on React:
1. cd into client
2. Run yarn start or npm start
3. Start searching classes on the searchbar

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
