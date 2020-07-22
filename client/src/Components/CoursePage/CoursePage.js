import React from "react";
// import Timetable from "../Timetable";
import ReviewsModule from "../ReviewsModule/ReviewsModule.js";
import CourseInfo from "./CourseInfo.js";
import PrereqTree from "./PrereqTree.js";
import GradeDist from "../GradeDist/GradeDist.js";
import { Grid } from "semantic-ui-react";
import "./CoursePage.scss";

class CoursePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      courseData: null,
      professorNames: {},
      dependenciesNames: {},
      prerequisiteNames: {},
      loaded: false
    };
  }

  componentDidMount() {
    this.getcourseData();
  }

  getcourseData() {
    var requestHeader = {
      headers: new Headers({"content-type": "application/json; charset=UTF-8", "content-length": 140}),
      method: "GET"
    };

    fetch("/api/v1/courses/" + this.props.match.params.id, requestHeader)
      .then(data => {return data.json();})
      .then(res => {this.setState({ courseData: res }); this.getProfessorNames();})
      .catch(e => console.log(e));
  }

  getProfessorNames() {
    var requestHeader = {
      headers: new Headers({"content-type": "application/json; charset=UTF-8", "content-length": 140}),
      method: "GET"
    };

    fetch("/api/v1/professors/all", requestHeader)
      .then(data => {return data.json();})
      .then(res => {
        let professor_names = {};
        this.state.courseData.professorHistory.map(i => {
          professor_names[i] = res.professors[i];
          return 0;
        });
        this.setState({ professorNames: professor_names });
        this.getCourseNames();
      })
      .catch(e => console.log(e));
  }

  getCourseNames() {
    var requestHeader = {
      headers: new Headers({"content-type": "application/json; charset=UTF-8", "content-length": 140}),
      method: "GET"
    };

    fetch("/api/v1/courses/all", requestHeader)
      .then(data => {return data.json();})
      .then(res => {
        let dependencies_names = {};
        let prerequisite_names = {};
        this.state.courseData.dependencies.map(i => {
          dependencies_names[i] = res.courses[i.replace(/\s/g, '')];
          return 0;
        });
        this.state.courseData.prerequisiteList.map(i => {
          prerequisite_names[i] = res.courses[i.replace(/\s/g, '')];
          return 0;
        });

        this.setState({ dependenciesNames: dependencies_names, prerequisiteNames: prerequisite_names, loaded: true });
      })
      .catch(e => console.log(e));
  }


  render() {
    if (this.state.courseData) {
      return (
        <div className="App" style={{ display: "flex", flexDirection: "column" }}>         
            <div id="course_main-header">
              <Grid.Row className="course_info-container">
                <Grid.Column width={2} style={{display: "flex", marginRight: "2em"}} >
                  <span style={{display: "flex", fontSize: "46px", margin: "auto"}}><span role="img" aria-label="laptop">💻</span></span>
                </Grid.Column>
                <Grid.Column width={10}>
                  <h1 id="course_id">{this.state.courseData.id}<span id="course_name">{this.state.courseData.name}</span></h1>
                  <p id="course_dept-school-unit">

                    {this.state.courseData.id_school}&nbsp;･&nbsp;<span>{this.state.courseData.department}
                    &nbsp;･&nbsp;{this.state.courseData.units[0]} units</span>
                  </p>
                </Grid.Column>
              </Grid.Row>
            </div> 
          
            
          <div className="course_page">
            <Grid.Row id="course_addl-info" style={{marginTop: "10em"}}>
              <CourseInfo 
                description={this.state.courseData.description}
                restriction={this.state.courseData.restriction}
                repeatability={this.state.courseData.repeatability}
                overlaps={this.state.courseData.overlaps}
                concurrent={this.state.courseData.concurrent}
                geTypes={this.state.courseData.ge_types}
                professorHistory={this.state.professorNames}
              />
            </Grid.Row>

            <Grid.Row id="course_prereq-tree" style={{marginTop: "2em"}}>
                <PrereqTree
                  id={this.state.courseData.id}
                  courseName={this.state.courseData.name}
                  dependencies={this.state.dependenciesNames}
                  prerequisite={this.state.prerequisiteNames}
                  prerequisiteJSON={this.state.courseData.prerequisiteJSON}
                  prerequisiteString={this.state.courseData.prerequisite}
                />
            </Grid.Row>

            <Grid.Row id="course_grade" style={{marginTop: "2em"}}>
                <GradeDist courseData={this.state.courseData} />
            </Grid.Row>

            <Grid.Row id="course_review" style={{marginTop: "2em"}}>
              <ReviewsModule
               courseID={this.props.match.params.id}
               professorHistory={this.state.courseData.professorHistory ? this.state.courseData.professorHistory : []}
               />
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
