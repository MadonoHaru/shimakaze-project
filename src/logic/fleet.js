import { Ship, CreateNewShip } from './ship';

export class Fleet {
  constructor(fleet) {
    for (let prop in fleet) {
      this[prop] = fleet[prop];
    };
    for (let index in this.ships) {
      this.ships[index] = new Ship(this.ships[index]);
      this.ships[index].position = [this.key, index];
    };
  }

  setShip = (key, shipData) => {
    const newShip = new CreateNewShip(shipData);
    newShip.isEnemy = this.isEnemy;
    newShip.isCombinedFleet = this.isCombinedFleet;
    newShip.position = [this.key, key];
    this.ships[key] = newShip;
  };

  getfleetAA(options) {
    let value = 0;
    for (let ship of this.ships) {
      if (!('name' in ship)) continue;
      value += ship.fleetAABonus;
    };
    let formationCoef = 1;
    switch (options.formation) {
      case '複縦陣':
        formationCoef = 1.2;
        break;
      case '輪形陣':
        formationCoef = 1.6;
        break;
      case '第一警戒航行序列':
        formationCoef = 1.1;
        break;
      case '第三警戒航行序列':
        formationCoef = 1.5;
        break;
    };
    value = Math.floor(value * formationCoef) * 2;
    if (!this.isEnemy) value = value / 1.3;
    return value;
  }
  get fighterPower() {
    let val = 0;
    for (let ship of this.ships) {
      if (!ship.id) continue;
      val += ship.fighterPower;
    };
    return val;
  }

  get landBaseCombatFighterPower() {
    let val = 0;
    for (let ship of this.ships) {
      if (!ship.id) continue;
      val += ship.landBaseCombatFighterPower;
    };
    return val;
  }

  shotDownByStage1 = (airStateNum, isLandBaseCombat) => {
    for (let ship of this.ships) {
      if (!ship.hp) continue;
      ship.shotDownByStage1(airStateNum, isLandBaseCombat);
    };
  }

  get aircraftListOfStage2() {
    const list = [];
    for (let ship of this.ships) {
      if (!ship.hp) continue;
      for (let equipment of ship.equipments) {
        if (![7,8,11,47,57,58].includes(equipment.type)) continue;
        if (equipment.slot <= 0) continue;
        list.push(equipment);
      };
    };
    return list;
  }

}
