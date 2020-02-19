import React from "react";
import Timetable from "../Timetable";
import ReviewsModule from "../ReviewsModule";
import PrereqTree from "../PrereqTree";
import ElasticCloudInfo from "../../ElasticCloudInfo";
let base64 = require("base-64");

class CoursePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      courseData: null,
    };
  }

  getCourseData() {
    var searchParams = {
      query: {
        terms: {
          _id: [this.props.match.params.id]
        }
      }
    };

    var requestHeader = {
      headers: new Headers({
        "content-type": "application/json; charset=UTF-8",
        "content-length": 140
      }),
      body: JSON.stringify(searchParams),
      method: "POST"
    };

    fetch(ElasticCloudInfo.elasticEndpointURL + "/courses/_search", requestHeader).then(data => {return data.json()}).then(res => {this.setState({courseData: res.hits.hits[0]._source});})
  }


  componentDidMount() {
    this.getCourseData();
  }


  render() {

    if (this.state.courseData != null) {
    return (
      <div style={{ width: "800px", margin: "auto" }}>
        <h1>{this.state.courseData.number}</h1>
        <h2>{this.state.courseData.id}</h2>
        <h3>{this.state.courseData.department}</h3>
        {this.state.courseData.description}
        <br />
        <br />
        {this.state.courseData.prerequisite}
        {console.log(this.state.courseData)}
        <br/>
        <br/>
        {this.state.courseData.id && <PrereqTree id={this.state.courseData.id} 
                                                  dependencies={this.state.courseData.dependencies} 
                                                  prerequisiteJSON={JSON.parse(this.state.courseData.prerequisiteJSON)}/>}
        <Timetable id_department={this.state.courseData.id_department} id_number={this.state.courseData.id_number}/>
        <ReviewsModule />
      </div>
    );
    }

    else{
      return(<div>
        <h1>Loading..</h1>
      </div>)
    }

  }
}

export default CoursePage;
