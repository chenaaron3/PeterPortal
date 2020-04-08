import React from "react";
import { get } from "lodash";

const ProfessorHitItem = (props) => (
    <div>
      <div>
        <a href={"/course/" + props.result._id}>
          <h3>
            <span
              className={props.bemBlocks.item("prof_name")}
              dangerouslySetInnerHTML={{
                __html: get(
                  props.result,
                  "highlight.name",
                  props.result._source.name
                ),
              }}
            ></span>
            <span
              className={props.bemBlocks.item("title")}
              dangerouslySetInnerHTML={{
              __html: ", " + get(
                  props.result,
                  "highlight.title",
                  props.result._source.title
              ),
              }}
            ></span>
          </h3>
        </a>
        <h4 className={"course-department_unit"}>
          {props.result._source.department}&nbsp;･&nbsp;
          {props.result._source.ucinetid + "@uci.edu"}
        </h4>  
        <br />
      </div>
    </div>
  );


  export default ProfessorHitItem;