import React, { Component } from 'react';
import { Segment } from 'semantic-ui-react';
import { user } from "./load-data";
import { EquipmentCard } from "./equipment-card";

export const LandBaseSegment = props => {
  const { keys, update } = props;
  return (
    <Segment compact style={{backgroundColor: "rgba( 200, 200, 200, 0.05 )"}}>
      {[1,2,3].map(key => <SquadronSegment keys={[...keys,key]} update={update} key={key} />)}
    </Segment>
  );
};

const SquadronSegment = props => {
  const { keys, update } = props;
  const squadron = user.getDataByKey(...keys);
  return (
    <div style={{display: 'inline-block', margin: 10, textAlign:'center', color: 'white'}}>
      第{keys[2]}基地航空隊
      {[1,2,3,4].map(key =>
        <div key={key}><EquipmentCard keys={[...keys,key]} update={update} /></div>
      )}
      <div style={{textAlign:'left'}}>
        <span style={{margin: 10}} >出撃</span>
        <span style={{margin: 10}} >制空{squadron.sortieFighterPower}</span>
        <span style={{margin: 10}} >距離{squadron.distance}</span>
      </div>
      <div style={{textAlign:'left'}} >
        <span style={{margin: 10}} >防空</span>
        <span style={{margin: 10}} >制空{squadron.defenseFighterPower}</span>
        <span style={{margin: 10}} >撃墜ボーナス{squadron.defenseShotDownBonus}%</span>
      </div>

    </div>
  );
}
