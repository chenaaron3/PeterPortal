import React from "react";
import "./App.scss";
import "./branding.scss";
import SearchPage from "./Components/SearchPage/SearchPage";
import CoursePage from "./Components/CoursePage/CoursePage";
import NavBar from "./Components/NavBar/NavBar";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";


import { SearchkitManager, SearchkitProvider } from "searchkit";

class App extends React.Component {
  render() {
    return (
      // <SearchkitProvider {/*searchkit= {
<<<<<<< HEAD
      //   new SearchkitManager("/courses")
=======
      //   new SearchkitManager("https://search-icssc-om3pkghp24gnjr4ib645vct64q.us-west-2.es.amazonaws.com/professors")
>>>>>>> df180f7d48ae1c6504f3850af9746f9745ab1438
      // */}>
        <Router>
          <NavBar/>
          <Switch>
            <Route exact path="/">
              <Redirect to="/search" />
            </Route>
            <Route path="/search" component={SearchPage} />
            <Route path="/course/:id" component={CoursePage} />
          </Switch>
        </Router>

      // </SearchkitProvider>
    );
  }
}

export default App;
