import React from "react";
import Timetable from "../Timetable"
import ReviewsModule from "../ReviewsModule";

class CoursePage extends React.Component {

  constructor(props){
      super(props);

      this.state = {
          WebSocData: null,
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

    fetch("http://localhost:9200/_search", requestHeader).then(data => {return data.json()}).then(res => {this.setState({courseData: res.hits.hits[0]._source}); this.getWebSOC();})
  }

  componentDidMount(){
    this.getCourseData();
    
  }

  getWebSOC(){
    var queryParams = this.state.courseData.number.split(" ");
    var requestHeader = {
        method: "GET"
        };

      // fetch("http://localhost:3000/websoc/" + queryParams[0] + "/" + queryParams[1], requestHeader).then(data => {return data.json()}).then(res => this.setState({WebSocData: res}));
      if (queryParams.length === 2){
        fetch("http://localhost:3001/websoc/" + queryParams[0] + "/" + queryParams[1], requestHeader).then(data => {return data.json()})
        .then(res => this.setState({WebSocData: res})).catch(() => {console.log("no course found")});
      }
      else {
        fetch("http://localhost:3001/websoc/" + queryParams[0] + " " + queryParams[1] + "/" + queryParams[2], requestHeader).then(data => {return data.json()})
        .then(res => this.setState({WebSocData: res})).catch(() => {console.log("no course found")});
      }
      
      
  }

  parseWebSocData() {
    console.log(this.state.WebSocData.schools[0].departments[0].courses[0].sections);
  }
  

  render() {
      if(this.state.WebSocData != null){
        try {
          this.parseWebSocData();
        }
        catch(e){
          console.log(e);
        }

      } 
      
      return (    
        <div style={{width: "800px", margin: "auto"}}><h1>{this.state.courseData.number}</h1>
        <h2>{this.state.courseData.name}</h2>
        <h3>{this.state.courseData.department}</h3>
        {this.state.courseData.description}<br/><br/>
        {this.state.courseData.prerequisite}
        <br/>
        <br/>
        <Timetable />
        <ReviewsModule />
        </div>
    )
  }
};

export default CoursePage;
