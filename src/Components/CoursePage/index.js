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

  componentDidMount(){
    this.getCourseData();
    // this.getWebSOC();
  }

//   getWebSOC(){
//       var formParams = "YearTerm=2020-03&ShowFinals=on&Dept=I%26C%20SCI&CourseNum=32"

//       var requestHeader = {
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             "Access-Control-Allow-Origin": "*"
//         },
//         body: formParams,
//         method: "POST"
//         };

//       fetch("https://www.reg.uci.edu/perl/WebSoc/", requestHeader).then(data => {console.log(data)})
//   }

  render() {
      
      return (    
        <div style={{width: "800px", margin: "auto"}}><h1>{this.state.courseData.number}</h1>
        <h2>{this.state.courseData.name}</h2>
        <h3>{this.state.courseData.department}</h3>
        {this.state.courseData.description}<br/><br/>
        {this.state.courseData.prerequisite}</div>
    )
  }
};

export default CoursePage;
