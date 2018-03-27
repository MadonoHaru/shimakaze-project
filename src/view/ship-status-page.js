import React, { Component } from 'react';
import { Segment, Table, Button, Header, Dropdown, Input, Checkbox, Modal, Progress, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { user } from "./load-data";
import { ShipSegment } from "./ship-segment";
import { CreateBuildByDeckBuilderData } from "../logic/build";
import { Utility } from '../utility';


export class ShipStatusPage extends Component {
  state = {key: Math.random()}
  update = () => this.setState({key: Math.random()})
  render() {
    const style = {
      backgroundColor: "rgba( 255, 255, 255, 0.1 )",
      animation: "show 500ms",
    };
    const {build: bkey, fleet: fkey, ship: skey} = Utility.getParams();
    const keys = [bkey, fkey, skey];
    const ship = user.getDataByKey(...keys);
    const { update } = this;
    return (
      <Segment style={style} inverted >
        <Header inverted >艦娘詳細</Header>
        <ShipSegment ship={ship} keys={keys} update={update} isShipStatusPage />
        <div>
          <div style={style} >{'加重対空' + ship.weightAA}</div>
          <div style={style} >{'艦隊防空ボーナス' + ship.fleetAABonus}</div>
        </div>
        {!ship.isEnemy &&ship.id > 1500 && <div style={style} >味方側として計算しています</div>}
      </Segment>
    );
  }
}
