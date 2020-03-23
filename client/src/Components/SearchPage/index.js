import React from "react";
import {
  ReactiveBase,
  DataSearch,
  ReactiveList,
  MultiDropdownList,
  SelectedFilters,
  MultiList
} from "@appbaseio/reactivesearch";
import ElasticCloudInfo from "../../ElasticCloudInfo";
import './filter.scss';

class SearchPage extends React.Component {
  render() {
    return (
      <ReactiveBase app="courses" url={ElasticCloudInfo.elasticEndpointURL}>
        <div className="App" style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: "220px", marginLeft: "36px" }}>
            {/* <SelectedFilters /> */}
            <MultiList
              componentId="GEFilter"
              queryFormat="or"
              dataField="ge_types.keyword"
              title="General Education"
              sortBy="asc"
              showCount={true}
              showSearch={false}
              innerClass={{
                title: 'filter-title',
                input: 'filter-input',
                list: 'filter-list',
                checkbox: 'filter-checkbox',
                label: 'filter-label',
                count: 'filter-count'
              }}
            />
            <MultiList
              componentId="CourseLevelFilter"
              queryFormat="or"
              dataField="course_level.keyword"
              title="Course Level"
              sortBy="desc"
              showCount={true}
              showSearch={false}
              innerClass={{
                title: 'filter-title',
                input: 'filter-input',
                list: 'filter-list',
                checkbox: 'filter-checkbox',
                label: 'filter-label',
                count: 'filter-count'
              }}
            />
            <MultiDropdownList
              title="School"
              componentId="SchoolFilter"
              dataField={"id_school.keyword"}
              innerClass={{
                title: 'filter-title',
                select: 'filter-select',
                label: 'filter-label',
              }}
              placeholder="Show all departments"
            />
            <MultiDropdownList
              title="Department"
              componentId="DeptFilter"
              dataField={"id_department.keyword"}
              innerClass={{
                title: 'filter-title',
                select: 'filter-select',
                list: 'filter-label',
              }}
              placeholder="Show all departments"
            />
          </div>
          <div style={{ width: "40%", marginLeft: "36px" }}>
            <DataSearch
              style={{ width: "100%", margin: "auto" }}
              componentId="q"
              dataField={["dept_alias", "id", "description"]}
              autosuggest={false}
              URLParams={true}
            />
            <div style={{ }}>
              <ReactiveList
                componentId="SearchResult"
                infiniteScroll={false}
                dataField={"id"}
                size={30}
                react={{
                  and: ["DeptFilter", "GEFilter", "CourseLevelFilter", "SchoolFilter", "q"]
                }}
                renderItem={res => (
                  <div key={res._id}>
                    <a href={"/course/" + res._id}>
                      {res.id}&nbsp;{res.name}
                    </a>

                    <p style={{}}>
                      {res.description}
                    </p>
                    <br />
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </ReactiveBase>
    );
  }
}

export default SearchPage;
