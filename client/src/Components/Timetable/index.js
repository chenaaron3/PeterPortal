import React from "react";
import { Table } from "semantic-ui-react";
import "./timetable.scss";

// const colors = [
//   "red",
//   "orange",
//   "yellow",
//   "olive",
//   "green",
//   "teal",
//   "blue",
//   "violet",
//   "purple",
//   "pink",
//   "brown",
//   "grey",
//   "black"
// ];

class Timeable extends React.Component {
  render() {
    return (
      <div className={"timetable-container"}>
        <Table celled className={"unstackable"}>
          <Table.Header>
            <Table.Row className={"time-header"}>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell><span>8AM</span></Table.HeaderCell>
              <Table.HeaderCell><span>9AM</span></Table.HeaderCell>
              <Table.HeaderCell><span>10AM</span></Table.HeaderCell>
              <Table.HeaderCell><span>11AM</span></Table.HeaderCell>
              <Table.HeaderCell><span>12PM</span></Table.HeaderCell>
              <Table.HeaderCell><span>1PM</span></Table.HeaderCell>
              <Table.HeaderCell><span>2PM</span></Table.HeaderCell>
              <Table.HeaderCell><span>3PM</span></Table.HeaderCell>
              <Table.HeaderCell><span>4PM</span></Table.HeaderCell>
              <Table.HeaderCell><span>5PM</span></Table.HeaderCell>
              <Table.HeaderCell><span>6PM</span></Table.HeaderCell>
              <Table.HeaderCell><span>7PM</span></Table.HeaderCell>
              <Table.HeaderCell><span>8PM</span></Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body className={"time-row"}>
            <Table.Row>  
              <Table.Cell active>MON</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell><button style={{minWidth: "150px"}} className={"ui teal button course-section"}><p>PSLH 100<br/>LEC[A]</p></button></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>  
              <Table.Cell active>TUE</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>  
              <Table.Cell active>WED</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell><button style={{minWidth: "150px"}} className={"ui teal button"}>COMPSCI 132</button></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>  
              <Table.Cell active>THU</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>  
              <Table.Cell active>FRI</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
            </Table.Row>
        </Table.Body>

        </Table>
      </div>
    );
  }
}
export default Timeable;
