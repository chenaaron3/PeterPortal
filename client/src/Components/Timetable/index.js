import React from "react";
import { Table } from "semantic-ui-react";
import "./timetable.scss";



class Timeable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      WebSocData: null
    }
  }

  // componentWillReceiveProps(){
    
  //   console.log(this.props.courseSections)
  //   var test = document.createElement('div')
  //   test.innerHTML = '<button style="min-width: 150px" class="ui teal button course-section"><p>PSLH 100<br/>LEC[A]</p></button>'
  //   document.getElementById("M-9AM").append(test.firstChild);
  // }

  componentWillMount(){
    this.getWebSOC()

  }

  getWebSOC() {
    var requestHeader = {
      method: "GET"
    };

    fetch(
      "http://localhost:3001/websoc/2020 Winter/" + 
        this.props.id_department +
        "/" +
        this.props.id_number,
      requestHeader
    )
      .then(data => {
        return data.json();
      })
      .then(res => this.setState({ WebSocData: res }))
      .catch(() => {
        console.log("no course found");
      });
  }


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
              <Table.Cell id={"M-8AM"}></Table.Cell>
              <Table.Cell id={"M-9AM"}></Table.Cell>
              <Table.Cell id={"M-10AM"}></Table.Cell>
              <Table.Cell id={"M-11AM"}></Table.Cell>
              <Table.Cell id={"M-12PM"}></Table.Cell>
              <Table.Cell id={"M-1PM"}></Table.Cell>
              <Table.Cell id={"M-2PM"}></Table.Cell>
              <Table.Cell id={"M-3PM"}></Table.Cell>
              <Table.Cell id={"M-4PM"}></Table.Cell>
              <Table.Cell id={"M-5PM"}></Table.Cell>
              <Table.Cell id={"M-6PM"}></Table.Cell>
              <Table.Cell id={"M-7PM"}></Table.Cell>
              <Table.Cell id={"M-8PM"}></Table.Cell>
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
