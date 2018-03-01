import React, { Component } from 'react';
import { Button, Segment, Image, Divider, Checkbox } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { user, getParams, getShipImage } from "./load-data";
import { ships_data } from '../data/ships-data';
import SearchForm from "./search";
import { CreateNewShip } from '../logic/ship';

export default class ShipList extends Component {
  state = {types: [11], input: false, abysall: false, isRemodel: true}
  setTypes = (types) => {
    const state = this.state;
    state.types = types;
    this.setState(state);
  }
  setInput = (input) => {
    const state = this.state;
    state.input = input;
    this.setState(state);
  }
  setAbysall = (e,data) => {
    const state = this.state;
    state.abysall = data.checked;
    this.setState(state);
  }
  setRemodel = (e,data) => {
    const state = this.state;
    state.isRemodel = !data.checked;
    this.setState(state);
  }
  render() {
    const options = this.state;
    const style = {
      backgroundColor: "rgba( 255, 255, 255, 0.1 )",
      animation: "show 500ms",
      maxWidth: 1000
    };
    const middle = {verticalAlign: 'middle', margin: 8};
    return (
      <Segment style={style} inverted >
        <BackBtn />
        <SearchForm setInput={this.setInput} />
        <Checkbox toggle onChange={this.setAbysall} style={middle} />
          <span style={middle}  >深海棲艦</span>
          <div>
            <Checkbox onChange={this.setRemodel} style={middle} />
            <span style={middle}  >最終改造以外を表示</span>
          </div>
        <div>
          {['海防','駆逐','軽巡','雷巡','重巡','航巡','戦艦','航戦','軽空','正空','装空','潜水','水母','他'].map(key=>
            <ShipTypes onClick={this.setTypes} type={key} key={key} />
          )}
        </div>
        <Divider />
        <ShipPane options={options} />
      </Segment>
    );
  }
}

export const BackBtn = withRouter(props => {
  const {build: bkey} = getParams();
  const handleClick = () => {
    if (bkey) props.history.push("/build" + (bkey));
    else props.history.push("/");
  };
  return (
    <Button inverted basic onClick={handleClick} icon='arrow left' >
    </Button>
  );
});

const ShipTypes = props => {
  const { type, onClick } = props;
  const getTypes = shipType => {
    switch (type) {
      case '海防': return [1];
      case '駆逐': return [2];
      case '軽巡': return [3];
      case '雷巡': return [4];
      case '重巡': return [5];
      case '航巡': return [6];
      case '軽空': return [7];
      case '戦艦': return [8,9,12];
      case '航戦': return [10];
      case '正空': return [11];
      case '装空': return [18];
      case '潜水': return [13,14];
      case '水母': return [16];
      default: return [15,17,19,20,21,22];
    }
  };
  const handleClick = () => {
    onClick(getTypes(type));
  };
  return (
    <Button inverted basic compact onClick={handleClick} >
      <div style={{display: "flex",height:33,width:30,justifyContent:'center',alignItems:'center'}}>{type}</div>
    </Button>
  );
};


const ShipPane = props => {
  const { abysall, types, input, isRemodel } = props.options;
  const visibleShips = [];
  const canRemodel = ship => ('remodel' in ship) && ("next" in ship.remodel);
  const canConvert = ship => {
    return ship.remodel.convert ? true : false;
  }
  const isUseful = ship => {
    if (!canRemodel(ship)) return true;
    if (canConvert(ship)) return true;
    if (ships_data[ship.remodel.next].type != ship.type) {
      return ![3,5,9].includes(ship.type);
    }
    return false;
  };
  for (let id in ships_data) {
    if (id < 2000) {
      if ((abysall ^ id > 1500) || id == 0 ) continue;
    };
    const ship = ships_data[id];
    let visible = false;
    if (input != '') {
      visible = true;
      for (let str of input) {
        if (!ship.name.includes(str)) visible = false;
      };
    } else {
      if (id > 2000) continue;
      if (!types.includes(ship.type)) continue;
      if (isRemodel || abysall) {
        visible = isUseful(ship);
      } else {
        visible = canRemodel(ship) && !canConvert(ship);
      };
    };
    if (visible) visibleShips.push(ship);
  };
  if (!abysall) visibleShips.sort((a,b) => a.sort_no - b.sort_no);
  return (
    <div>
      {visibleShips.map((ship,key)=>
        <SelectShipBtn ship={ship} key={key} />
      )}
    </div>
  );
};



const SelectShipBtn = withRouter(props => {
  const { ship } = props;

  const src = getShipImage(ship.id);
  const style = {backgroundColor: "rgba( 255, 255, 255, 0.1 )", animation: "show 500ms"};
  const handleClick = () => {
    const {build: bkey, fleet: fkey, ship: skey} = getParams();
    const fleet = user.getDataByKey(bkey,fkey);
    if (!fleet.ships || !skey) return false;
    fleet.setShip(skey, ship);
    props.history.push("/build" + (bkey));
  };
  return (
    <Button style={style} inverted basic onClick={handleClick} >
      <Image src={src} rounded />
      <div>{ship.name}</div>
    </Button>
  );
});
