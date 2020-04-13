import React from 'react';
import { ResponsiveBarCanvas } from '@nivo/bar'
import { Card, Grid, Dropdown } from "semantic-ui-react";
import "./GradeDist.scss"


class ProfMenu extends React.Component {
  render() {
    let professors = [
        { value: "pattis", text: "Richard Pattis" },
        { value: "thornton", text: "Alex Thornton" },
        { value: "kay", text: "David Kay" },
        { value: "klefstad", text: "Ray Klefstad" },
        { value: "emilyo", text: "Emily Navarro" }
      ];
      
    return <Dropdown 
      placeholder='Professor'
      search scrolling selection
      options={professors}
    />;
  }
}

class QuarterMenu extends React.Component {
  render() {
    let quarters = [
        { value: "2020-14", text: "Spring 2020" },
        { value: "2020-03", text: "Winter 2020" },
        { value: "2019-92", text: "Fall 2019" },
        { value: "2019-14", text: "Spring 2019" },
        { value: "2019-03", text: "Winter 2019" },
        { value: "2018-92", text: "Fall 2018" },
        { value: "2018-14", text: "Spring 2018" },
        { value: "2018-03", text: "Winter 2018" },
        { value: "2017-92", text: "Fall 2017" },
        { value: "2017-14", text: "Spring 2017" },
        { value: "2017-03", text: "Winter 2017" },
        { value: "2016-92", text: "Fall 2016" },
        { value: "2016-14", text: "Spring 2016" },
        { value: "2016-03", text: "Winter 2016" },
        { value: "2015-92", text: "Fall 2015" },
        { value: "2015-14", text: "Spring 2015" },
        { value: "2015-03", text: "Winter 2015" },
        { value: "2014-92", text: "Fall 2014" },
        { value: "2014-14", text: "Spring 2014" },
        { value: "2014-03", text: "Winter 2014" },
        { value: "2013-92", text: "Fall 2013" }
      ];
      
    return <Dropdown
      placeholder='Quarter'
      search scrolling selection
      options={quarters}
    />;
  }
}

class Chart extends React.Component {
  render() {
    let data = [
      {
        "grade": "A",
        "number": 235
      },
      {
        "grade": "B",
        "number": 71
      },
      {
        "grade": "C",
        "number": 7
      },
      {
        "grade": "D",
        "number": 0
      },
      {
        "grade": "F",
        "number": 0
      }
    ];
    return (
    <ResponsiveBarCanvas
        data={data}
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

export default class GradeDist extends React.Component {
    render() {
        return (
            <Grid.Row className="course_content-container course_prereq-tree-container">
              <Card>
                <Card.Content>
                  <Card.Header>Grade Distribution</Card.Header>
                </Card.Content>
                
                <Card.Content>
                  <Grid.Row>
                    <Grid.Column floated="right">
                      <QuarterMenu />
                      <ProfMenu />
                    </Grid.Column>
                  </Grid.Row>
                  
                  <Grid.Row id="gradedist_row">
                    <Chart />
                  </Grid.Row>
                </Card.Content>
              </Card>
            </Grid.Row>
        );
    }
}
