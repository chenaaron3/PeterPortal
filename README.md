Dependencies:  
    Do these once:  
    - pip install beautifulsoup4 selenium  
    - Install selenium Chrome driver (https://sites.google.com/a/chromium.org/chromedriver/downloads)  
        - add executable to PATH (https://selenium.dev/documentation/en/webdriver/driver_requirements/#quick-reference)  
    Do these after every pull:  
    - yarn install  

Basic Workflow:
Generate Class JSON -> Deploy the Class JSON Data to ElasticSearch -> View the Webpage on React

How to Generate Class JSON:
1. Run Scraper.py
2. View the json named ics_courses.json at the project root directory

Configure Data Deployment Settings:
1. Add the following lines to the bottom of your 'path-to-elasticsearch/config/elasticsearch.yml' file.  
http.cors.enabled : true    
http.cors.allow-origin : "*"  
http.cors.allow-methods : OPTIONS, HEAD, GET, POST, PUT, DELETE  
http.cors.allow-headers : X-Requested-With,X-Auth-Token,Content-Type, Content-Length  

Locally Deploy Data (in Bulk) to ElasticSearch:
1. Start the ElasticSearch instance by running your 'path-to-elasticsearch/bin/elasticsearch.bat' file
2. Uncomment r = requests.put(url, data=data, headers=headers). Comment out the other request lines (indicated by comments)
3. Make sure the url var is set to http://localhost:9200/_bulk/
4. Run elasticdemo.py

How to Locally View Webpage on React:
1. Run yarn start
2. Start searching classes on the searchbar

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
