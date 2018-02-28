import React, { Component } from 'react';
import { Menu, Segment } from 'semantic-ui-react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import './app.css';
import ShipList from './ship-list';
import EquipmentList from './equipment-list';
import { BuildList } from './build-list';
import { Build } from './build';
import { Home } from './home';
import { AirStateSimulator } from './air-state-simulator';

export default class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <TopMenu />
          <Pane>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/ship-list" component={ShipList} />
              <Route path="/equipment-list" component={EquipmentList} />
              <Route exact path="/build-list" component={BuildList} />
              <Route path="/build:key" component={Build} />
              <Route path="/air-state-simulator" component={AirStateSimulator} />
            </Switch>
          </Pane>
        </div>
      </BrowserRouter>
    );
  }
}


class Pane extends Component {
  tabstyle = { backgroundColor: "rgba( 50, 70, 120, 0.85 )", animation: "show 0.5s ", minHeight: 800 };
  render() {
    return (
      <Segment style={this.tabstyle} >
        {this.props.children}
      </Segment >
    );
  }
}

class TopMenu extends Component {

  state = { activeItem: 'home' }

  isActive = (path) => {
    if (path === "/") return window.location.pathname === "/";
    return window.location.pathname.includes(path);
  }
  createMenu = (name, path) => {
    return <Link to={path}><Menu.Item name={name} active={this.isActive(path)} /></Link>;
  }
  render() {
    const tabstyle = { backgroundColor: "rgba( 50, 70, 120, 0.85 )", animation: "show 0.5s " };
    return (
      <Menu secondary pointing size='massive' inverted style={tabstyle} >
        {this.createMenu("Test中","/")}
        {this.createMenu("編成","/build-list")}
        {this.createMenu("制空シミュ","air-state-simulator")}
      </Menu>
    )
  }
}