import React from "react";
import { ReactiveBase, DataSearch, ReactiveList } from '@appbaseio/reactivesearch';
import ElasticCloudInfo from "../../ElasticCloudInfo";

class SearchPage extends React.Component {
  render() {
      return (
        <ReactiveBase
          app="donaldbrenschoolofinformationandcomputersciences"
          url={ElasticCloudInfo.elasticEndpointURL}
			  >
        <div className="App">
        <DataSearch style={{width: "500px", margin: "auto"}} componentId="q"  dataField={['number', 'name', 'description']} autosuggest={false} URLParams={true}/>
        <div style={{maxHeight: "80vh", overflowY: "scroll"}}>
        <ReactiveList
            componentId="SearchResult"
            infiniteScroll={true}
            dataField={'number'}
            size={30}
            react={{
              and: ["q"],
            }}
          renderItem={res => <div><a href={"/course/" + res._id}>{res.number}&nbsp;{res.name}</a><br/> <p style={{width: "500px", margin: "auto"}}>{res.description}</p><br/><br/></div>}
          />
        </div>
          
        </div>
        </ReactiveBase>
    )
  }
};

export default SearchPage;
