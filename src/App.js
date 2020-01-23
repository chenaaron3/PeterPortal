import React from "react";
import "./App.css";
import { get } from "lodash";
import { ReactiveBase, DataSearch, ReactiveList } from '@appbaseio/reactivesearch';



const HitItem = (props) => (
  <div className="hits_item">
    <div className="hits_result" dangerouslySetInnerHTML={{__html: get(props.result,"highlight.number",props.result._source.number)}}></div>
    <div className="hits_result" dangerouslySetInnerHTML={{__html: get(props.result,"highlight.name",props.result._source.name)}}></div>
    <div className="hits_result" dangerouslySetInnerHTML={{__html: get(props.result,"highlight.department",props.result._source.department)}}></div>
  </div>
);

class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      query: ""
    }

  }

  render() {
      return (
        <ReactiveBase
          app="donaldbrenschoolofinformationandcomputersciences"
          url="http://localhost:9200/"
			  >
        <div className="App">
        <DataSearch componentId="q" autosuggest={true} dataField={['number', 'name', 'description']} autosuggest={false} URLParams={true}/>

        <ReactiveList
            componentId="SearchResult"
            dataField="ratings"
            react={{
              and: ["q"],
            }}
          renderItem={res => <div><a href={"/course?id=" + res._id}>{res.number}&nbsp;&nbsp;{res.name}</a><br/><p style={{width: "500px", margin: "auto"}}>{res.description}</p><br/><br/></div>}
          />

          
        </div>
        </ReactiveBase>
    )
  }
};

export default App;
