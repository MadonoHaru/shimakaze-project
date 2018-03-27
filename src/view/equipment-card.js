import React, { Component } from 'react';
import { Image, Button, Input, Icon, Label } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { SetProficiencyBtn } from "./proficiency-btn";
import { SetImprovementBtn } from "./improvement-btn";

export const EquipmentCard = props => {
  const { holder, equipment, keys, expansion } = props;
  if (isNaN(keys[3]) || (keys[3] === 0 && !expansion)) return false;
  const style = {display:'inline',verticalAlign:'middle'};
  const isFirefox = window.navigator.userAgent.toLowerCase().includes('firefox');
  return (
    <div style={style} >
    { equipment.id
      ?
        isFirefox ? <EquipmentCardOfFirefox {...props} equipment={equipment} />
        :
        <Button inverted basic compact style={{position: "relative",padding:5,width:250,height:60,...style }}>
          <div style={{width:160,textAlign:'center'}}>
            {('types' in equipment) && equipment.types[3] &&
              <Image src={require(`../images/equipment-icons/${equipment.types[3]}.png`)} inline />
            }
            {equipment.name}
          </div>
          <SlotInput {...props} />
          <SetImprovementBtn {...props} />
          <SetProficiencyBtn {...props} />
          <RemoveEquipmentBtn {...props} />
        </Button>
      :
        <AddEquipmentBtn {...props} />
    }
    </div>
  );
};

const EquipmentCardOfFirefox = props => {
  const { equipment } = props;
  return (
    <Label basic style={{position: "relative",padding:5,width:250,height:60,color:'white', backgroundColor: "rgba( 200, 200, 200, 0.15 )",verticalAlign:'middle'}} >
      <div style={{width:160,textAlign:'center'}}>
        {('types' in equipment) && equipment.types[3] &&
          <Image src={require(`../images/equipment-icons/${equipment.types[3]}.png`)} inline />
        }
        {equipment.name}
      </div>
      <SlotInput {...props} />
      <SetImprovementBtn {...props} />
      <SetProficiencyBtn {...props} />
      <RemoveEquipmentBtn {...props} />
    </Label>
  );
};

const AddEquipmentBtn = withRouter(props => {
  const { holder, keys } = props;
  const content = keys[3] === 0
    ? '補強増設'
    : `装備(${holder.slots[keys[3] - 1]})`;
  const handleClick = () => {
    if (keys[3] === undefined) {
      keys[3] = holder.equipments.push({});
    };
    let query = `?build=${keys[0]}&fleet=${keys[1]}&ship=${keys[2]}&equipment=${keys[3]}`;
    if (props.isShipStatusPage) query += '&page=ship-status';
    props.history.push('equipment-list' + query);
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
  const { holder, keys, update } = props;
  const handleRemove = () => {
    holder.removeEquipment(keys[3]);
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
  const { equipment } = props;
  const handleChange = event => equipment.slot = parseInt(event.target.value, 10);
  return (
    <Input
      type="number"
      defaultValue={equipment.slot}
      transparent
      inverted
      style={{width: 40,position: "absolute",left:8,bottom:5}}
      onChange={handleChange}
    />
  );
}
