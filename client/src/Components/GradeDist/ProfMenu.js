import React from 'react';
import { Dropdown } from "semantic-ui-react";


export default class ProfMenu extends React.Component {
  render() {
    let professors = new Set();
    let matches = this.props.gradeData.filter(
      entry => entry.AcadTerm === this.props.quarter);
    matches.forEach(match => professors.add(match.instructor));
    
    let result = [];
    professors.forEach(professor => result.push({
      value: professor,
      text: professor
    }));
  
    return <Dropdown
        placeholder='Professor'
        search scrolling selection
        options={result}
    />;
  }
}
