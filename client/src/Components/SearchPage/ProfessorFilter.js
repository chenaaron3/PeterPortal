import React from "react";
import { Accordion, Menu } from "semantic-ui-react";
import "./Filter.scss";
import {
  RefinementListFilter,
  SelectedFilters,
} from "searchkit";

const SelectedFilter = (props) => (
  <div className={"sk-selected-filters-option sk-selected-filters__item"}>
    <div className={props.bemBlocks.option("name")}>{props.labelValue}</div>
    <div
      className={props.bemBlocks.option("remove-action")}
      onClick={props.removeFilter}
    >
      x
    </div>
  </div>
);

class ProfessorFilter extends React.Component {
  state = { activeIndex: 0 };

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  render() {
    const { activeIndex } = this.state;
    return (
      <div className="filter-list-container">
        <h4>Search Filter</h4>
        <SelectedFilters itemComponent={SelectedFilter} />

        <div style={{ overflowY: "auto" }}>
          <Accordion vertical>
            <Menu.Item>
              <Accordion.Title
                active={activeIndex === 0}
                content="School"
                index={0}
                onClick={this.handleClick}
              />
              <Accordion.Content
                active={activeIndex === 0}
                content={
                  <RefinementListFilter
                    id="school"
                    field="schools.keyword"
                    operator="OR"
                  />
                }
              />
            </Menu.Item>

            <Menu.Item>
              <Accordion.Title
                active={activeIndex === 1}
                content="Department"
                index={1}
                onClick={this.handleClick}
              />
              <Accordion.Content
                active={activeIndex === 1}
                content={
                  <RefinementListFilter
                    id="depts"
                    field="department.keyword"
                    operator="OR"
                    size={200}
                  />
                }
              />
            </Menu.Item>
          </Accordion>
        </div>
      </div>
    );
  }
}

export default ProfessorFilter;
