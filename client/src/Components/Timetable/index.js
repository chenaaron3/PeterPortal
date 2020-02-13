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
    this.getWebSoC()

  }

  getWebSoC() {
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

  drawSectionsOnTable() {

    for(var s in this.state.WebSocData.M){
      var test = document.createElement('div')
      test.innerHTML = '<button style="min-width:' + this.state.WebSocData.M[s].time.sessionDuration * 1.5 + 'px" class="ui teal button course-section"><p>PSLH 100<br/>LEC[A]</p></button>'
      document.getElementById("M-"+this.state.WebSocData.M[s].time.beginHour).append(test.firstChild);
    }
    for(var s in this.state.WebSocData.Tu){
      var test = document.createElement('div')
      test.innerHTML = '<button style="min-width:' + this.state.WebSocData.Tu[s].time.sessionDuration * 1.5 + 'px" class="ui teal button course-section"><p>PSLH 100<br/>LEC[A]</p></button>'
      document.getElementById("Tu-"+this.state.WebSocData.Tu[s].time.beginHour).append(test.firstChild);
    }
    for(var s in this.state.WebSocData.W){
      var test = document.createElement('div')
      test.innerHTML = '<button style="min-width:' + this.state.WebSocData.W[s].time.sessionDuration * 1.5 + 'px" class="ui teal button course-section"><p>PSLH 100<br/>LEC[A]</p></button>'
      document.getElementById("W-"+this.state.WebSocData.W[s].time.beginHour).append(test.firstChild);
    }
    for(var s in this.state.WebSocData.Th){
      var test = document.createElement('div')
      test.innerHTML = '<button style="min-width:' + this.state.WebSocData.Th[s].time.sessionDuration * 1.5 + 'px" class="ui teal button course-section"><p>PSLH 100<br/>LEC[A]</p></button>'
      document.getElementById("Th-"+this.state.WebSocData.Th[s].time.beginHour).append(test.firstChild);
    }
    for(var s in this.state.WebSocData.F){
      var test = document.createElement('div')
      test.innerHTML = '<button style="min-width:' + this.state.WebSocData.F[s].time.sessionDuration * 1.5 + 'px" class="ui teal button course-section"><p>PSLH 100<br/>LEC[A]</p></button>'
      document.getElementById("F-"+this.state.WebSocData.F[s].time.beginHour).append(test.firstChild);
    }
  }

  render() {
    if(this.state.WebSocData != null){
      this.drawSectionsOnTable();
    }
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
              <Table.Cell id={"M-8"}></Table.Cell>
              <Table.Cell id={"M-9"}></Table.Cell>
              <Table.Cell id={"M-10"}></Table.Cell>
              <Table.Cell id={"M-11"}></Table.Cell>
              <Table.Cell id={"M-12"}></Table.Cell>
              <Table.Cell id={"M-13"}></Table.Cell>
              <Table.Cell id={"M-14"}></Table.Cell>
              <Table.Cell id={"M-15"}></Table.Cell>
              <Table.Cell id={"M-16"}></Table.Cell>
              <Table.Cell id={"M-17"}></Table.Cell>
              <Table.Cell id={"M-18"}></Table.Cell>
              <Table.Cell id={"M-19"}></Table.Cell>
              <Table.Cell id={"M-20"}></Table.Cell>
            </Table.Row>
            <Table.Row>  
              <Table.Cell active>TUE</Table.Cell>
              <Table.Cell id={"Tu-8"}></Table.Cell>
              <Table.Cell id={"Tu-9"}></Table.Cell>
              <Table.Cell id={"Tu-10"}></Table.Cell>
              <Table.Cell id={"Tu-11"}></Table.Cell>
              <Table.Cell id={"Tu-12"}></Table.Cell>
              <Table.Cell id={"Tu-13"}></Table.Cell>
              <Table.Cell id={"Tu-14"}></Table.Cell>
              <Table.Cell id={"Tu-15"}></Table.Cell>
              <Table.Cell id={"Tu-16"}></Table.Cell>
              <Table.Cell id={"Tu-17"}></Table.Cell>
              <Table.Cell id={"Tu-18"}></Table.Cell>
              <Table.Cell id={"Tu-19"}></Table.Cell>
              <Table.Cell id={"Tu-20"}></Table.Cell>
            </Table.Row>
            <Table.Row>  
              <Table.Cell active>WED</Table.Cell>
              <Table.Cell id={"W-8"}></Table.Cell>
              <Table.Cell id={"W-9"}></Table.Cell>
              <Table.Cell id={"W-10"}></Table.Cell>
              <Table.Cell id={"W-11"}></Table.Cell>
              <Table.Cell id={"W-12"}></Table.Cell>
              <Table.Cell id={"W-13"}></Table.Cell>
              <Table.Cell id={"W-14"}></Table.Cell>
              <Table.Cell id={"W-15"}></Table.Cell>
              <Table.Cell id={"W-16"}></Table.Cell>
              <Table.Cell id={"W-17"}></Table.Cell>
              <Table.Cell id={"W-18"}></Table.Cell>
              <Table.Cell id={"W-19"}></Table.Cell>
              <Table.Cell id={"W-20"}></Table.Cell>
            </Table.Row>
            <Table.Row>  
              <Table.Cell active>THU</Table.Cell>
              <Table.Cell id={"Th-8"}></Table.Cell>
              <Table.Cell id={"Th-9"}></Table.Cell>
              <Table.Cell id={"Th-10"}></Table.Cell>
              <Table.Cell id={"Th-11"}></Table.Cell>
              <Table.Cell id={"Th-12"}></Table.Cell>
              <Table.Cell id={"Th-13"}></Table.Cell>
              <Table.Cell id={"Th-14"}></Table.Cell>
              <Table.Cell id={"Th-15"}></Table.Cell>
              <Table.Cell id={"Th-16"}></Table.Cell>
              <Table.Cell id={"Th-17"}></Table.Cell>
              <Table.Cell id={"Th-18"}></Table.Cell>
              <Table.Cell id={"Th-19"}></Table.Cell>
              <Table.Cell id={"Th-20"}></Table.Cell>
            </Table.Row>
            <Table.Row>  
              <Table.Cell active>FRI</Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell id={"F-8"}></Table.Cell>
              <Table.Cell id={"F-9"}></Table.Cell>
              <Table.Cell id={"F-10"}></Table.Cell>
              <Table.Cell id={"F-11"}></Table.Cell>
              <Table.Cell id={"F-12"}></Table.Cell>
              <Table.Cell id={"F-13"}></Table.Cell>
              <Table.Cell id={"F-14"}></Table.Cell>
              <Table.Cell id={"F-15"}></Table.Cell>
              <Table.Cell id={"F-16"}></Table.Cell>
              <Table.Cell id={"F-17"}></Table.Cell>
              <Table.Cell id={"F-18"}></Table.Cell>
              <Table.Cell id={"F-19"}></Table.Cell>
              <Table.Cell id={"F-20"}></Table.Cell>
            </Table.Row>
        </Table.Body>

        </Table>
      </div>
    );
  }
}
export default Timeable;
