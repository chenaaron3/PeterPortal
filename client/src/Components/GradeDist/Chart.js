import React from 'react';
import { ResponsiveBarCanvas } from '@nivo/bar'

export default class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.getClassData = this.getClassData.bind(this);
  }
  
  getClassData() {
    let matches = this.props.gradeData.filter(
      data => data.AcadTerm === this.props.quarter
        && data.instructor === this.props.professor);
    let gradeACount = 0, gradeBCount = 0, gradeCCount = 0, gradeDCount = 0,
      gradeFCount = 0, gradePCount = 0, gradeNPCount = 0;
      
    matches.forEach(match => {
      gradeACount += match.gradeACount;
      gradeBCount += match.gradeBCount;
      gradeCCount += match.gradeCCount;
      gradeDCount += match.gradeDCount;
      gradeFCount += match.gradeFCount;
      gradePCount += match.gradePCount;
      gradeNPCount += match.gradeNPCount;
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
  
  render() {
    return (
      <ResponsiveBarCanvas
        data={this.getClassData()}
        keys={
          ['number']
        }
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
          legend: '', 
          legendOffset: 36
        }}
        axisBottom={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Grade',
          legendPosition: 'middle',
          legendOffset: 36
        }}
        enableGridX={false}
        enableGridY={false}
        enableLabel={true}
        colors="#5E9EC1"
        isInteractive={true}
      />);
  }
}
