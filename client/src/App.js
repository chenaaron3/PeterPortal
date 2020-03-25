import React from "react";
import "./App.scss";
import SearchPage from "./Components/SearchPage";
import CoursePage from "./Components/CoursePage";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";
import { Input, Menu } from "semantic-ui-react";
import ElasticCloudInfo from "./ElasticCloudInfo";

import {
  SearchkitManager, SearchkitProvider, SearchBox, Hits
} from "searchkit";

class App extends React.Component {
  state = { activeItem: "home" };

  render() {
    const { activeItem } = this.state;

    return (
      <SearchkitProvider searchkit={new SearchkitManager("https://search-icssc-om3pkghp24gnjr4ib645vct64q.us-west-2.es.amazonaws.com/courses")}>
      {/* <ReactiveBase app="courses" url={ElasticCloudInfo.elasticEndpointURL}> */}
        <Router>
          <div className={"top-bar"} style={{ overflowX: "hidden" }}>
            <Menu secondary inverted>
              <Menu.Item>
                <div style={{ marginLeft: "36px" }}>
                  <a href="/" role="button" style={{ color: "white" }}>
                    PeterPortal
                  </a>
                </div>
              </Menu.Item>

              <Menu.Item style={{ marginLeft: "240px", width: "40%" }}>
                <div style={{ width: "100%" }}>

                  <SearchBox
                  searchOnChange={true}
                  queryFields={["id_department^10", "id_number^10", "description", "dept_alias^10", "name^3"]}
                  searchThrottleTime={300}
                  placeholder={"Course number, title and description"}
                  />
                </div>
              </Menu.Item>

              {/* <Menu.Menu position="right">
                <Menu.Item
                  name="logout"
                  active={activeItem === "logout"}
                  onClick={this.handleItemClick}
                />
              </Menu.Menu> */}
            </Menu>
          </div>

          {/* <h5 style={{textAlign: "center", color: "gray"}}>UCI Catalogue Search - alpha v1.0</h5>
          <h5 style={{textAlign: "center", color: "light-gray"}}><a href="https://github.com/icssc-projects/uci-catalogue-search/issues/new">If you see something, say something!</a></h5> */}

          <Switch>
            <Route exact path="/">
              <SearchPage />
            </Route>
            <Route path="/course/:id" component={CoursePage} />
          </Switch>
        </Router>
      {/* </ReactiveBase> */}
      </SearchkitProvider>
    );
  }
}

export default App;
