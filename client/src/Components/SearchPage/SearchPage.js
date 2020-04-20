import React from "react";
import "./SearchPage.scss";
import SearchEngine from "./SearchEngine.js";
import queryString from "query-string";

class SearchPage extends React.Component {
  state = { activeItem: "courses" };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;
    return (
      <>
        {activeItem === "courses" && <SearchEngine activeItem={activeItem} handleItemClick={this.handleItemClick}/>}
        {activeItem === "professors" && <SearchEngine activeItem={activeItem} handleItemClick={this.handleItemClick}/>}
      </>
    );
  }
}

export default SearchPage;
