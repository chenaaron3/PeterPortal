import React from "react";
import "./App.css";
import SearchPage from "./Components/SearchPage"
import CoursePage from "./Components/CoursePage";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


class App extends React.Component {
  render() {
      return (
        <Router>
          <h5 style={{textAlign: "center", color: "gray"}}>UCI Catalogue Search - alpha v1.0</h5>
          <h5 style={{textAlign: "center", color: "light-gray"}}><a href="https://github.com/icssc-projects/uci-catalogue-search/issues/new">If you see something, say something!</a></h5>
          <Switch>
            <Route exact path="/">
              <SearchPage />
            </Route>
            <Route path="/course/:id" component={CoursePage} />

          </Switch>
        </Router>
    )
  }
};

export default App;
