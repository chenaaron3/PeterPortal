import React from "react";


class CoursePage extends React.Component {

  constructor(props){
      super(props);

      this.state = {
          courseData: {}
      }
  }

  getCourseData() {
    var searchParams = {
        "query": {
          "terms": {
            "_id": [ this.props.match.params.id ] 
          }
        }
      }

    var requestHeader = {
    headers: {
        "content-type": "application/json; charset=UTF-8",
        "content-length": 140
    },
    body: JSON.stringify(searchParams),
    method: "POST"
    };

    fetch("http://localhost:9200/_search", requestHeader).then(data => {return data.json()}).then(res => {this.setState({courseData: res.hits.hits[0]._source})})
  }

  render() {
      this.getCourseData();
      
      return (    
        <div>{this.state.courseData.number}<br/><br/>
        {this.state.courseData.name}<br/><br/>
        {this.state.courseData.department}<br/><br/>
        {this.state.courseData.description}<br/><br/>
        {this.state.courseData.prerequisite}</div>
    )
  }
};

export default CoursePage;
