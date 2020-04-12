import React from "react";
import { Menu, Segment, Label, Popup, Grid, Header, Button, Icon } from "semantic-ui-react";
import Logo from "../../assets/peterportal-banner-logo.svg";
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
            <div class="peterportal-logo-container">
              <a href="/"><img id="peterportal-logo" src={Logo}></img></a>
            </div>
          </Menu.Item>
          <Menu.Item>
            <div>

            <Popup style={{padding: "36px", width: "400px"}} trigger={<Label as='a' color='yellow' image>Alpha<Label.Detail>v0.1</Label.Detail></Label>} flowing hoverable >
              <Grid centered columns={1}>
                <Grid.Column textAlign='left'>
                  <Header as='h4'>Alpha Disclaimer</Header>
                  <p>
                  Please note that this is an alpha version of PeterPortal, which is still undergoing development. 
                  Some content on this web application may not be accurate. Users are encouraged to double check details.
                  <br/>
                  <br/> 
                  Should you encounter any bugs, glitches, lack of functionality or other problems on the application, 
                  please let us know immediately so we can rectify these accordingly. Your help in this regard is greatly appreciated.
                  </p>
                  <a class="ui button" href="https://github.com/icssc-projects/PeterPortal/issues/new"><Icon name='github'/>Report an issue</a>
                </Grid.Column>
          
              </Grid>
            </Popup>

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
