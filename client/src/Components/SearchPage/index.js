import React from "react";
import { get } from "lodash";
import {Pagination, RefinementListFilter, ResetFilters, SearchkitComponent, Hits, NoHits, HitsStats, InitialLoader, TermQuery, CheckboxFilter, InputFilter} from "searchkit";
import {Divider, Loader} from "semantic-ui-react";
import "./filter.scss";
import "./index.scss";

const InitialLoaderComponent = (props) => (
  <div>
     Fetching course data...
  </div>
)

const HitItem = props => (
  <div>
    <div>
        <a href={"/course/" + props.result._id}>
          <h3><span className={props.bemBlocks.item("id_department")} dangerouslySetInnerHTML={{__html: get(props.result,"highlight.id_department",props.result._source.id_department)}}></span>
          &nbsp;<span className={props.bemBlocks.item("id_number")} dangerouslySetInnerHTML={{__html: get(props.result,"highlight.id_number",props.result._source.id_number)}}></span>
          &nbsp;<span className={props.bemBlocks.item("name")} dangerouslySetInnerHTML={{__html: get(props.result,"highlight.name",props.result._source.name)}}></span></h3>
        </a>
          <h4 className={"course-department_unit"}>{props.result._source.department}&nbsp;･&nbsp;{props.result._source.units[0]} units</h4>
        <p className={props.bemBlocks.item("description")} dangerouslySetInnerHTML={{__html: get(props.result,"highlight.description",props.result._source.description)}}></p>
        <p>{props.result._source.prerequisite}</p>

        <p className={"course-department_unit"}>{props.result._source.ge_string}</p>
        
      <br />
    </div>
  </div>
);

const customHitStats = props => (
      <div>
        <p>{props.hitsCount.value} courses found in {props.timeTaken}ms</p>
    </div>
  )


class SearchPage extends SearchkitComponent  {


  render() {
    return (
      <div className="App" style={{ display: "flex", flexDirection: "row" }}>
        <div className="search-page">
          <div className="filter-list-container">
          <HitsStats component={customHitStats} />
          <ResetFilters/>
              <Divider/>  
            
            <h4>General Education</h4>
            <CheckboxFilter id="ge-Ia" label="GE Ia: Lower Division Writing" filter={TermQuery("ge_types.keyword", "GE Ia: Lower Division Writing")} />
            <CheckboxFilter id="ge-Ib" label="GE Ib: Upper Division Writing" filter={TermQuery("ge_types.keyword", "GE Ib: Upper Division Writing")} />
            <CheckboxFilter id="ge-II" label="GE II: Science and Technology" filter={TermQuery("ge_types.keyword", "GE II: Science and Technology")} />
            <CheckboxFilter id="ge-III" label="GE III: Social & Behavioral Sciences" filter={TermQuery("ge_types.keyword", "GE III: Social & Behavioral Sciences")} />
            <CheckboxFilter id="ge-IV" label="GE IV: Arts and Humanities" filter={TermQuery("ge_types.keyword", "GE IV: Arts and Humanities")} />
            <CheckboxFilter id="ge-Va" label="GE Va: Quantitative Literacy" filter={TermQuery("ge_types.keyword", "GE Va: Quantitative Literacy")} />
            <CheckboxFilter id="ge-Vb" label="GE Vb: Formal Reasoning" filter={TermQuery("ge_types.keyword", "GE Vb: Formal Reasoning")} />
            <CheckboxFilter id="ge-VI" label="GE VI: Language Other Than English" filter={TermQuery("ge_types.keyword", "GE VI: Language Other Than English")} />
            <CheckboxFilter id="ge-VII" label="GE VII: Multicultural Studies" filter={TermQuery("ge_types.keyword", "GE VII: Multicultural Studies")} />
            <CheckboxFilter id="ge-VIII" label="GE VIII: International/Global Issues" filter={TermQuery("ge_types.keyword", "GE VIII: International/Global Issues")} />

            <h4>Course Level</h4>
            <CheckboxFilter id="course-level-lower" label="Lower Division (1-99)" filter={TermQuery("course_level.keyword", "Lower Division (1-99)")} />
            <CheckboxFilter id="course-level-upper" label="Upper Division (100-199)" filter={TermQuery("course_level.keyword", "Upper Division (100-199)")} />
            <CheckboxFilter id="course-level-grad" label="Graduate/Professional Only (200+)" filter={TermQuery("course_level.keyword", "Graduate/Professional Only (200+)")} />

            
            <h4>School</h4>
            <div class="ui compact menu">
              <div role="listbox" aria-expanded="false" class="ui item simple dropdown" tabindex="0">
                <div class="text" role="alert" aria-live="polite" aria-atomic="true">Add schools filter...</div>
                <i aria-hidden="true" class="dropdown icon"></i>
                <div class="menu transition">
                <RefinementListFilter id="school" field="id_school.keyword" operator="OR"/>
                </div>
              </div>
          </div>

            <h4>Department</h4>

            
            <div class="ui compact menu">
              <div role="listbox" aria-expanded="false" class="ui item simple dropdown" tabindex="0">
                <div class="text" role="alert" aria-live="polite" aria-atomic="true">Add department filter...</div>
                <i aria-hidden="true" class="dropdown icon"></i>
                <div class="menu transition" style={{height: "200px", overflowY:"scroll"}}>
                <RefinementListFilter id="depts" field="id_department.keyword" operator="OR" size={200}/>
                </div>
              </div>
          </div>

          </div>

          <div style={{ width: "40%", marginLeft: "350px", marginTop: "18px" }}>
            <div>
              <div>
              <Hits 
                itemComponent={HitItem}
                hitsPerPage={20}
                highlightFields={["name", "id_department", "id_number", "description"]}
                customHighlight={{ "pre_tags" : ["<highlight>"],
                "post_tags" : ["</highlight>"]}}/>

              <InitialLoader component={InitialLoaderComponent}/>

              <NoHits
              suggestionsField="name"></NoHits>

              <Pagination showNumbers={true}/>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchPage;
