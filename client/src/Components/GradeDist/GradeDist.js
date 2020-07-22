import React from 'react';
import { Divider, Dropdown, Grid } from "semantic-ui-react";
import Chart from './Chart';
import Pie from './Pie.jsx';
import "./GradeDist.scss"


export default class GradeDist extends React.Component {
  /*
   * Initialize a GradeDist block on the webpage.
   * @param props attributes received from the parent element
   */
  constructor(props) {
    super(props);
    this.state = {
      gradeDistData: null,
      currentQuarter: "",
      currentProf: "",
      profEntries: null,
      quarterEntries: null
    };


    this.createQuarterEntries = this.createQuarterEntries.bind(this);
    this.updateCurrentQuarter = this.updateCurrentQuarter.bind(this);
    this.updateCurrentProf = this.updateCurrentProf.bind(this);
  }
  
  /*
   * Asychronously get the course data from the API.
   */
  componentDidMount() {
    const HEADER = {
      headers: new Headers({
        "content-type": "application/json; charset=UTF-8",
        "content-length": 140
      }),
      method: "GET"
    };

    fetch(`/api/v1/gradeDistribution/${this.props.courseData.id.split(" ").join("")}`, HEADER)
      .then(response => response.json())
      .then(data => {
        this.setState({ gradeDistData: data }, () => {console.log(this.state.gradeDistData); this.createProfEntries()});
        this.createQuarterEntries();
      });

    
  }
  
  /*
   * Display the entire GradeDist block.
   * @return a JSX block rendering the GradeDist block
   */
  render() {
    if (this.state.gradeDistData !== null) { 
      return (
        <div id="gradedist-module-container">
          <Grid.Row>
            <h2 id="grade-dist-label">
              <span role="img" aria-label="chart">📊</span> Grade Distribution
            </h2>
            
            <Divider />
          </Grid.Row>

          <Grid.Row columns={2} id="menu">
            <Grid.Column style={{marginRight: "1rem"}}>
              <Dropdown
                placeholder='Professor'
                scrolling
                selection
                options={this.state.profEntries}
                value={this.state.currentProf}
                onChange={this.updateCurrentProf}
              />
            </Grid.Column>

            <Grid.Column>
              <Dropdown
                placeholder="Quarter"
                scrolling
                selection
                options={this.state.quarterEntries}
                value={this.state.currentQuarter}
                onChange={this.updateCurrentQuarter}
              />
            </Grid.Column>
          </Grid.Row>
              
          <Grid.Row id="chart">
            <div className={"grade_distribution_chart-container chart"}>
              <Chart
                gradeData={this.state.gradeDistData}
                quarter={this.state.currentQuarter}
                professor={this.state.currentProf}
              />
            </div>
            <div className={"grade_distribution_chart-container pie"}>
              <Pie
                gradeData={this.state.gradeDistData}
                quarter={this.state.currentQuarter}
                professor={this.state.currentProf}
                />
            </div>
          </Grid.Row>
        </div>
      );
    } else {
        return (
          <h1>
            If you still cannot see the data after a long time, please contact us.
          </h1>
        );
    }
  }
  
  /*
   * Create an array of objects to feed into the quarter dropdown menu.
   * @return an array of JSON objects recording each quarter
   */
  createQuarterEntries() {
    let quarters = new Set(), result = [];

    this.state.gradeDistData
      .filter(entry => entry.instructor === this.state.currentProf)
      .forEach(data => quarters.add(data.AcadTerm));
    quarters.forEach(quarter => result.push({ value: quarter, text: quarter }));

    this.setState({quarterEntries: result, currentQuarter: result[0].value});
  }
  
  /*
   * Create an array of objects to feed into the professor dropdown menu.
   * @return an array of JSON objects recording professor's names
   */
  createProfEntries() {
    let professors = new Set(), result = [];

    this.state.gradeDistData
      .forEach(match => professors.add(match.instructor));
      
    professors.forEach(professor => result.push(
      { value: professor, text: professor }
    ));

    this.setState({profEntries: result, currentProf: result[0].value});
  }

  /*
   * Record what is in the quarter dropdown menu at the moment.
   * @param event an event object recording the mouse movement, etc.
   * @param status details about the status in the dropdown menu
   */
  updateCurrentQuarter(event, status) {
    this.setState({currentQuarter: status.value});
  }

  /*
   * Record what is in the professor dropdown menu at the moment.
   * @param event an event object recording the mouse movement, etc.
   * @param status details about the status in the dropdown menu
   */
  updateCurrentProf(event, status) {
    this.setState({currentProf: status.value}, () => {this.createQuarterEntries()})
  }
}
