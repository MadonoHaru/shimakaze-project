import { Fleet } from './fleet';
import { Squadron } from './squadron';
import { CreateNewShip } from './ship';
import { getInnerProficiencyByLevel, getProficiencyLevelByInner } from './equipment';
import { ships_data } from '../data/ships-data';
import { equipments_data } from '../data/equipments-data';
import { map_data } from '../data/map-data';

export class Build {
  constructor(build) {
    build = JSON.parse(JSON.stringify(build));
    for (let prop in build) {
      this[prop] = build[prop];
    };
    if (this.fleets) {
      this.fleets = this.fleets.map((fleet, index) => {
        fleet = new Fleet(fleet);
        fleet.key = index;
        fleet.parentObject = this;
        return fleet;
      });
    } else {
      this.fleets = [];
    };
    const { landBase } = this;
    landBase.squadrons = landBase.squadrons.map(squadron => new Squadron(squadron));

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

  get deckBuilderData() {
    const deckBuilderData = {version: 4};
    this.fleets.forEach((fleet, fleetNum) => {
      if (!fleet) return false;
      const deckBuilderFleet = {};
      fleet.ships.forEach((ship, shipNum) => {
        if (!ship || !ship.id) return false;
        const deckBuilderShip = {items: {}};
        deckBuilderShip.id = ship.id;
        deckBuilderShip.lv = ship.level;
        deckBuilderShip.luck = ship.luck;
        ship.equipments.forEach((equipment, equipmentNum) => {
          const { id, improvement, proficiency } = equipment;
          if (!id) return false;
          const item = {id: id};
          item.rf = improvement;
          if (proficiency > 0) item.mas = getProficiencyLevelByInner(proficiency);
          if (equipmentNum === 0) {
            deckBuilderShip.items['ix'] = item;
          } else {
            deckBuilderShip.items['i' + equipmentNum] = item;
          };
        });
        deckBuilderFleet['s' + shipNum] = deckBuilderShip;
      });
      deckBuilderData['f' + fleetNum] = deckBuilderFleet;
    });
    return JSON.stringify(deckBuilderData).replace('\'','\"');
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

export class CreateBuildByDeckBuilderData {
  constructor(deckBuilderData) {
    const newBuild = new CreateNewBuild('DeckBuilder');
    const buildData = JSON.parse(deckBuilderData);
    for (let prop in buildData) {
      if (!/f\d/.test(prop)) continue;
      const fleetNum = prop.replace(/[^0-9^\.]/g,"");
      const fleet = buildData[prop];
      for (let prop in fleet) {
        if (!/s\d/.test(prop)) continue;
        const shipNum = prop.replace(/[^0-9^\.]/g,"");
        const ship = fleet[prop];
        const newShip = new CreateNewShip(ships_data[ship.id]);
        if (ship.lv > 0) newShip.level = ship.lv;
        if (ship.luck > 0) newShip.luck = ship.luck;
        for (let prop in ship.items) {
          if (!/i\d/.test(prop) && prop !== 'ix') continue;
          let itemNum = 0;
          if (prop !== 'ix') itemNum = prop.replace(/[^0-9^\.]/g,"");
          const item = ship.items[prop];
          newShip.setEquipment(itemNum, equipments_data[item.id]);
          const { rf, mas } = item;
          if (rf) {
            newShip.equipments[itemNum].improvement = parseInt(rf, 10);
          };
          if (mas) {
            const proficiency = getInnerProficiencyByLevel(parseInt(mas, 10));
            newShip.equipments[itemNum].proficiency = proficiency;
          };
        };
        newBuild.fleets[fleetNum].ships[shipNum] = newShip;
      };
    };
    return newBuild;
  }
}
