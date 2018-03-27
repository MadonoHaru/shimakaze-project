import React, { Component } from 'react';
import { Segment, Input, Header, Tab, Checkbox, Label, Button, Modal, Popup } from 'semantic-ui-react';
import { user } from "./load-data";
import { ShipSegment } from "./ship-segment";
import { EquipmentCard } from "./equipment-card";

export const FleetSegment = props => {
  const { keys, update } = props;
  const build = user.builds[keys[0]];
  const fleet = build.fleets[keys[1]];
  const style = {color: 'white', backgroundColor: "rgba( 200, 200, 200, 0.05 )", animation: "show 500ms"};
  return (
    <Tab.Pane attached={false} style={style} >
      <span>{'制空値' + fleet.fighterPower}</span>
      <SupportType fleet={fleet} />
      {fleet.ships.map((ship, key) => {
        if (key === 0) return;
        return <ShipSegment build={build} fleet={fleet} ship={ship} keys={[...keys, key]} update={update} key={key} />
      })}
      <AddShipSpaceBtn fleet={fleet} update={update} />
      <RemoveShipSpaceBtn fleet={fleet} update={update} />
    </Tab.Pane>
  );
};

const SupportType = props => {
  const { fleet } = props;
  let supportType = '不可';
  if (fleet.supportType === 'aerial') supportType = '航空';
  if (fleet.supportType === 'shelling') supportType = '砲撃';
  if (fleet.supportType === 'torpedo') supportType = '雷撃';
  return (
    <span style={{margin: 10}}>支援判定：{supportType}</span>
  );
};

const AddShipSpaceBtn = props => {
  const { fleet, update } = props;
  const handleClick = () => {
    fleet.ships.push({});
    update();
  };
  return (
    <Button inverted basic icon='plus' onClick={handleClick} />
  );
};
const RemoveShipSpaceBtn = props => {
  const { fleet, update } = props;
  const handleClick = () => {
    console.log(fleet.ships);
    if (fleet.ships.length <= 7) return;
    fleet.ships.pop();
    update();
  };
  return (
    <Button inverted basic icon='minus' onClick={handleClick} />
  );
};
