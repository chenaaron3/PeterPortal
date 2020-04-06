import React from "react";
import Timetable from "../Timetable";
import ReviewsModule from "../ReviewsModule";
import PrereqTree from "../PrereqTree";
import GradeDist from "../GradeDist";
import { Grid, Icon, Divider, Card, Radio } from "semantic-ui-react";
import "./CoursePage.scss";

class CoursePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      courseData: null
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

    // console.log(process.env.REACT_APP_ELASTIC_ENDPOINT_URL_COURSES)

    fetch(
      "https://search-icssc-om3pkghp24gnjr4ib645vct64q.us-west-2.es.amazonaws.com/courses/_search",
      requestHeader
    )
      .then(data => {
        return data.json();
      })
      .then(res => {
        this.setState({ courseData: res.hits.hits[0]._source });
      })
      .catch(e => console.log(e));
  }

  componentDidMount() {
    this.getCourseData();
  }

  render() {
    if (this.state.courseData != null) {
      return (
        <div
          className="App"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div className="course_page">
            <Grid.Row className="course_content-container">
              <Grid.Column className="course_info-container">
                <h1 id="course_id">{this.state.courseData.id}</h1>
                <h2 id="course_name">{this.state.courseData.name}</h2>
                <p id="course_dept-school-unit">
                  {this.state.courseData.department}
                  <br />
                  {this.state.courseData.id_school}&nbsp;･&nbsp;
                  {this.state.courseData.units[0]} units
                </p>
                <Divider />
                <Grid.Row id="course_addl-info">
                  <Grid.Column id="course_desc-container">
                    <p>{this.state.courseData.description}</p>
                    <p>
                      <b>Restriction: </b>
                      {this.state.courseData.restriction}
                    </p>
                  </Grid.Column>
                  <Grid.Column id="course_ge-info">
                      <p style={{marginBottom: "6px"}}><b>GE Criteria</b></p>

                    {this.state.courseData.ge_types.map((value, index) => {
                      return (
                        <p className="list-item" key={index}>
                          {value}
                        </p>
                      );
                    })}
                  </Grid.Column>
                </Grid.Row>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row className="course_content-container course_prereq-tree-container">
              <Card>
                <Card.Content>
                  <Card.Header>Prerequisite Tree</Card.Header>
                </Card.Content>
                <Card.Content>
                  {this.state.courseData.id && (
                    <PrereqTree
                      id={this.state.courseData.id}
                      dependencies={this.state.courseData.dependencies}
                      prerequisiteJSON={this.state.courseData.prerequisiteJSON}
                    />
                  )}
                  <br />
                  <p>
                    <b>Prerequisite: </b>
                    {this.state.courseData.prerequisite}
                  </p>
                </Card.Content>
              </Card>
            </Grid.Row>

            {/* <Grid.Row className="course_content-container course_prereq-tree-container">
              <Card>
                <Card.Content>
                  <Card.Header>
                    Schedule of Classes<span style={{fontSize: "14px", fontWeight: "200", float: "right", display: "flex", marginTop: "6px"}}><Icon name="calendar minus outline"/><Radio toggle /><Icon name="list"/></span>
                  </Card.Header>
                </Card.Content>
                <Card.Content>
                  <Timetable
                    id_department={this.state.courseData.id_department}
                    id_number={this.state.courseData.id_number}
                  />
                </Card.Content>
              </Card>
            </Grid.Row> */}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <h1>Loading..</h1>
        </div>
      );
    }
  }
}

export default CoursePage;
