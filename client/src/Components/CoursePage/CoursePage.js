import React from "react";
// import Timetable from "../Timetable";
import ReviewsModule from "../ReviewsModule/ReviewsModule.js";
import CourseInfo from "./CourseInfo.js";
import PrereqTree from "./PrereqTree.js";
import { Grid } from "semantic-ui-react";
import "./CoursePage.scss";

class CoursePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      courseData: null,
      professorHistory: {},
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
    let prof_json = {}
    
    // go through each professor ucinetid
    console.log(this.state.courseData);
    for (var i = 0; i < this.state.courseData.professorHistory.length; i++) {    
      var searchParams = {
        query: {
          terms: {
            _id: [this.state.courseData.professorHistory[i]]
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
        "/professors/_search",
        requestHeader
      )
      .then(data => {
        return data.json();
      })
      .then(res => {
        this.setState({})
        let prof_data = res.hits.hits[0]._source;
        prof_json[prof_data.ucinetid] = prof_data.name;
      })
      .catch(e => console.log(e));
    }
    console.log(Object.keys(prof_json).length);
    this.setState({professorHistory: prof_json, loaded: true});
  }

  render() {
    if (this.state.loaded) {
      return (
        <div className="App" style={{ display: "flex", flexDirection: "column" }}>         
            <div id="course_main-header">
              <Grid.Row className="course_info-container">
                <Grid.Column width={2} style={{display: "flex", marginRight: "2em"}} >
                  <span style={{display: "flex", fontSize: "46px", margin: "auto"}}>💻</span>
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
                ge_types={this.state.courseData.ge_types}
                professorHistory={this.state.professorHistory}
                professorCount={Object.keys(this.state.professorHistory).length}
              />
            </Grid.Row>

            <Grid.Row id="course_prereq-tree" style={{marginTop: "2em"}}>
                <PrereqTree
                  id={this.state.courseData.id}
                  dependencies={this.state.courseData.dependencies}
                  prerequisite={this.state.courseData.prerequisite}
                  prerequisiteJSON={this.state.courseData.prerequisiteJSON}
                />
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
