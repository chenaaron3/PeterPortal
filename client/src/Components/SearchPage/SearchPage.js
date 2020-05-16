import React from "react";
import "./SearchPage.scss";
import CourseFilter from "./CourseFilter.js";
import ProfessorFilter from "./ProfessorFilter.js";
import ProfessorHitItem from "./ProfessorHitItem.js";
import CourseHitItem from "./CourseHitItem.js";
import { Icon, Menu } from "semantic-ui-react";
import {
    Pagination,
    SearchkitComponent,
    Hits, HitsStats,
    InitialLoader, SearchBox,
    SearchkitManager, SearchkitProvider, SelectedFilters
} from "searchkit";

const InitialLoaderComponent = props => <div>Fetching course data...</div>;

const customHitStats = props => (
    <div>
        <p style={{ textAlign: "right", fontSize: "8pt" }}>{props.hitsCount.value} results found in {props.timeTaken}ms</p>
    </div>
)

const SelectedFilter = (props) => (
    <div className={"sk-selected-filters-option sk-selected-filters__item"}>
      <div className={props.bemBlocks.option("name")}>{props.labelValue}</div>
      <div className={props.bemBlocks.option("remove-action")} onClick={props.removeFilter}>x</div>
    </div>
  )

class SearchPage extends SearchkitComponent {

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
        let searchkit = new SearchkitManager("/" + this.props.match.params.index);
        return (
            <SearchkitProvider searchkit={searchkit}>
                <div className="App" style={{ display: "flex", flexDirection: "row" }}>
                    <div className="search-page">
                        <div className="sidebar-container">
                            <Menu pointing secondary vertical className="mode-switcher">
                                <a href="/search/courses">
                                    <Menu.Item
                                        name="courses"
                                        icon="book"
                                        active={this.props.match.params.index === "courses"}
                                    />
                                </a>
                                <a href="/search/professors">
                                    <Menu.Item
                                        name="professors"
                                        icon="graduation cap"
                                        active={this.props.match.params.index === "professors"}
                                    />
                                </a>
                            </Menu>

                            {this.props.match.params.index === "courses" && <CourseFilter />}
                            {this.props.match.params.index === "professors" && <ProfessorFilter />}

                        </div>

                        <div className="search-pane-container">

                            <div className="searchbox-container">
                                <div style={{ display: "flex" }}>
                                    <Icon name='search' size='large' className="search-icon" />
                                    <SearchBox
                                        autofocus={true}
                                        searchOnChange={true}
                                        queryFields={this.queryFieldValues[this.props.match.params.index]}
                                        searchThrottleTime={300}
                                        placeholder={this.props.match.params.index === "courses" ? "Course number, title and description" : "Professor name, title, and department"}
                                    />
                                </div>

                                <div>
                                    <HitsStats component={customHitStats} />
                                </div>
                            </div>


                            <div style={{ minHeight: "100vh", paddingTop: "80px", marginLeft: "34px" }}>
                            <SelectedFilters itemComponent={SelectedFilter} />
                                <Hits
                                    itemComponent={this.props.match.params.index === "courses" ? CourseHitItem : ProfessorHitItem}
                                    hitsPerPage={20}
                                    highlightFields={this.highlightFieldValues[this.props.match.params.index]}
                                    customHighlight={{
                                        pre_tags: ["<highlight>"],
                                        post_tags: ["</highlight>"],
                                    }}
                                />
                            </div>

                            <InitialLoader component={InitialLoaderComponent} />

                            <Pagination showNumbers={true} />

                            <footer className="footer">
                                <div>
                                    <a href="https://github.com/icssc-projects">Github</a>
                                    <a href="/">API</a>
                                    <a href="/">About</a>
                                    <a href="/">Team</a>
                                    <a href="/">FAQ</a>
                                </div>
                                <div className="copyright">
                                    <p>Made with ♥ by <a href="https://studentcouncil.ics.uci.edu/">ICSSC Project Committee</a></p>
                                </div>
                            </footer>

                        </div>
                    </div>
                </div>
            </SearchkitProvider>
        );
    }

}

export default SearchPage;