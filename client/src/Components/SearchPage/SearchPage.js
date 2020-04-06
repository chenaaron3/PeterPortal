import React from "react";
import { get } from "lodash";
import "./SearchPage.scss";
import CourseFilter from "./CourseFilter.js";
import { Icon, Menu } from "semantic-ui-react";
import {
  Pagination,
  SearchkitComponent,
  Hits,
  NoHits,
  InitialLoader,
} from "searchkit";
import { SearchBox, SearchkitManager, SearchkitProvider } from "searchkit";

const InitialLoaderComponent = (props) => <div>Fetching course data...</div>;

const HitItem = (props) => (
  <div>
    <div>
      <a href={"/course/" + props.result._id}>
        <h3>
          <span
            className={props.bemBlocks.item("id_department")}
            dangerouslySetInnerHTML={{
              __html: get(
                props.result,
                "highlight.id_department",
                props.result._source.id_department
              ),
            }}
          ></span>
          &nbsp;
          <span
            className={props.bemBlocks.item("id_number")}
            dangerouslySetInnerHTML={{
              __html: get(
                props.result,
                "highlight.id_number",
                props.result._source.id_number
              ),
            }}
          ></span>
          &nbsp;
          <span
            className={props.bemBlocks.item("name")}
            dangerouslySetInnerHTML={{
              __html: get(
                props.result,
                "highlight.name",
                props.result._source.name
              ),
            }}
          ></span>
        </h3>
      </a>
      <h4 className={"course-department_unit"}>
        {props.result._source.department}&nbsp;･&nbsp;
        {props.result._source.units[0]} units
      </h4>
      <p
        className={props.bemBlocks.item("description")}
        dangerouslySetInnerHTML={{
          __html: get(
            props.result,
            "highlight.description",
            props.result._source.description
          ),
        }}
      ></p>
      <p>{props.result._source.prerequisite}</p>

      <p className={"course-department_unit"}>
        {props.result._source.ge_string}
      </p>

      <br />
    </div>
  </div>
);

class SearchPage extends SearchkitComponent {
  state = { activeItem: "courses" };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;

    return (
      <SearchkitProvider
        searchkit={
          new SearchkitManager(
            "https://search-icssc-om3pkghp24gnjr4ib645vct64q.us-west-2.es.amazonaws.com/courses"
          )
        }
      >
        <div className="App" style={{ display: "flex", flexDirection: "row" }}>
          <div className="search-page">

              <div className="sidebar-container">
                <Menu pointing secondary vertical className="mode-switcher">
                  <Menu.Item
                    name="courses"
                    icon="book"
                    active={activeItem === "courses"}
                    onClick={this.handleItemClick}
                  />
                  <Menu.Item
                    name="professors"
                    icon="graduation cap"
                    active={activeItem === "professors"}
                    onClick={this.handleItemClick}
                  />
                </Menu>
                <CourseFilter/>
              </div>

              <div className="search-pane-container">
                <div className="searchbox-container">
                  <Icon name='search' size='large' className="search-icon"/>
                  <SearchBox
                    searchOnChange={true}
                    queryFields={[
                      "id_department^10",
                      "id_number^10",
                      "description",
                      "dept_alias^10",
                      "name^3",
                    ]}
                    searchThrottleTime={300}
                    placeholder={"Course number, title and description"}
                  />
                </div>
                
                <div>
                  <Hits
                    itemComponent={HitItem}
                    hitsPerPage={20}
                    highlightFields={[
                      "name",
                      "id_department",
                      "id_number",
                      "description",
                    ]}
                    customHighlight={{
                      pre_tags: ["<highlight>"],
                      post_tags: ["</highlight>"],
                    }}
                  />
                </div>

                <InitialLoader component={InitialLoaderComponent} />

                <Pagination showNumbers={true} />
              </div>

              <div>
                
              </div>
            </div>
        </div>
      </SearchkitProvider>
    );
  }
}

export default SearchPage;
