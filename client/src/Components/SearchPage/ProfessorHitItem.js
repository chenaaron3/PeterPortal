import React from "react";
import { get } from "lodash";

const ProfessorHitItem = (props) => (
    <div style={{display: "flex", margin: "0 0 42px"}}>
       <a href={`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/professor/` + props.result._id}><div style={{marginRight: "16px", minWidth: "50px", maxWidth: "50px", height: "50px", borderRadius: "50px", background: "#74D1F6", display: "flex", alignItems: "center"}}>
        <h3 style={{width: "100%", textAlign: "center", color: "white"}}>{props.result._source.name.split(' ').map(x => x[0])}</h3>
      </div></a>
      <div style={{width: "100%"}}>
        <a href={`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/professor/` + props.result._id}>
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
         
          </h3>
        </a>
        <h4 className={"course-department_unit"}>
          {props.result._source.department}&nbsp;･&nbsp;
          {props.result._source.title}
        </h4>  

       
        {props.result._source.courseHistory.length > 0 &&
         <p><b>Recently taught:&nbsp;</b>
         {props.result._source.courseHistory.map((item, index) => <span>{(index ? ', ': '')}<a style={{color: "black"}} href={`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/course/` + item.replace(/\s+/g, '')}>{item}</a></span>)}
        </p>
        }
      </div>

    
    </div>
  );


  export default ProfessorHitItem;