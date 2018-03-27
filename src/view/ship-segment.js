import React, { Component } from 'react';
import { Segment, Image, Button, Input, Icon } from 'semantic-ui-react';
import { Link , withRouter } from 'react-router-dom';
import { Utility } from '../utility';
import { getShipImage } from "./load-data";
import { EquipmentCard } from "./equipment-card";


export class ShipSegment extends Component {
  render() {
    const style = {
      backgroundColor: "rgba( 255, 255, 255, 0.1 )",
      animation: "show 500ms",
      maxWidth: 1600
    };
    const { props } = this;
    return (
      <Segment style={style} inverted>
        {props.ship.id
          ? <ShipCard {...props} />
          : <CreateShipBtn {...props} />
        }
      </Segment>
    );
  }
};


const CreateShipBtn = props => {
  const { keys } = props;
  const createClick = () => {
  }
  const style = {backgroundColor: "rgba( 255, 255, 255, 0.1 )", animation: "show 500ms"};
  return (
    <Link to={`/ship-list?build=${keys[0]}&fleet=${keys[1]}&ship=${keys[2]}`} >
      <Button size="huge" inverted basic style={style} onClick={createClick}>
        <Icon name="plus" />
        艦娘編成
      </Button>
    </Link>
  );
};

const ShipCard = props => {
  const { ship, keys, update, isShipStatusPage } = props;
  return (
    <div>
      <Image src={getShipImage(ship.id)} inline rounded style={{margin:5}} />
      {ship.name}
      <RemoveShipBtn {...props} />
      <div>
        {ship.equipments.map((equipment, key)=>
          <EquipmentCard key={key} holder={ship} equipment={equipment} keys={[...keys, key]} update={update} isShipStatusPage={isShipStatusPage} />
        )}
        <EquipmentCard holder={ship} equipment={ship.equipments[0]} keys={[...keys, 0]} update={update} expansion isShipStatusPage={isShipStatusPage} />
      </div>
      <ShipStatus {...props} />
      <div>
        <span>{'加重対空' + ship.weightAA}</span>
        <span>{'　艦隊防空ボーナス' + ship.fleetAABonus}</span>
      </div>
      {!ship.isEnemy &&ship.id > 1500 && <div>味方側として計算しています</div>}
    </div>
  );
};

const RemoveShipBtn = props => {
  const { fleet, keys, update, isShipStatusPage } = props;
  if (isShipStatusPage) return null;
  const removeClick = () => {
    fleet.ships[keys[2]] = {};
    update();
  };
  return (
    <Button icon="remove" onClick={removeClick} size="mini" inverted basic style={{margin:5}} />
  );
};

const ShipStatus = props => {
  const { ship, keys } = props;
  const style = {display: 'inline-block', margin: 5};
  return (
    <div>
      <ShipStatusPageBtn keys={keys} />
      <div style={style} >
        Lv
        <InputStat {...props} statName={'level'} />
      </div>
      {['hp','firepower','torpedo','antiAir','armor','evasion','asw','speed','los','range','luck'].map(stat =>
        <div key={stat} style={style} >
          <Image src={Utility.getStatIconSrc(stat)} inline style={{filter: 'invert(100%)'}} />
          {ship[stat]}
        </div>
      )}
    </div>
  );
};

const InputStat = props => {
  const { ship, statName, update } = props;
  const handleChange = event => {
    ship[statName] = parseInt(event.target.value, 10);
    update();
  };
  let min;
  if (statName === 'level') min = 1;
  return (
    <Input
      type="number"
      min={min}
      value={ship[statName]}
      transparent
      inverted
      style={{width: 40}}
      onChange={handleChange}
    />
  );
};

const ShipStatusPageBtn = props => {
  const { keys } = props;
  const query = `?build=${keys[0]}&fleet=${keys[1]}&ship=${keys[2]}`;
  return (
    <Link to={'/ship-status' + query} ><Icon name='info circle' style={{color: 'white'}} /></Link>
  );
};
