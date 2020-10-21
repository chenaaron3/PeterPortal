import React from "react";
import "./ProfessorPage.scss";
import { Grid, Divider } from "semantic-ui-react";


class ProfessorPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      professorData: null
    };
  }



  getProfessorData() {
    var searchParams = {
      query: {
        terms: {
          _id: [this.props.match.params.id]
        }
      }
    };

    var requestHeader = {
      headers: new Headers({
        "content-type": "application/json; charset=UTF-8",
        "content-length": 140
      }),
      body: JSON.stringify(searchParams),
      method: "POST"
    };

    fetch(
      `${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/professors/_search`,
      requestHeader
    )
      .then(data => {
        return data.json();
      })
      .then(res => {
        this.setState({ professorData: res.hits.hits[0]._source });
      })
      .catch(e => console.log(e));
  }

  componentDidMount() {
    this.getProfessorData();
  }

  render() {
    if (this.state.professorData != null) {
      return (
        <div
          className="App"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div className="professor_page">
            <Grid.Row className="course_content-container">
              <Grid.Column className="course_info-container">
                <div style={{display: "flex", alignItems: "center", flexDirection: "row", marginLeft: "-68px"}}>
                    <div style={{marginRight: "16px", minWidth: "50px", maxWidth: "50px", height: "50px", borderRadius: "50px", background: "#74D1F6", display: "flex", alignItems: "center"}}>
                        <h3 style={{width: "100%", textAlign: "center", color: "white"}}>{this.state.professorData.name.split(' ').map(x => x[0])}</h3>
                    </div>
                    <h1 id="course_id">{this.state.professorData.name}</h1>
                </div>

                <p id="course_dept-school-unit">
                <b>{this.state.professorData.department}</b>&nbsp;･&nbsp;{this.state.professorData.title}
                  <br />
                  {/* {this.state.professorData.id_school}&nbsp;･&nbsp;
                  {this.state.professorData.units[0]} units */}
                </p>
                <Divider />
                <Grid.Row id="course_addl-info">
                  <Grid.Column id="course_desc-container">
                    {/* <p>{this.state.professorData.description}</p> */}
                    <p>

                      {/* {this.state.professorData.restriction} */}
                    </p>
                  </Grid.Column>
                  <Grid.Column id="course_ge-info">

                  </Grid.Column>
                </Grid.Row>
              </Grid.Column>
            </Grid.Row>
   

            {/* <Grid.Row className="course_content-container course_prereq-tree-container">
              <Card>
                <Card.Content>
                  <Card.Header>
                    Schedule of Classes<span style={{fontSize: "14px", fontWeight: "200", float: "right", display: "flex", marginTop: "6px"}}><Icon name="calendar minus outline"/><Radio toggle /><Icon name="list"/></span>
                  </Card.Header>
                </Card.Content>
                <Card.Content>
                  <Timetable
                    id_department={this.state.professorData.id_department}
                    id_number={this.state.professorData.id_number}
                  />
                </Card.Content>
              </Card>
            </Grid.Row> */}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <h1>Loading..</h1>
        </div>
      );
    }
  }
}

export default ProfessorPage;
