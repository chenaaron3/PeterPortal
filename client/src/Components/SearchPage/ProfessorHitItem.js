import React from "react";
import { get } from "lodash";

const ProfessorHitItem = (props) => (
    <div>
        {console.log(props)}
      <div>
        <a href={"/course/" + props.result._id}>
          <h3>
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
        &nbsp;
        <p
        className={props.bemBlocks.item("ucinetid")}
        dangerouslySetInnerHTML={{
            __html: get(
            props.result,
            "highlight.ucinetid",
            props.result._source.ucinetid + "@uci.edu"
            ),
        }}
        ></p>
        &nbsp;
        <p
            className={props.bemBlocks.item("title")}
            dangerouslySetInnerHTML={{
            __html: get(
                props.result,
                "highlight.title",
                props.result._source.title
            ),
            }}
        ></p>
        <p
          className={props.bemBlocks.item("department")}
          dangerouslySetInnerHTML={{
            __html: get(
              props.result,
              "highlight.department",
              props.result._source.department
            ),
          }}
        ></p>
  
        <br />
      </div>
    </div>
  );


  export default ProfessorHitItem;