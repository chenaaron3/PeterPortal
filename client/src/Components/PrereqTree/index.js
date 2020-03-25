import React from "react";
import { Button } from "semantic-ui-react";
import "./prereq-tree.scss";

const horizontalStyle = { display: "inline-flex", flexDirection: "row" };

const branchStyle = { listStyleType: "none" };

class Tree extends React.Component {
  render() {
    let prerequisite = this.props.prerequisiteJSON;
    let isValueNode = typeof prerequisite === "string";
    return (
      <div style={{ margin: "auto" }}>
        {/* If is just a value node */}
        {isValueNode && (
          <span>
            <div className="prereq-node-branch">
              <a href="" role="button" className={"node ui basic button"} basic>
                {prerequisite}
              </a>
            </div>
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
                      <Tree prerequisiteJSON={child} />
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
  constructor(props) {
    super(props);
  }

  render() {
    let hasPrereqs = this.props.prerequisiteJSON != "";
    let hasDependencies = this.props.dependencies.length != 0;

    if (this.props.id == undefined) return "";
    else if (!hasPrereqs && !hasDependencies)
      return (
        <div>
          <span>No Dependencies or Prerequisites!</span>
        </div>
      );
    return (
      <div
        style={{ display: "inline-flex", flexDirection: "row", margin: "auto" }}
      >
        {/* Display dependencies */}
        {hasDependencies && (
          <>
            <div style={{ display: "flex" }}>
              <ul style={{ padding: "0", margin: "auto" }}>
              <div className="dependency-list-branch">
                {this.props.dependencies.map((dependency, index) => (
                  <div>
                    <span>
                      <div className="dependency-node">
                        <a
                          href=""
                          role="button"
                          className={"node ui button"}
                          basic
                        >
                          {dependency}
                        </a>
                      </div>
                    </span>
                  </div>
                ))}
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
        <div className="course-node_container" style={{ margin: "auto" }}>
          <a
            href=""
            role="button"
            className={"node ui button course-node"}
            basic
          >
            {this.props.id}
          </a>
        </div>
        {/* Spawns the root of the prerequisite tree */}
        {hasPrereqs && (
          <div style={{ display: "flex" }}>
            <Tree prerequisiteJSON={JSON.parse(this.props.prerequisiteJSON)} />
          </div>
        )}
        {!hasPrereqs}
      </div>
    );
  }
}

export default PrereqTree;
