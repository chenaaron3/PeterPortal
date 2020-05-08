import React from "react";
import "./CoursePage.scss";
import { Grid, Divider } from "semantic-ui-react";

class CourseInfo extends React.Component {

  render() {
    return (
      <div>
        <Grid.Row className="feature-label">
          <h2>📘 Course Information</h2>
          <Divider />
        </Grid.Row>
        
        <Grid.Row className="course_information-container">
          <Grid.Column width={10} id="course_desc-container">
            <div className="course_desc-field-container">
              <p style={{ marginBottom: "6px" }}>
                <b>Course Description</b>
              </p>
              <p>{this.props.description}</p>
            </div>
            {this.props.restriction !== "" && (
              <div className="course_desc-field-container">
                <p style={{ marginBottom: "6px" }}>
                  <b>Restriction</b>
                </p>
                <p>{this.props.restriction}</p>
              </div>
            )}

            {this.props.repeatability !== "" && (
              <div className="course_desc-field-container">
                <p style={{ marginBottom: "6px" }}>
                  <b>Repeatability</b>
                </p>
                <p>{this.props.restriction}</p>
              </div>
            )}

            {this.props.overlaps !== "" && (
              <p>
                <b>Overlaps with </b>
                {this.props.overlaps}
              </p>
            )}

            {this.props.concurrent !== "" && (
              <p>
                <b>Concurrent with </b>
                {this.props.concurrent}
              </p>
            )}
          </Grid.Column>

          <Grid.Column width={2} id="course_ge-info">
            <div className="course_ge-info-container">
              {this.props.ge_types.length > 0 && (
                <p style={{ marginBottom: "6px" }}>
                  <b>GE Criteria</b>
                </p>
              )}

              {this.props.ge_types.map((value, index) => {
                return (
                  <p className="list-item" key={index}>
                    {value}
                  </p>
                );
              })}
            </div>

            <div className="course_ge-info-container">
              
              {Object.keys(this.props.professorHistory).length > 0 && (
                <p style={{ marginBottom: "6px" }}>
                  <b>Instructor History</b>
                </p>
              )}

              {Object.keys(this.props.professorHistory).map((key, index) => {
                return (
                  <p className="list-item" key={index}>
                    <a
                      href={"/professor/" + key}
                      className="list-item"
                    >
                      {this.props.professorHistory[key]}
                    </a>
                  </p>
                );
              })}
            </div>
          </Grid.Column>
        </Grid.Row>
      </div>
    );
  }
}

export default CourseInfo;
