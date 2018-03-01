import React, { Component } from 'react';
import { Segment, Image, Button, Input, Icon } from 'semantic-ui-react';
import { Link , withRouter } from 'react-router-dom';
import { user, getShipImage } from "./load-data";
import { EquipmentCard } from "./equipment-card";


export class ShipSegment extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.ship = user.getDataByKey(...this.props.keys);
  }
  render() {
    const style = {
      backgroundColor: "rgba( 255, 255, 255, 0.1 )",
      animation: "show 500ms",
      maxWidth: 1600
    };
    const { props } = this;
    const ship = user.getDataByKey(...props.keys);
    return (
      <Segment style={style} inverted>
        {ship.id
          ? <ShipCard ship={ship} {...props} />
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
  const { ship, keys, update } = props;
  return (
    <div>
      <Image src={getShipImage(ship.id)} inline rounded style={{margin:5}} />
      {ship.name}
      <RemoveShipBtn {...props} />
      <div>
        {ship.equipments.map((euqip, key)=>
          <EquipmentCard keys={[...keys, key]} update={update} key={key} />)
        }
        <EquipmentCard keys={[...keys, 0]} update={update} expansion />
      </div>
      <ShipStatus {...props} />
    </div>
  );
};

const RemoveShipBtn = props => {
  const { keys, update } = props;
  const removeClick = () => {
    user.getDataByKey(keys[0],keys[1]).ships[keys[2]] = {};
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
      <div style={style} >
        Lv
        <InputStat {...props} statName={'level'} />
      </div>
      {['hp','firepower','torpedo','aa','armor','evasion','asw','speed','los','range','luck'].map(stat =>
        <div key={stat} style={style} >
          <Image src={require(`../images/icons/${stat}.png`)} inline style={{filter: 'invert(100%)'}} />
          {ship[stat]}
        </div>
      )}
      <div>
        <div style={style} >{'加重対空' + ship.weightAA}</div>
        <div style={style} >{'艦隊防空ボーナス' + ship.fleetAABonus}</div>
      </div>
      {!ship.isEnemy &&ship.id > 1500 && <div style={style} >味方側として計算しています</div>}
    </div>
  );
};

const InputStat = props => {
  const { ship, statName, update } = props;
  const handleChange = event => {
    ship[statName] = parseInt(event.target.value, 10);
    update();
  };
  return (
    <Input
      type="number"
      defaultValue={ship[statName]}
      transparent
      inverted
      style={{width: 40}}
      onChange={handleChange}
    />
  );
};
