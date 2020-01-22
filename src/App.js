import React from 'react';
import './App.css';

import {
  SearchkitManager, SearchkitProvider, SearchBox, Hits, NoHits, SearchkitComponent, HitItemProps
} from "searchkit";

const searchkit = new SearchkitManager("http://localhost:9200/accounts/");

function App() {
  return (
    <div className="App">
      <SearchkitProvider searchkit={searchkit}>
          <div>
              <SearchBox searchOnChange={true}
                queryOptions={{analyzer:"standard"}}
                queryFields={["course_id"]} />
              <Hits/>
          </div>
      </SearchkitProvider>
    </div>
  );
}

export default App;
