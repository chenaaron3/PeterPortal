import React, { useState } from "react";
import { Icon, Popup, Grid, Label, Header } from "semantic-ui-react";
// import {useCookies} from 'react-cookie';

import { ReactComponent as CogIcon } from "../../Assets/cog.svg";
import { ReactComponent as ArrowIcon } from "../../Assets/arrow.svg";
import { CSSTransition } from "react-transition-group";

import Logo from "../../Assets/peterportal-banner-logo.svg";
import "./NavBar.scss";

class NavBar extends React.Component {
  state = { activeItem: "search", week: "" };
  // cookies = useCookies(['name']);
  constructor(props) {
    super(props);
    // const [cookies, setCookie] = useCookies(['name']);
    fetch(`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/users/getName`, { method: "GET" })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.setState({ name: data.name, picture: data.picture });
      });

    fetch(`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/api/v1/schedule/getWeek`, { method: "GET" })
      .then((res) => res.text())
      .then((text) => this.setState({ week: text }));
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    return (
      <nav className="navbar">
        <div className="navbar-nav">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginRight: "auto",
              alignItems: "center",
            }}
          >
            <div className="peterportal-logo-container">
              <a href={`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/`}>
                <img alt="PeterPortal" id="peterportal-logo" src={Logo}></img>
              </a>
            </div>
            <div style={{display: "flex"}}>
              <div className={"school-term_container"}>
                <p className={"school-term"} style={{ marginBottom: "-1px" }}>
                  {this.state.week}
                </p>
              </div>
            </div>
          </div>

          <div style={{margin: "auto 12px"}}>
          <Popup style={{padding: "36px", width: "400px"}} position='bottom right' trigger={<Label as='a' color='yellow' image>alpha<Label.Detail>v1</Label.Detail></Label>} flowing  hoverable >
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
          <NavItem userPicture={this.state.picture} icon={<Icon name="user outline" />}>
            <DropdownMenu name={this.state.name} picture={this.state.picture}/>
          </NavItem>
        </div>
      </nav>
    );
  }
}

function NavItem(props) {
  const [open, setOpen] = useState(false);

  return (
    <li className="nav-item">
      <div className="icon-button" 
      style={{backgroundImage: "url(" + props.userPicture + ")", backgroundSize: "contain" }} 
      onClick={() => setOpen(!open)}>
        {!props.userPicture ? props.icon : ""}
      </div>

      {open && props.children}
    </li>
  );
}

function DropdownMenu(props) {
  const [activeMenu, setActiveMenu] = useState("main");

  function DropdownItem(props) {
    return (
      <div
        className={["menu-item", props.className].join(" ")}
        onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}
      >
        <span className="icon-button" 
        style={{backgroundImage: "url(" + props.picture + ")", backgroundSize: "contain" }}>
          {props.leftIcon}
        </span>
        <span className="button-text">{props.children}</span>
      </div>
    );
  }

  return (
    <div className="dropdown-menu">
      <CSSTransition
        in={activeMenu === "main"}
        unmountOnExit
        timeout={500}
        classNames="menu-primary"
      >
        <div className="menu">
        {!props.name ?
          <DropdownItem leftIcon={<Icon name="sign in" />} goToMenu="login">
            Log In
          </DropdownItem> : <>

            <DropdownItem picture= {props.picture} >
              {props.name}
            </DropdownItem>

          <a href={`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/users/logout`}>  
            <DropdownItem leftIcon={<Icon name="log out" />}>
              Log Out
            </DropdownItem>
          </a> </>
        }
          <DropdownItem leftIcon={<CogIcon />} goToMenu="settings">
            Settings
          </DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === "login"}
        unmountOnExit
        timeout={500}
        classNames="menu-secondary"
      >
        <div className="menu">
          <DropdownItem leftIcon={<ArrowIcon />} goToMenu="main"></DropdownItem>
          <a href={`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/users/auth/google`}> 
            <DropdownItem
              className="google-login"
              leftIcon={<Icon name="google" />}
            >
              Log In using Google
            </DropdownItem>
          </a>
          <a href={`${process.env.NODE_ENV == "production" ? process.env.REACT_APP_SUBDIRECTORY : ""}/users/auth/facebook`}> 
            <DropdownItem
              className="facebook-login"
              leftIcon={<Icon name="facebook f" />}
            >
              Log In using Facebook
            </DropdownItem>
          </a>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === "settings"}
        unmountOnExit
        timeout={500}
        classNames="menu-secondary"
      >
        <div className="menu">
          <DropdownItem leftIcon={<ArrowIcon />} goToMenu="main"></DropdownItem>
          <DropdownItem
            className="dark-mode"
            leftIcon={<Icon name="moon" />}
          >
            Dark Mode <i style={{color: "gray"}}>Coming Soon!</i>
          </DropdownItem>
        </div>
      </CSSTransition>
    </div>
  );
}

export default NavBar;
