import React, { Component } from 'react';
import {  Button, Segment, Image, Divider, Checkbox, Popup } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { equipments_data } from '../data/equipments-data';
import { user, getParams } from "./load-data";
import SearchForm from "./search";
import { BackBtn } from './ship-list';
import { Utility } from '../utility';

export default class EquipmentList extends Component {
  constructor(props) {
    super(props);
    this.state = {types: [1], input: false, abysall: false};
    if (getParams().fleet === 'landBase') this.state.types = [47,48];
    if (getParams().equipment == 0) this.state.types = [16,21,23,27,28,43,44];
  }
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
  render() {
    const options = this.state;
    const style = {
      backgroundColor: "rgba( 255, 255, 255, 0.1 )",
      animation: "show 500ms",
      maxWidth: 1000,
      minHeight: 1000
    };
    let visibleIconList = [1,2,3,4,5,6,7,8,9,10,11,15,17,20,34,37,'other'];
    const params = getParams();
    if (params.build > 0) {
      if (params.fleet === 'landBase') visibleIconList = [37,6,7,8,9,10];
      else visibleIconList = [1,2,3,4,5,6,7,8,9,10,11,15,17,20,34,'other']
    };
    const middle = {verticalAlign: 'middle', margin: 5};
    return (
      <Segment inverted style={style} >
        <BackBtn />
        <SearchForm setInput={this.setInput} />
        <Checkbox toggle onChange={this.setAbysall} style={middle} />
        <span style={middle} >深海装備</span>
        <div>
          {visibleIconList.map(key=>
            <EquipmentTypes onClick={this.setTypes} type={key} key={key} />
          )}
        </div>
        <Divider />
        <EquipmentPane options={options} />
      </Segment>
    );
  }
}



const EquipmentTypes = props => {
  const { type, onClick } = props;
  const getTypes = iconType => {
    if ([1,2,3,4].includes(iconType)) return [iconType];
    switch (iconType) {
      case 5: return [5,22,32];
      case 6: return [6,56];
      case 7: return [7,57];
      case 8: return [8,58];
      case 9: return [9,59,94];
      case 10: return [10,11,25,26,41,45];
      case 11: return [12,13,93];
      case 15: return [21];
      case 17: return [14,15,40];
      case 20: return [24,30,46];
      case 34: return [43,44];
      case 37: return [47,48];
      default: return [16,17,18,19,20,23,27,28,29,31,33,34,35,36,37,39,42,50,51];
    }
  };
  const handleClick = () => {
    onClick(getTypes(type));
  };
  return (
    <Button inverted basic compact onClick={handleClick} >
    {type === 'other'
      ? <div style={{display: "flex",height:33,width:30,justifyContent:'center',alignItems:'center'}}>他</div>
      : <Image src={require(`../images/equipment-icons/${type}.png`)} inline />
    }
    </Button>
  );
};

const EquipmentPane = props => {
  const { abysall, types, input } = props.options;
  const visibleEquipments = [];
  for (let id in equipments_data) {
    if ((abysall ^ id > 500) || id == 0) continue;
    const equipment = equipments_data[id];
    let visible = false;
    if (input != '') {
      visible = true;
      for (let str of input) {
        if (!equipment.name.includes(str)) visible = false;
      };
    } else {
      if (types.includes(equipment.type)) visible = true;
    };
    equipment.id = id;
    if (visible) visibleEquipments.push(equipment);
    visibleEquipments.sort((a,b) => {
      if (a.type - b.type) return a.type - b.type;
      else if (a.types[3] - b.types[3]) return a.types[3] - b.types[3];
      else return a.id - b.id;
    });
  };
  return (
    <div>
      {visibleEquipments.map((equipment,key)=><EquipmentBtn equipment={equipment} key={key}/>)}
    </div>
  );
};

const EquipmentBtn = withRouter(props => {
  const { equipment } = props;
  const handleClick = () => {
    const {build: key0, fleet: key1, ship: key2, equipment: key3, page } = getParams();
    const shipOfBuild = user.getDataByKey(key0,key1,key2);
    if (!shipOfBuild || !shipOfBuild.equipments[key3]) return false;
    shipOfBuild.setEquipment(key3, equipment);
    if (page) props.history.push("/" + page);
    else props.history.push("/build" + (key0));
  };
  const style = {height:80,width:200, animation: "show 500ms",verticalAlign:'middle'};
  return (
    <Popup
      trigger={
        <Button inverted basic style={style} onClick={handleClick} >
          {('types' in equipment) && equipment.types[3] &&
            <Image
              src={require(`../images/equipment-icons/${equipment.types[3]}.png`)}
              inline
            />
          }
          {equipment.name}
        </Button>
      }
      content={<PopupEquipmentStatus equipment={equipment} />}
      style={{backgroundColor: "rgba( 50, 50, 50, 0.8 )"}}
      basic
    />
  );
});

const PopupEquipmentStatus = props => {
  const { equipment } = props;
  const statNameList = [];
  for (let statName in equipment) {
    if (['id','name','type','types','added_on'].includes(statName)) continue;
    statNameList.push(statName);
  };
  return (
    <div>
      {statNameList.map(statName =>
        <div style={{color: 'white'}} key={statName} >
          <EquipmentIconImage statName={statName} />
          {equipment[statName]}
        </div>
      )}
    </div>
  )
};

const EquipmentIconImage = props => {
  let { statName } = props;
  let src;
  try {
    src = Utility.getStatIconSrc(statName);
  } catch (e) {
    src = false;
  };
  if (src) return <Image src={src} style={{filter: 'invert(100%)'}} inline />
  switch (statName) {
    case 'bomb':
      statName = '爆装';
      break;
    case 'distance':
      statName = '距離';
      break;
    case 'interception':
      statName = '迎撃';
      break;
    case 'antiBomber':
      statName = '対爆';
      break;
    case 'cost':
      statName = 'コスト';
      break;
  }
  return (
    <span>{statName}</span>
  );
};
