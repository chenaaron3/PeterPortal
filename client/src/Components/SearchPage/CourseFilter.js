import React from "react";
import { Accordion, Menu} from "semantic-ui-react";
import "./Filter.scss";
import { RefinementListFilter, SelectedFilters, TermQuery, CheckboxFilter } from "searchkit";

const GEForm = (
  <div>
    <CheckboxFilter title="ge-Ia" id="ge-Ia" label="GE Ia: Lower Division Writing" filter={TermQuery("ge_types.keyword", "GE Ia: Lower Division Writing")} />
    <CheckboxFilter title="ge-Ib" id="ge-Ib" label="GE Ib: Upper Division Writing" filter={TermQuery("ge_types.keyword", "GE Ib: Upper Division Writing")} />
    <CheckboxFilter title="ge-II" id="ge-II" label="GE II: Science and Technology" filter={TermQuery("ge_types.keyword", "GE II: Science and Technology")} />
    <CheckboxFilter title="ge-III" id="ge-III" label="GE III: Social & Behavioral Sciences" filter={TermQuery("ge_types.keyword", "GE III: Social & Behavioral Sciences")} />
    <CheckboxFilter title="ge-IV" id="ge-IV" label="GE IV: Arts and Humanities" filter={TermQuery("ge_types.keyword", "GE IV: Arts and Humanities")} />
    <CheckboxFilter title="ge-Va" id="ge-Va" label="GE Va: Quantitative Literacy" filter={TermQuery("ge_types.keyword", "GE Va: Quantitative Literacy")} />
    <CheckboxFilter title="ge-Vb" id="ge-Vb" label="GE Vb: Formal Reasoning" filter={TermQuery("ge_types.keyword", "GE Vb: Formal Reasoning")} />
    <CheckboxFilter title="ge-VI" id="ge-VI" label="GE VI: Language Other Than English" filter={TermQuery("ge_types.keyword", "GE VI: Language Other Than English")} />
    <CheckboxFilter title="ge-VII" id="ge-VII" label="GE VII: Multicultural Studies" filter={TermQuery("ge_types.keyword", "GE VII: Multicultural Studies")} />
    <CheckboxFilter title="ge-VII" id="ge-VIII" label="GE VIII: International/Global Issues" filter={TermQuery("ge_types.keyword", "GE VIII: International/Global Issues")} />
  </div>
)

const CourseLevelForm = (
  <div>
    <CheckboxFilter title="course-level-lower" id="course-level-lower" label="Lower Division (1-99)" filter={TermQuery("course_level.keyword", "Lower Division (1-99)")} />
    <CheckboxFilter title="course-level-upper" id="course-level-upper" label="Upper Division (100-199)" filter={TermQuery("course_level.keyword", "Upper Division (100-199)")} />
    <CheckboxFilter title="course-level-grad" id="course-level-grad" label="Graduate/Professional Only (200+)" filter={TermQuery("course_level.keyword", "Graduate/Professional Only (200+)")} />
  </div>
)

const ATermForm = (
  <div>
  <CheckboxFilter title="2020 Fall" id="2020 Fall" label="2020 Fall" filter={TermQuery("terms.keyword", "2020 Fall")} />
  <CheckboxFilter title="2020 Spring" id="2020 Spring" label="2020 Spring" filter={TermQuery("terms.keyword", "2020 Spring")} />
</div>
)

let generateTermForm = (terms) => {
  let items = terms.map(term => <CheckboxFilter title={term} id={term} label={term} filter={TermQuery("terms.keyword", {term})}/>);
  let test = React.createElement("div", {}, ...items);
  console.log("TEST:",test);
  return (
  <div>
    <CheckboxFilter title="2020 Fall" id="2020 Fall" label="2020 Fall" filter={TermQuery("terms.keyword", "2020 Fall")} />
    {items}
  </div>);
}

const SelectedFilter = (props) => (
  <div className={"sk-selected-filters-option sk-selected-filters__item"}>
    <div className={props.bemBlocks.option("name")}>{props.labelValue}</div>
    <div className={props.bemBlocks.option("remove-action")} onClick={props.removeFilter}>x</div>
  </div>
)

class CourseFilter extends React.Component {
  state = {
    activeIndex: 0,
    terms: []
  }


  constructor(props) {
    super(props);
    this.getTerms();
  }

  getTerms = () => {
    fetch(`/api/v1/schedule/getTerms`)
      .then(res => res.json())
      .then(terms => {
        terms.reverse();
        this.setState({ terms: terms })
      });
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  render() {
    const { activeIndex } = this.state

    let TermForm = generateTermForm(this.state.terms);

    return (
      <div className="filter-list-container">

        <h4>Search Filter</h4>
        <SelectedFilters itemComponent={SelectedFilter} />

        <div style={{ overflowY: "auto" }}>
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
              <Accordion.Content active={activeIndex === 2} content={<RefinementListFilter id="school" field="id_school.keyword" operator="OR" />} />
            </Menu.Item>

            <Menu.Item>
              <Accordion.Title
                active={activeIndex === 3}
                content='Department'
                index={3}
                onClick={this.handleClick}
              />
              <Accordion.Content active={activeIndex === 3} content={<RefinementListFilter id="depts" field="id_department.keyword" operator="OR" size={200} />} />
            </Menu.Item>

            <Menu.Item>
              <Accordion.Title
                active={activeIndex === 4}
                content='Term Offered'
                index={4}
                onClick={this.handleClick}
              />
              <Accordion.Content active={activeIndex === 4} content={<RefinementListFilter id="terms" field="terms.keyword" operator="AND" orderKey="_term" orderDirection="desc" />} />
            </Menu.Item>
          </Accordion>
        </div>

      </div>

    )
  }
}

export default CourseFilter;