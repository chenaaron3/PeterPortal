import React from 'react';
import { Card, Grid } from "semantic-ui-react";
import "./GradeDist.scss"
import ProfMenu from './ProfMenu';
import QuarterMenu from './QuarterMenu';
import Chart from './Chart';


export default class GradeDist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gradeDistData: null,
      currentQuarter: "",
      currentProf: ""
    };
    
    this.getGradeDistData = this.getGradeDistData.bind(this);
    this.updateWhenQuarterSelected = this.updateWhenQuarterSelected.bind(this);
    this.updateWhenProfSelected = this.updateWhenProfSelected.bind(this);
  }
    
  getGradeDistData() {
    const HEADER = {
      headers: new Headers({
          "content-type": "application/json; charset=UTF-8",
          "content-length": 140
      }),
      method: "GET"
    };
    
    fetch(`/api/v1/gradeDistribution/{this.props.courseData.id}`, HEADER)
      .then(response => response.json())
      .then(data => this.setState({ gradeDistData: data }))
      .catch(error => {
          alert(error);
          console.log(error);
      });
  }
  
  updateWhenQuarterSelected(event) {
    this.setState({ currentQuarter: event.target.value });
  }
  
  updateWhenProfSelected(event) {
    this.setState({ currentProf: event.target.value });
  }
  
  render() {
    this.getGradeDistData();
    return (
      <Grid.Row className="course_content-container course_prereq-tree-container">
        <Card>
          <Card.Content>
            <Card.Header>Grade Distribution</Card.Header>
          </Card.Content>
          
          <Card.Content>
            <Grid.Row>
              <Grid.Column floated="right">
                <QuarterMenu
                  gradeData={this.state.gradeDistData}
                  onSelect={this.updateWhenQuarterSelected} 
                />
                  
                <ProfMenu
                  gradeData={this.state.gradeDistData}
                  quarter={this.state.currentQuarter}
                  onSelect={this.updateWhenProfSelected}
                />
              </Grid.Column>
            </Grid.Row>
            
            <Grid.Row id="gradedist_row">
              <Chart
                gradeData={this.state.gradeDistData}
                quarter={this.state.currentQuarter}
                professor={this.state.currentProf}
              />
            </Grid.Row>
          </Card.Content>
        </Card>
      </Grid.Row>
    );
  }
}
