import React from 'react';
import { ResponsiveBarCanvas } from '@nivo/bar'

export default class Chart extends React.Component {
  /*
   * Initialize the grade distribution chart on the webpage.
   * @param props attributes received from the parent element
   */
  constructor(props) {
    super(props);
    this.theme = {
      tooltip: {
        container: { background: "rgba(0,0,0,.87)",
                     color: "#ffffff",
                     fontSize: "0.6vw",
                     outline: "none",
                     margin: 0,
                     padding: "0.5em"
                   }
      }
    };
    
    this.getClassData = this.getClassData.bind(this);
    this.styleTooltip = this.styleTooltip.bind(this);
  }
  
  /*
   * Create an array of objects to feed into the chart.
   * @return an array of JSON objects detailing the grades for each class
   */
  getClassData() {
    let gradeACount = 0, gradeBCount = 0, gradeCCount = 0, gradeDCount = 0,
      gradeFCount = 0, gradePCount = 0, gradeNPCount = 0;
      
    this.props.gradeData.forEach(data => {
      if (data.AcadTerm === this.props.quarter
        && data.instructor === this.props.professor) {
          gradeACount += data.gradeACount;
          gradeBCount += data.gradeBCount;
          gradeCCount += data.gradeCCount;
          gradeDCount += data.gradeDCount;
          gradeFCount += data.gradeFCount;
          gradePCount += data.gradePCount;
          gradeNPCount += data.gradeNPCount;
      }
    });
    return [
      {
        "grade": "A",
        "number": gradeACount
      },
      {
        "grade": "B",
        "number": gradeBCount
      },
      {
        "grade": "C",
        "number": gradeCCount
      },
      {
        "grade": "D",
        "number": gradeDCount
      },
      {
        "grade": "F",
        "number": gradeFCount
      },
      {
        "grade": "P",
        "number": gradePCount
      },
      {
        "grade": "NP",
        "number": gradeNPCount
      },
    ];
  }
  
  /*
   * Indicate how the tooltip should look like when users hover over the bar
   * Code is slightly modified from: https://codesandbox.io/s/nivo-scatterplot-
   * vs-bar-custom-tooltip-7u6qg?file=/src/index.js:1193-1265
   * @param event an event object recording the mouse movement, etc.
   * @return a JSX block styling the chart
   */
  styleTooltip(event) {
    return (
      <div style={this.theme.tooltip.container}>
        <strong>{event.data.grade}</strong>
        <br />
        <em>Total: {event.data.number}</em>
      </div>
    );
  }
  
  /*
   * Display the grade distribution chart.
   * @return a JSX block rendering the chart
   */
  render() {
    return (
      <ResponsiveBarCanvas
        data={this.getClassData()}
        keys={ ["number"] }
        indexBy="grade"
        margin={{
          top: 50,
          right: 60,
          bottom: 50,
          left: 60
        }}
        padding={0.2}
        layout="vertical"
        axisTop={{
          tickSize: 5,
          tickPadding: 5, 
          tickRotation: 0, 
          legend: "", 
          legendOffset: 36
        }}
        axisBottom={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Grade",
          legendPosition: "middle",
          legendOffset: 36
        }}
        enableLabel={true}
        colors="#5e9ec1"
        isInteractive={true}
        theme={this.theme}
        tooltip={this.styleTooltip}
      />
    );
  }
}
