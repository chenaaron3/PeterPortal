import React from "react";
import { get } from "lodash";
import { Label, Popup } from "semantic-ui-react";

const CourseHitItem = (props) => (
  <div>
    <div style={{ display: "flex" }}>
      <div>
        <a href={`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/course/` + props.result._id}>
          <h3>
            <span
              className={props.bemBlocks.item("id_department")}
              dangerouslySetInnerHTML={{
                __html: get(
                  props.result,
                  "highlight.id_department",
                  props.result._source.id_department
                ),
              }}
            ></span>
            &nbsp;
            <span
              className={props.bemBlocks.item("id_number")}
              dangerouslySetInnerHTML={{
                __html: get(
                  props.result,
                  "highlight.id_number",
                  props.result._source.id_number
                ),
              }}
            ></span>
            &nbsp;
            <span
              className={props.bemBlocks.item("name")}
              dangerouslySetInnerHTML={{
                __html: get(
                  props.result,
                  "highlight.name",
                  props.result._source.name
                ),
              }}
            ></span>
          </h3>
        </a>
      </div>

      {/* sorry i write shitty code, i will refactor this later */}
      <div style={{ display: "flex", marginLeft: "auto" }}>
        {props.result._source.terms.length > 0 && (
          <Popup
            trigger={
              <div style={{ display: "inline" }}>
                {props.result._source.terms.includes("2020 Fall") && (
                  <span style={{ float: "right", marginLeft: "4px" }}>
                    <Label circular color="yellow" empty />
                  </span>
                )}

                {props.result._source.terms.includes("2020 Summer2") && (
                  <span style={{ float: "right", marginLeft: "4px" }}>
                    <Label circular color="violet" empty />
                  </span>
                )}

                {props.result._source.terms.includes("2020 Summer10wk") && (
                  <span style={{ float: "right", marginLeft: "4px" }}>
                    <Label circular color="green" empty />
                  </span>
                )}

                {props.result._source.terms.includes("2020 Summer1") && (
                  <span style={{ float: "right", marginLeft: "4px" }}>
                    <Label circular color="orange" empty />
                  </span>
                )}

                {props.result._source.terms.includes("2020 Spring") && (
                  <span style={{ float: "right", marginLeft: "4px" }}>
                    <Label circular color="teal" empty />
                  </span>
                )}
              </div>
            }
            content={
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h5 style={{ marginBottom: "4px" }}>Offered in:</h5>
                {props.result._source.terms.includes("2020 Fall") && (
                  <div style={{ float: "right" }}>
                    <Label circular color="yellow" empty />
                    <span style={{ marginLeft: "6px" }}>Fall 2020</span>
                  </div>
                )}

                {props.result._source.terms.includes("2020 Summer2") && (
                  <div style={{ float: "right" }}>
                    <Label circular color="violet" empty />
                    <span style={{ marginLeft: "6px" }}>SS II 2020</span>
                  </div>
                )}

                {props.result._source.terms.includes("2020 Summer10wk") && (
                  <div style={{ float: "right" }}>
                    <Label circular color="green" empty />
                    <span style={{ marginLeft: "6px" }}>SS 10wk 2020</span>
                  </div>
                )}

                {props.result._source.terms.includes("2020 Summer1") && (
                  <div style={{ float: "right" }}>
                    <Label circular color="orange" empty />
                    <span style={{ marginLeft: "6px" }}>SS I 2020</span>
                  </div>
                )}

                {props.result._source.terms.includes("2020 Spring") && (
                  <div style={{ float: "right" }}>
                    <Label circular color="teal" empty />
                    <span style={{ marginLeft: "6px" }}>Spring 2020</span>
                  </div>
                )}
              </div>
            }
            basic
            position="bottom right"
          />
        )}
      </div>
    </div>

    <div>
      <h4 className={"course-department_unit"}>
        {props.result._source.department}&nbsp;･&nbsp;
        {props.result._source.units[0]} units
      </h4>
      <p
        className={props.bemBlocks.item("description")}
        dangerouslySetInnerHTML={{
          __html: get(
            props.result,
            "highlight.description",
            props.result._source.description
          ),
        }}
      ></p>
      {props.result._source.prerequisite !== "" && (
        <p>
          <b>Prerequisite: </b> {props.result._source.prerequisite}
        </p>
      )}

      <p className={"course-department_unit"}>
        {props.result._source.ge_string}
      </p>

      <br />
    </div>
  </div>
);

export default CourseHitItem;
