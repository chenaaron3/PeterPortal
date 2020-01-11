import React from "react";
import "./App.css";
import { get } from "lodash";

import {
  SearchkitManager,
  SearchkitProvider,
  SearchBox,
  Hits,
  NoHits,
  SearchkitComponent,
  HitItemProps
} from "searchkit";

const searchkit = new SearchkitManager("http://localhost:9200/courses/");

const HitItem = (props) => (
  <div className="hits_item">
    <div className="hits_result" dangerouslySetInnerHTML={{__html: get(props.result,"highlight.title",props.result._source.course_id)}}></div>
    <div className="hits_result" dangerouslySetInnerHTML={{__html: get(props.result,"highlight.title",props.result._source.course_name)}}></div>
    <div className="hits_result" dangerouslySetInnerHTML={{__html: get(props.result,"highlight.title",props.result._source.department)}}></div>
  </div>
);

class App extends React.Component {
  render() {
      return (
      <div className="App">
        <SearchkitProvider searchkit={searchkit}>
          <div>
            <SearchBox
              searchOnChange={true}
              queryOptions={{ analyzer: "standard" }}
              queryFields={["course_id", "course_name"]}
            />
            <Hits hitsPerPage={10} sourceFilter={["course_id", "course_name", "department"]} itemComponent={HitItem}/>
        </div>
        </SearchkitProvider>  
        <p>hello world</p>
      </div>
    )
  }
};

export default App;
