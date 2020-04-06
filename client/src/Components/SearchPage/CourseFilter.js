import React from "react";
import {Divider, Accordion, Menu, Form} from "semantic-ui-react";
import "./CourseFilter.scss";
import {RefinementListFilter, SelectedFilters, ResetFilters, HitsStats, TermQuery, CheckboxFilter} from "searchkit";

const customHitStats = props => (
    <div>
      <p>{props.hitsCount.value} courses found in {props.timeTaken}ms</p>
  </div>
)


const GEForm = (
  <div>
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
  </div>
)

const CourseLevelForm = (
  <div>
    <CheckboxFilter id="course-level-lower" label="Lower Division (1-99)" filter={TermQuery("course_level.keyword", "Lower Division (1-99)")} />
    <CheckboxFilter id="course-level-upper" label="Upper Division (100-199)" filter={TermQuery("course_level.keyword", "Upper Division (100-199)")} />
    <CheckboxFilter id="course-level-grad" label="Graduate/Professional Only (200+)" filter={TermQuery("course_level.keyword", "Graduate/Professional Only (200+)")} />
  </div>
)


class CourseFilter extends React.Component {
  state = { activeIndex: 0 }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

    render() {
      const { activeIndex } = this.state 
        return(
         <div className="filter-list-container">
          {/* <HitsStats component={customHitStats} />
          <ResetFilters/> */}
          <h4>Search Filter</h4>
          <SelectedFilters/>

            <div style={{height: "60vh", overflowY: "auto"}}>
            <Accordion vertical>
              <Menu.Item>
                <Accordion.Title
                  active={activeIndex === 0}
                  content='General Education'
                  index={0}
                  onClick={this.handleClick}
                />
                <Accordion.Content active={activeIndex === 0} content={GEForm} />
              </Menu.Item>

              <Menu.Item>
                <Accordion.Title
                  active={activeIndex === 1}
                  content='Course Level'
                  index={1}
                  onClick={this.handleClick}
                />
                <Accordion.Content active={activeIndex === 1} content={CourseLevelForm} />
              </Menu.Item>

              <Menu.Item>
                <Accordion.Title
                  active={activeIndex === 2}
                  content='School'
                  index={2}
                  onClick={this.handleClick}
                />
                <Accordion.Content active={activeIndex === 2} content={<RefinementListFilter id="school" field="id_school.keyword" operator="OR"/>} />
              </Menu.Item>

              <Menu.Item>
                <Accordion.Title
                  active={activeIndex === 3}
                  content='Department'
                  index={3}
                  onClick={this.handleClick}
                />
                <Accordion.Content active={activeIndex === 3} content={<RefinementListFilter id="depts" field="id_department.keyword" operator="OR" size={200}/>} />
              </Menu.Item>

            </Accordion>
            </div>
            
          </div>

        )
    }
}

export default CourseFilter;