import React, { Component } from 'react';
import { Segment, Input } from 'semantic-ui-react';
import { user } from "./load-data";
import { EquipmentCard } from "./equipment-card";
import { getAirState } from '../logic/aerial-combat';
import { SelectAreaDropdown } from './air-state-simulator';

export const LandBaseSegment = props => {
  const { keys, update } = props;
  const options = {};
  return (
    <Segment compact style={{backgroundColor: "rgba( 200, 200, 200, 0.05 )"}}>
      {[1,2,3].map(key =>
        <SquadronSegment keys={[...keys,key]} update={update} key={key} />
      )}
      <InputEnemyFighterPower update={update} />
    </Segment>
  );
};

const SquadronSegment = props => {
  const { keys, update } = props;
  const squadron = user.getDataByKey(...keys);
  const sortieAirState = getAirState(squadron.sortieFighterPower, sessionStorage.enemyFighterPower);
  return (
    <div style={{display: 'inline-block', margin: 10, textAlign:'center', color: 'white'}}>
      第{keys[2]}基地航空隊
      {[1,2,3,4].map(key =>
        <div key={key}>
          <EquipmentCard holder={squadron} equipment={squadron.equipments[key]} keys={[...keys,key]} update={update} />
        </div>
      )}
      <div style={{textAlign:'left'}}>
        <span style={{margin: 10}} >出撃</span>
        <span style={{margin: 10}} >制空値{squadron.sortieFighterPower}</span>
          <span style={{margin: 10}} >{sortieAirState}</span>
        <span style={{margin: 10}} >距離{squadron.distance}</span>
      </div>
      <div style={{textAlign:'left'}} >
        <span style={{margin: 10}} >防空</span>
        <span style={{margin: 10}} >制空値{squadron.defenseFighterPower}</span>
      </div>

    </div>
  );
}

const InputEnemyFighterPower = props => {
  const handleChange = (event, data) => {
    sessionStorage.enemyFighterPower = data.value;
    props.update();
  };
  return (
    <div style={{color: 'white'}} >
      <span style={{margin: 5}} >敵制空</span>
      <Input　type='number' defaultValue={sessionStorage.enemyFighterPower} onChange={handleChange} />
    </div>
  );
};
