import React from 'react';
import { Dropdown } from "semantic-ui-react";


export default class QuarterMenu extends React.Component {
  constructor(props) {
    super(props);
    this.createCourseEntry = this.createCourseEntry.bind(this);
  }

  createCourseEntry(data) {
    let dataBreakdown = data.split(" ");
    switch (dataBreakdown[0]) {
      case "Fall":
        return { value: `${dataBreakdown[1]}-92`, text: data };
      case "Winter":
        return { value: `${dataBreakdown[1]}-03`, text: data };
      case "Spring":
        return { value: `${dataBreakdown[1]}-14`, text: data };
      default:
        return { value: `${dataBreakdown[1]}-47`, text: data };
    };
  }

  render() {
    let quarters = new Set();
    this.props.gradeData.forEach(entry => {
       quarters.add(this.createCourseEntry(entry.AcadTerm));
    });
      
    return <Dropdown
      placeholder='Quarter'
      search scrolling selection
      options={Array.from(quarters)}
    />;
  }
}
