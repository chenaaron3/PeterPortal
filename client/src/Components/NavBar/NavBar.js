import React from "react";
import { Menu, Segment } from "semantic-ui-react";
import Logo from "../../Assets/peterportal-banner-logo.svg";
import { SearchBox } from "searchkit";
import "./NavBar.scss";

class NavBar extends React.Component {
  state = { activeItem: "search" };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });
  render() {
    const { activeItem } = this.state;
    return (
      <div className={"top-bar"} style={{ overflowX: "hidden" }}>
        <Menu secondary className="nav-menu">
          <Menu.Item>
            <div style={{ marginLeft: "50px", maxWidth: "160px" }}>
              <img id="peterportal-logo" src={Logo}></img>
            </div>
          </Menu.Item>

          <Menu.Item position="right">
            <Segment>
              <Menu pointing secondary className="nav-menu">
                <Menu.Item
                  name="search"
                  icon="search"
                  active={activeItem === "search"}
                  onClick={this.handleItemClick}
                />

                <Menu.Item
                  name="settings"
                  icon="settings"
                  active={activeItem === "settings"}
                  onClick={this.handleItemClick}
                />

                <Menu.Item position="right">
                  <div className={"school-term_container"}>
                    <p className={"school-term"} style={{marginBottom: "-1px"}}>Week 2, Spring 2020</p>
                  </div>
                </Menu.Item>
              </Menu>
            </Segment>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}

export default NavBar;
