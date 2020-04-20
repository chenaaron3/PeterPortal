import React from "react";
import "./App.scss";
import "./branding.scss";
import SearchPage from "./Components/SearchPage/SearchPage";
import CoursePage from "./Components/CoursePage/CoursePage";
import ProfessorPage from "./Components/ProfessorPage/ProfessorPage";
import NavBar from "./Components/NavBar/NavBar";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

class App extends React.Component {

  
  
  render() {
    return (
      // <SearchkitProvider {/*searchkit= {
      //   new SearchkitManager("/courses")
      // */}>
        <Router>
          <NavBar/>
          <Switch>
            <Route exact path="/">
              <Redirect to="/search" />
            </Route>
            <Route path="/search" component={SearchPage} />
            <Route path="/course/:id" component={CoursePage} />
            <Route path="/professor/:id" component={ProfessorPage} />
          </Switch>
        </Router>

      // </SearchkitProvider>
    );
  }
}

export default App;
