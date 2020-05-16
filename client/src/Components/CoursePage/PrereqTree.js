import React from "react";
import "./PrereqTree.scss";
import { Grid, Divider,Popup } from "semantic-ui-react";

const horizontalStyle = { display: "inline-flex", flexDirection: "row" };

class Tree extends React.Component {
  render() {
    let prerequisite = this.props.prerequisiteJSON;
    let isValueNode = typeof prerequisite === "string";
    return (
      <div style={{ margin: "auto" }}>
        {/* If is just a value node */}
        {isValueNode && (
          <span>
            <Popup
              trigger={
                <div className="prereq-node-branch">
                  <a
                    href={"/course/" + prerequisite.replace(/\s+/g, "")}
                    role="button"
                    className={"node ui basic button"}
                  >
                    {prerequisite}
                  </a>
                </div>
              }
              content={this.props.prerequisiteNames[prerequisite]}
              basic
              position="top center"
              wide="very"
            />
          </span>
        )}
        {/* If is a subtree */}
        {!isValueNode && (
          <div style={horizontalStyle}>
            <span style={{ margin: "auto 40px auto 20px" }}>
              <div className="prereq-branch">
                <p>{prerequisite.hasOwnProperty("OR") ? "one of" : "all of"}</p>
              </div>
            </span>

            <ul className="prereq-list">
              <div className="prereq-list-branch">
                {prerequisite[Object.keys(prerequisite)[0]].map(
                  (child, index) => (
                    <li key={index}>
                      <Tree
                        prerequisiteNames={this.props.prerequisiteNames}
                        prerequisiteJSON={child}
                      />
                    </li>
                  )
                )}
              </div>
            </ul>
          </div>
        )}
      </div>
    );
  }
}

class PrereqTree extends React.Component {
  render() {
    let hasPrereqs = this.props.prerequisiteJSON !== "";
    let hasDependencies = Object.keys(this.props.dependencies).length !== 0;

    if (this.props.id === undefined) return "";
    else if (!hasPrereqs && !hasDependencies)
      return (
        <div>
          <span>No Dependencies or Prerequisites!</span>
        </div>
      );
    return (
      <div>
        <Grid.Row className="feature-label">
          <h2><span role="img" aria-label="seedling">🌱</span> Prerequisite Tree</h2>
          <Divider />
        </Grid.Row>

        <div
          style={{ display: "flex", margin: "auto", flexDirection: "column" }}
        >
          <div
            style={{
              display: "inline-flex",
              flexDirection: "row",
              margin: "auto",
            }}
          >
            {/* Display dependencies */}
            {hasDependencies && (
              <>
                <div style={{ display: "flex" }}>
                  <ul style={{ padding: "0", margin: "auto" }}>
                    <div className="dependency-list-branch">
                      {Object.keys(this.props.dependencies).map(
                        (dependency, index) => (
                          <div key={index}>
                            <span>
                              <Popup
                                trigger={
                                  <div className="dependency-node">
                                    <a
                                      href={
                                        "/course/" +
                                        dependency.replace(/\s+/g, "")
                                      }
                                      role="button"
                                      className={"node ui button"}
                                    >
                                      {dependency}
                                    </a>
                                  </div>
                                }
                                content={this.props.dependencies[dependency]}
                                basic
                                position="top center"
                                wide="very"
                              />
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </ul>
                </div>
                <div style={horizontalStyle}>
                  <span style={{ margin: "auto 20px auto 40px" }}>
                    <div className="dependency-branch">
                      <p>needs</p>
                    </div>
                  </span>
                </div>
              </>
            )}
            {!hasDependencies}
            {/* Display the class id */}
            <Popup
              trigger={
                <div className="course-node_container" style={{ margin: "auto" }}>
                  <a href="/" role="button" className={"node ui button course-node"}>
                    {this.props.id}
                  </a>
                </div>
              }
              content={this.props.courseName}
              basic
              position="top center"
              wide="very"
            />

            {/* Spawns the root of the prerequisite tree */}
            {hasPrereqs && (
              <div style={{ display: "flex" }}>
                <Tree
                  prerequisiteNames={this.props.prerequisite}
                  prerequisiteJSON={JSON.parse(this.props.prerequisiteJSON)}
                />
              </div>
            )}
            {!hasPrereqs}
          </div>
          <div
            style={{
              padding: "1em",
              backgroundColor: "#f5f5f5",
              marginTop: "2em",
            }}
          >
            <p>
              {this.props.prerequisiteString !== "" && <b>Prerequisite: </b>}
              {this.props.prerequisiteString}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default PrereqTree;
