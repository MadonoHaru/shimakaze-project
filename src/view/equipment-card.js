import React, { Component } from 'react';
import { Image, Button, Input, Icon } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { user } from "./load-data";
import { SetProficiencyBtn } from "./proficiency-btn";
import { SetImprovementBtn } from "./improvement-btn";

export const EquipmentCard = props => {
  const { keys, expansion, update } = props;
  if (isNaN(keys[3]) || (keys[3] === 0 && !expansion)) return false;
  const equipment = user.getDataByKey(...keys);
  const style = {display:'inline',verticalAlign:'middle'};
  return (
    <div style={style} >
    { equipment.id
      ?
        <Button inverted basic compact style={{position: "relative",padding:5,width:250,height:60,...style }}>
          <div style={{width:160,textAlign:'center'}}>
            {('types' in equipment) && equipment.types[3] &&
              <Image src={require(`../images/equipment-icons/${equipment.types[3]}.png`)} inline />
            }
            {equipment.name}
          </div>
          <SlotInput keys={keys} />
          <SetImprovementBtn equipment={equipment} update={update} />
          <SetProficiencyBtn equipment={equipment} update={update} />
          <RemoveEquipmentBtn keys={keys} update={update} />
        </Button>
      :
        <AddEquipmentBtn keys={keys} />
    }
    </div>
  );
};

const AddEquipmentBtn = withRouter(props => {
  const { keys } = props;
  const ship = user.getDataByKey(keys[0],keys[1],keys[2]);
  const content = keys[3] === 0
    ? '補強増設'
    : `装備(${ship.slots[keys[3] - 1]})`;
  const handleClick = () => {
    if (keys[3] === undefined) {
      keys[3] = ship.equipments.push({});
    };
    props.history.push(
      `/equipment-list?build=${keys[0]}&fleet=${keys[1]}&ship=${keys[2]}&equipment=${keys[3]}`
    );
  };
  return (
      <Button
        inverted
        basic
        onClick={handleClick}
         icon="plus"
         content={content}
         style={{height:59, width: 250}}
      />
  );
});


const RemoveEquipmentBtn = props => {
  const { keys, update } = props;
  const handleRemove = () => {
    const ship = user.getDataByKey(keys[0],keys[1],keys[2]);
    ship.removeEquipment(keys[3]);
    update();
  };
  return (
    <Icon
      name="remove"
      onClick={handleRemove}
      style={{position: "absolute",right:0,top:5}}
    />
  );
};

const SlotInput = props => {
  const { keys } = props;
  const key = keys[3];
  if (!key) return null
  const slots = user.getDataByKey(keys[0],keys[1],keys[2]).slots;
  const handleChange = event => slots[key - 1] = parseInt(event.target.value, 10);
  return (
    <Input
      type="number"
      defaultValue={slots[key - 1]}
      transparent
      inverted
      style={{width: 40,position: "absolute",left:8,bottom:5}}
      onChange={handleChange}
    />
  );
}
