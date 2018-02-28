import { Fleet } from './fleet';
import { Squadron } from './squadron';
import { ships_data } from '../data/ships-data';
import { map_data } from '../data/map-data';

export class Build {
  constructor(build) {
    build = JSON.parse(JSON.stringify(build));
    for (let prop in build) {
      this[prop] = build[prop];
    };
    for (let index in this.fleets) {
      this.fleets[index] = new Fleet(this.fleets[index]);
      this.fleets[index].key = index;
    };
    const { squadrons } = this.landBase;
    for (let index in squadrons ) {
      squadrons[index] = new Squadron(squadrons[index]);
    };

    const handler = {
      set: (target, prop, value, receiver) => {
        const bool = Reflect.set(target, prop, value, receiver);
        if (prop === 'isEnemy') {
          for (let fleet of target.fleets) {
            if (!fleet.ships) continue;
            fleet.isEnemy = value;
            for (let ship of fleet.ships) {
              ship.isEnemy = value;
            };
          };
        } else if (prop === 'isCombinedFleet') {
          target.fleets[1].isCombinedFleet = value;
          target.fleets[2].isCombinedFleet = value;
          for (let ship of target.fleets[1].ships) {
            ship.isCombinedFleet = value;
          };
          for (let ship of target.fleets[2].ships) {
            ship.isCombinedFleet = value;
          };
        };
        return bool;
      },
    };

    return new Proxy(this, handler);

  }
  getFleetAA = formation => {
    let value = 0;
    if (this.isCombinedFleet) {
      for (let ship of this.fleets[1].ships) {
        if (!('id' in ship)) continue;
        value += ship.fleetAABonus;
      };
      for (let ship of this.fleets[2].ships) {
        if (!('id' in ship)) continue;
        value += ship.fleetAABonus;
      };
    } else {
      for (let ship of this.fleets[1].ships) {
        if (!('id' in ship)) continue;
        value += ship.fleetAABonus;
      };
    };
    let formationCoef = 1;
    switch (formation) {
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
}

export class CreateNewBuild {
  constructor(key) {
    this.name = 'new' + key;
    this.fleets = [0];
    for (let fKey = 1;fKey <= 4;fKey++) {
      const ships = [0];
      for (let sKey = 1;sKey <= 6;sKey++) ships.push({});
      const fleet = { ships: ships };
      this.fleets.push({ships: ships});
    }
    this.landBase = { squadrons: [] }
    for (let key = 0;key <= 3;key++) {
      this.landBase.squadrons.push({equipments: [{},{},{},{},{}], slots: [18,18,18,18] , slotsMax: [18,18,18,18]});
    };
    return new Build(this);
  }
}

export class CreateBuildByBuildData {
  constructor(buildData) {
    const { fleet1, fleet2 } = buildData;
    const build = new CreateNewBuild();
    for (let shipKey in fleet1) {
      const shipData = ships_data[fleet1[shipKey]];
      build.fleets[1].setShip(1 + parseInt(shipKey, 10), shipData);
    };
    if (fleet2) {
      build.isCombinedFleet = true;
      for (let shipKey in fleet2) {
        const shipData = ships_data[fleet2[shipKey]];
        build.fleets[2].setShip(1 + parseInt(shipKey, 10), shipData);
      };
    };
    return build;
  }
}
