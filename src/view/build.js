import React, { Component } from 'react';
import { Segment, Input, Header, Tab, Checkbox, Label } from 'semantic-ui-react';
import { user } from "./load-data";
import { ShipSegment } from "./ship-segment";
import { EquipmentCard } from "./equipment-card";
import { LandBaseSegment } from "./land-base-segment";

export class Build extends Component {
  state = { key: Math.random() }
  update = () => this.setState({ key: Math.random() })
  render() {
    const keys = [parseInt(this.props.match.params.key, 10)];
    const build = user.getDataByKey(keys[0]);
    if (!keys[0]) return false;
    if (!build) return false;
    return (
      <div>
        <BuildHeader build={build} />
        <div>
          <CombinedFleetSwitch build={build} update={this.update} />
          <EnemySwitch build={build} update={this.update} />
        </div>
        <BuildTab keys={keys} build={build} update={this.update} />
      </div>
    );
  }
}

class BuildHeader extends Component {
  state = {inputMode: false}
  build = this.props.build
  click = () => this.setState({inputMode: true});
  blur = () => this.setState({inputMode: false});
  change = (event) => {
    const value = event.target.value;
    this.build.name = value;
  }
  render() {
    const name = this.build.name;
    return (
      <div onClick={this.click} >
        {this.state.inputMode
          ? <Input
            autoFocus
            onInput={this.change}
            onBlur={this.blur}
            defaultValue={name}
            />
         : <Header as='h1' inverted >{name}</Header>
      }
      </div>
    );
  }
}

const CombinedFleetSwitch = props => {
  const { build, update } = props;
  const handleChange = (event, data) => {
    build.isCombinedFleet = data.checked;
    update();
  };
  const style = {verticalAlign: 'middle', margin: 5};
   return (
    <span>
      <span style={{color: 'white', ...style}}>
        連合艦隊
      </span>
      <Checkbox
        toggle
        style={style}
        onChange={handleChange}
        defaultChecked={build.isCombinedFleet}
      />
    </span>
  );
};

const EnemySwitch = props => {
  const { build, update } = props;
  const handleChange = (event, data) => {
    build.isEnemy = data.checked;
    update();
  };
  const style = {verticalAlign: 'middle', margin: 5};
   return (
    <span style={{margin: 10}}>
      <span style={{color: 'white', ...style}}>
        敵判定
      </span>
      <Checkbox
        style={style}
        onChange={handleChange}
        defaultChecked={build.isEnemy}
      />
    </span>
  );
};

const BuildTab = props => {
  const { keys, build, update } = props;
  let tab1Name, tab2Name;
  if (build.isCombinedFleet) {
    tab1Name = '連合第1';
    tab2Name = '連合第2';
  } else {
    tab1Name = '1';
    tab2Name = '2';
  };
  const panes = [
    { menuItem: tab1Name, render: () => <FleetSegment keys={[...keys,1]} update={update} /> },
    { menuItem: tab2Name, render: () => <FleetSegment keys={[...keys,2]} update={update} /> },
    { menuItem: '3', render: () => <FleetSegment keys={[...keys,3]} update={update} /> },
    { menuItem: '4', render: () => <FleetSegment keys={[...keys,4]} update={update} /> },
    { menuItem: '基地', render: () => <LandBaseSegment keys={[...keys,'landBase']} update={update} /> },
  ];
  const handleChange = (event, data) => {
    sessionStorage['activeIndex' + keys[0]] = data.activeIndex;
  };
  return (
    <Tab
      defaultActiveIndex={sessionStorage['activeIndex' + keys[0]]}
      onTabChange={handleChange}
      menu={{secondary: true, inverted: true}}
      panes={panes}
      style={{backgroundColor: "rgba( 255, 255, 255, 0 )"}}
    />
  );
}

const FleetSegment = props => {
  const { keys, update } = props;
  const build = user.builds[keys[0]];
  const fleet = build.fleets[keys[1]];
  const style = {color: 'white', backgroundColor: "rgba( 200, 200, 200, 0.05 )", animation: "show 500ms"};
  return (
    <Tab.Pane attached={false} style={style} >
      <span>{'制空値' + fleet.fighterPower}</span>
      <span>{'　単縦艦隊防空' + build.getFleetAA('単縦')}</span>
      {[1,2,3,4,5,6].map((key) =>
        <ShipSegment build={build} keys={[...keys, key]} update={update} key={key} />
      )}
    </Tab.Pane>
  );
};
