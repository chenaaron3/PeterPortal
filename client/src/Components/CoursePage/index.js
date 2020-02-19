import React from "react";
import Timetable from "../Timetable"
import ReviewsModule from "../ReviewsModule";
import ElasticCloudInfo from "../../ElasticCloudInfo";
let base64 = require('base-64');

class CoursePage extends React.Component {

  constructor(props){
      super(props);

      this.state = {
          WebSocData: null,
          courseData: {},
          parseCourseScheduleData: {M:[], Tu:[], W:[], Th:[], F:[]}
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
      headers : new Headers({
        "content-type": "application/json; charset=UTF-8",
        "content-length": 140
      }),
      body: JSON.stringify(searchParams),
      method: "POST"
    }

    fetch(ElasticCloudInfo.elasticEndpointURL + "/courses/_search", requestHeader).then(data => {return data.json()}).then(res => {this.setState({courseData: res.hits.hits[0]._source}); this.getWebSOC();})
  }

  componentDidMount(){
    this.getCourseData();
    console.log("sdfs",  this.state.courseData)
  }

  getWebSOC(){
    var queryParams = this.state.courseData.id.split(" ");

    var requestHeader = {
        method: "GET"
        };


      fetch("http://localhost:3001/websoc/" + queryParams.slice(0, -1).join(" ") + "/" + queryParams[queryParams.length - 1], requestHeader).then(data => {return data.json()})
      .then(res => this.setState({WebSocData: res})).catch(() => {console.log("no course found")});

  }

  parseWebSocData() {
    
    console.log(this.state.WebSocData);
    console.log(this.state.WebSocData.schools[0].departments[0].courses[0].sections);
    
    for (var s in this.state.WebSocData.schools[0].departments[0].courses[0].sections){
      var sections = this.state.WebSocData.schools[0].departments[0].courses[0].sections[s];
      for(var m in sections.meetings) {
        var meeting = sections.meetings[m];
        if(/M/.test(meeting.days)){
          this.state.parseCourseScheduleData.M.push({sectionType: sections.sectionType, instructors: sections.instructors, sectionNum: sections.sectionNum, bldg: sections.bldg, time:meeting.time})
        }
        if(/Tu/.test(meeting.days)){
          this.state.parseCourseScheduleData.Tu.push({sectionType: sections.sectionType, instructors: sections.instructors, sectionNum: sections.sectionNum, bldg: sections.bldg, time:meeting.time})
        }
        if(/W/.test(meeting.days)){
          this.state.parseCourseScheduleData.W.push({sectionType: sections.sectionType, instructors: sections.instructors, sectionNum: sections.sectionNum, bldg: sections.bldg, time:meeting.time})
        }
        if(/Th/.test(meeting.days)){
          this.state.parseCourseScheduleData.Th.push({sectionType: sections.sectionType, instructors: sections.instructors, sectionNum: sections.sectionNum, bldg: sections.bldg, time:meeting.time})
        }
        if(/F/.test(meeting.days)){
          this.state.parseCourseScheduleData.F.push({sectionType: sections.sectionType, instructors: sections.instructors, sectionNum: sections.sectionNum, bldg: sections.bldg, time:meeting.time})
        }
      }
    }

    // this.setState({test:"hello world"})

    console.log(this.state.parseCourseScheduleData);
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
        <h2>{this.state.courseData.id}</h2>
        <h3>{this.state.courseData.department}</h3>
        {this.state.courseData.description}<br/><br/>
        {this.state.courseData.prerequisite}
        <br/>
        <br/>
        <Timetable courseSections={this.state.parseCourseScheduleData} />
        <ReviewsModule courseID={this.state.courseData.id} />
        </div>
    )
  }
};

export default CoursePage;
