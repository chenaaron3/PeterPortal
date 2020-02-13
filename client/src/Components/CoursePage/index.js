import React from "react";
import Timetable from "../Timetable";
import ReviewsModule from "../ReviewsModule";
import ElasticCloudInfo from "../../ElasticCloudInfo";
let base64 = require("base-64");

class CoursePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      courseData: {},
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

    fetch(
      ElasticCloudInfo.elasticEndpointURL + "/courses/_search",
      requestHeader
    )
      .then(data => {
        return data.json();
      })
      .then(res => {
        this.setState({ courseData: res.hits.hits[0]._source });
      });
  }

  componentDidMount() {
    this.getCourseData();
  }


  render() {


    return (
      <div style={{ width: "800px", margin: "auto" }}>
        <h1>{this.state.courseData.number}</h1>
        <h2>{this.state.courseData.id}</h2>
        <h3>{this.state.courseData.department}</h3>
        {this.state.courseData.description}
        <br />
        <br />
        {this.state.courseData.prerequisite}
        <br />
        <br />
        <Timetable id_department={"IN4MATX"} id_number={"151"} />
        <ReviewsModule />
      </div>
    );
  }
}

export default CoursePage;
