import React from "react";
import { Table, Dropdown } from "semantic-ui-react";
import "./timetable.scss";
import { CourseSection } from "./CourseSection";

const friendOptions = [
  {
    key: '2020 Winter',
    text: '2020 Winter',
    value: '2020 Winter',
  },
  {
    key: '2020 Spring',
    text: '2020 Spring',
    value: '2020 Spring',
  },
]

class Timeable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      WebSocData: null,
      term: "2020 Spring"
    };
  }

  // componentWillReceiveProps(){

  //   console.log(this.props.courseSections)
  //   var test = document.createElement('div')
  //   test.innerHTML = '<button style="min-width: 150px" class="ui teal button course-section"><p>PSLH 100<br/>LEC[A]</p></button>'
  //   document.getElementById("M-9AM").append(test.firstChild);
  // }

  componentWillMount() {
    this.getWebSoC();
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

  sectionTypeToColor(type) {
    if (type === "Act") {
      return "red";
    } else if (type === "Dis") {
      return "orange";
    } else if (type === "Lab") {
      return "yellow";
    } else if (type === "Qiz") {
      return "olive";
    } else if (type === "Sem") {
      return "green";
    } else if (type === "Tap") {
      return "teal";
    } else if (type === "Col") {
      return "pink";
    } else if (type === "Fld") {
      return "brown";
    } else if (type === "Lec") {
      return "blue";
    } else if (type === "Res") {
      return "grey";
    } else if (type === "Stu") {
      return "purple";
    } else if (type === "Tut") {
      return "violet";
    }
  }

  onSectionHover(e) {
    console.log(e)
  }

  drawSectionsOnTable() {
    for (var i in this.state.WebSocData) {
      for(var s in this.state.WebSocData[i]) {
        var test = document.createElement("div");
        test.innerHTML =
          '<button style="margin: 1px; height: auto; transform: translateX(' +
          this.state.WebSocData[i][s].time.beginMin * 1.5 +
          "px); min-width:" +
          this.state.WebSocData[i][s].time.sessionDuration * 1.5 +
          'px" class="ui ' +
          this.sectionTypeToColor(this.state.WebSocData[i][s].sectionType) + " " + this.state.WebSocData[i][s].sectionType.toUpperCase() +
          "[" +
          this.state.WebSocData[i][s].sectionNum + "]" +
          ' button course-section"><p style="font-size: 10px; padding: 4px 0px 0px 4px">' +
          this.state.WebSocData[i][s].bldg +
          "<br/>" +
          this.state.WebSocData[i][s].sectionType.toUpperCase() +
          "[" +
          this.state.WebSocData[i][s].sectionNum +
          ']</p><div class="ui progress"><div class="bar" style="width:'+ (this.state.WebSocData[i][s].numCurrentlyEnrolled / this.state.WebSocData[i][s].maxCapacity)*100 + '%"><div class="progress"></div></div></div></button>';
        document
          .getElementById(i + "-" + this.state.WebSocData[i][s].time.beginHour)
          .append(test.firstChild);
          // console.log(this.state.WebSocData[i][s]);
      }
    }
  }

  render() {
    if (this.state.WebSocData != null) {
      this.drawSectionsOnTable();
    }

    return (
      <div className={"timetable-container"}>
        <Table celled className={"unstackable"}>
          <Table.Header>
            <Table.Row className={"time-header"}>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>
                <span>8AM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>9AM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>10AM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>11AM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>12PM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>1PM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>2PM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>3PM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>4PM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>5PM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>6PM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>7PM</span>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <span>8PM</span>
              </Table.HeaderCell>
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
