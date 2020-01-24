import React from "react";
import { ReactiveBase, DataSearch, ReactiveList } from '@appbaseio/reactivesearch';


class SearchPage extends React.Component {
  render() {
      return (
        <ReactiveBase
          app="donaldbrenschoolofinformationandcomputersciences"
          url="http://localhost:9200/"
			  >
        <div className="App">
        <DataSearch style={{width: "500px", margin: "auto"}} componentId="q"  dataField={['number', 'name', 'description']} autosuggest={false} URLParams={true}/>

        <ReactiveList
            componentId="SearchResult"
            react={{
              and: ["q"],
            }}
          renderItem={res => <div><a href={"/course/" + res._id}>{res.number}&nbsp;&nbsp;{res.name}</a><br/> <p style={{width: "500px", margin: "auto"}}>{res.description}</p><br/><br/></div>}
          />

          
        </div>
        </ReactiveBase>
    )
  }
};

export default SearchPage;
