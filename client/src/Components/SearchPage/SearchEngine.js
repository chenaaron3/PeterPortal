import React from "react";
import "./SearchPage.scss";
import CourseFilter from "./CourseFilter.js";
import ProfessorHitItem from "./ProfessorHitItem.js";
import CourseHitItem from "./CourseHitItem.js";
import { Icon, Menu } from "semantic-ui-react";
import { Pagination, SearchkitComponent, Hits, NoHits, InitialLoader, SearchBox, SearchkitManager, SearchkitProvider } from "searchkit";

const InitialLoaderComponent = (props) => <div>Fetching course data...</div>;

class SearchEngine extends SearchkitComponent {

    queryFieldValues = {
        "courses": [
          "id_department^10",
          "id_number^10",
          "description",
          "dept_alias^10",
          "name^3",
        ],
        "professors": [
          "name^10",
          "ucinetid^10",
          "title^3",
          "courseHistory",
          "department^3",
        ]
      }
      highlightFieldValues = {
        "courses": [
          "name",
          "id_department",
          "id_number",
          "description",
        ],
        "professors": [
          "name",
          "title",
          "department",
          "courseHistory"
        ]
      }
      
    render() {
        let searchkit = new SearchkitManager(process.env.REACT_APP_ELASTIC_ENDPOINT_URL + this.props.activeItem,  
                        {basicAuth: `${process.env.REACT_APP_ELASTIC_BASICAUTH_USER}:${process.env.REACT_APP_ELASTIC_BASICAUTH_PASS}`});
        return (
            <SearchkitProvider searchkit={searchkit}>
                <div className="App" style={{ display: "flex", flexDirection: "row" }}>
                    <div className="search-page">
                        <div className="sidebar-container">
                            <Menu pointing secondary vertical className="mode-switcher">
                                <Menu.Item
                                    name="courses"
                                    icon="book"
                                    active={this.props.activeItem === "courses"}
                                    onClick={this.props.handleItemClick}
                                />
                                <Menu.Item
                                    name="professors"
                                    icon="graduation cap"
                                    active={this.props.activeItem === "professors"}
                                    onClick={this.props.handleItemClick}
                                />
                            </Menu>
                            
                            {this.props.activeItem == "courses" && <CourseFilter/>}

                            <div class="footer">
                                <a href="https://github.com/icssc-projects">Github</a>
                                <a href="/">API</a>
                                <a href="/">About</a>
                                <a href="/">Team</a>
                                <a href="/">FAQ</a>
                                <div class="copyright">
                                    <br/>
                                    <p>Made with ♥ by <a href="https://studentcouncil.ics.uci.edu/">ICSSC Project Committee</a>
                                    <br/>Copyright © 2020, ICSSC.</p>
                                </div>
                            </div>
                        </div>

                        <div className="search-pane-container">
                            <div className="searchbox-container">
                                <Icon name='search' size='large' className="search-icon"/>
                                <SearchBox
                                    searchOnChange={true}
                                    queryFields={this.queryFieldValues[this.props.activeItem]}
                                    searchThrottleTime={300}
                                    placeholder={this.props.activeItem == "courses" ? "Course number, title and description" : "Professor name, title, and department"}
                                />
                            </div>
                            
                            <div>
                                <Hits
                                    itemComponent={this.props.activeItem == "courses" ? CourseHitItem : ProfessorHitItem}
                                    hitsPerPage={20}
                                    highlightFields={this.highlightFieldValues[this.props.activeItem]}
                                    customHighlight={{
                                    pre_tags: ["<highlight>"],
                                    post_tags: ["</highlight>"],
                                    }}
                                />
                            </div>

                            <InitialLoader component={InitialLoaderComponent} />

                            <Pagination showNumbers={true} />
                        </div>
                    </div>
                </div>
            </SearchkitProvider>
        );
    }

}

export default SearchEngine;