import { Utility } from '../utility';
import { ships_data } from '../data/ships-data';
import { equipments_data } from '../data/equipments-data';
import { Equipment } from './equipment';

export class Ship {
  constructor(ship) {
    for (let prop in ship) {
      const value = ship[prop];
      if (prop === 'aa' || prop === 'aaBase') prop = prop.replace('aa', 'antiAir');
      if (prop.includes('Max')) {
        prop = 'max' + Utility.ucfirst(prop.replace('Max', ''));
      } else if (prop.includes('Base')) {
        prop = 'base' + Utility.ucfirst(prop.replace('Base', ''));
      };
      this[prop] = value;
    };
    if (this.equipments) {
      this.equipments = this.equipments.map((equipment, index) => {
        equipment = new Equipment(equipment);
        equipment.slots = this.slots;
        equipment.key = index;
        equipment.parentObject = this;
        return equipment;
      });
    } else {
      this.equipments = [];
    };
    const getStateByLevel = (state, id, level) => {
      const getHpRiseValue = base => {
        if (base >= 91) return 9;
        if (base >= 70) return 8;
        if (base >= 50) return 7;
        if (base >= 40) return 6;
        if (base >= 30) return 5;
        if (base >= 8) return 4;
        return 3;
      };
      const shipData = ships_data[id];
      if (state === 'hp') {
        let { hp, hp_max } = shipData;
        if (level >= 100) hp = hp + getHpRiseValue(hp);
        if (hp_max && hp > hp_max) hp = hp_max;
        return hp;
      } else {
        const maxState = shipData[state + '_max'];
        const initialState = shipData[state + '_initial'];
        return Math.floor((maxState - initialState) * level / 99 + initialState);
      };
    };
    const handler = {
      set: (target, prop, value, receiver) => {
        const bool = Reflect.set(target, prop, value, receiver);
        if (prop === 'level') {
          const { id, level } = target;
          target.hp = getStateByLevel('hp', id, level);
          target.maxHp = getStateByLevel('hp', id, level);
          for (let statName of ['evasion','asw','los']) {
            const nextState = getStateByLevel(statName, id, level);
            const equipmentsState = target.getEquipmentsStat(statName);
            target['base' + Utility.ucfirst(statName)] = nextState;
            target[statName] = nextState + equipmentsState;
          };
        };
        return bool;
      },
    };

    return new Proxy(this, handler);
  }

  toJSON = () => {
    const cloneShip = { ...this };
    delete cloneShip.parentObject;
    return cloneShip;
  };

  getEquipmentsStat = statName => {
    let statVal = 0;
    for (let equipment of this.equipments) {
      if (statName in equipment) statVal += equipment[statName];
    };
    return statVal;
  }

  setRange = () => {
    this.range = this.baseRange;
    for (let equipment of this.equipments) {
      if ('range' in equipment) {
        if (this.range < equipment.range) this.range = equipment.range;
      };
    };
  }

  setEquipment = (key, equipment) => {
    const { equipments } = this;
    equipments[key] = new Equipment(JSON.parse(JSON.stringify(equipment)));
    equipments[key].improvement = 0;
    equipments[key].proficiency = equipment.id < 500 ? 100 : 0;
    equipments[key].slots = this.slots;
    equipments[key].key = key;
    for (let state in equipment) {
      if (['firepower','torpedo','antiAir','armor','evasion','asw','los'].includes(state)) {
        if (isNaN(this[state])) continue;
        this[state] += equipment[state];
      };
    };
    this.setRange();
  }

  removeEquipment = key => {
    const equipment = this.equipments[key];
    for (let state in equipment) {
      if (['firepower','torpedo','antiAir','armor','evasion','asw','los'].includes(state)) {
        if (isNaN(this[state])) continue;
        this[state] -= equipment[state];
      };
    };
    this.equipments[key] = {};
    this.setRange();
  }
  get weightAA() {
    let [value, num] = [0, 1];
    for (let equipment of this.equipments) {
      if (!('name' in equipment)) continue;
      value += equipment.weightAA;
      num = 2;
    };
    if (this.isEnemy) value += Math.floor(Math.sqrt(this.antiAir) * 2);
    else value = Math.floor((this.baseAntiAir + value) / num) * num;
    return Math.floor(value);
  }
  get fleetAABonus() {
    let value = 0;
    for (let equipment of this.equipments) {
      if (!('name' in equipment)) continue;
      value += equipment.fleetAABonus;
    };
    return Math.floor(value);
  }
  get fighterPower() {
    if (this.hp < 0) return false;
    let val = 0;
    for (let index in this.equipments) {
      if (index === 0 || !this.equipments[index].id ) continue;
      val += this.equipments[index].getFighterPower(this.slots[index - 1]);
    };
    return val;
  }

  get landBaseCombatFighterPower() {
    if (this.hp < 0) return false;
    let val = 0;
    for (let index in this.equipments) {
      if (index === 0 || !this.equipments[index].id ) continue;
      val += this.equipments[index].getLandBaseSortieFighterPower(this.slots[index - 1]);
    };
    return val;
  }


  shotDownByStage1 = (airStateNum, isLandBaseCombat) => {
    if (this.hp < 0) return false;
    const { slots, equipments } = this;
    let joinList = [6,7,8,11,45,56,57,58];
    if (isLandBaseCombat) joinList = joinList.concat([9,10,41,47,48,59,94]);
    for (let index in equipments) {
      if (index <= 0) continue;
      if (slots[index - 1] <= 0) continue;
      if (!joinList.includes(equipments[index].type)) continue;
      let [maxNum, randomNum, shotDownNum] = [ 0, 0, 0 ];
      if (this.isEnemy) {
        maxNum = 11 - airStateNum;
        randomNum = 0.35 * Math.floor(Math.random() * (maxNum + 1));
        randomNum += 0.65 * Math.floor(Math.random() * (maxNum + 1));
        randomNum = randomNum / 10;
      } else {
        const minNum = airStateNum / 4;
        randomNum = Math.floor(Math.sqrt(airStateNum / 3 * 100));
        randomNum = Math.floor(Math.random() * (randomNum + 1)) / 100 + minNum;
        randomNum = randomNum / 10;
        /*256分割wiki式
        maxNum = airStateNum * 15;
        let minNum = 0;
        if (airStateNum <= 1) minNum = 7;
        else if (airStateNum <= 3) minNum = 20;
        else if (airStateNum <= 5) minNum = 30;
        else if (airStateNum <= 7) minNum = 45;
        else minNum = 65;
        randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        randomNum = randomNum / 256;
        */
      };
      shotDownNum = Math.floor(slots[index - 1] * randomNum);
      slots[index - 1] -= shotDownNum;
      if (slots[index - 1] < 0) slots[index - 1] = 0;
    };
  }

  shotDownOfStage2 = (targetEquipment, fleetAA) => {
    let shotDownNum = 0;
    let combinedFleetCoef = 1;
    if (this.isCombinedFleet) {
      if (this.position === 1) {
        combinedFleetCoef = this.isEnemy ? 0.8 : 0.72;
      } else {
        combinedFleetCoef = 0.48;
      };
    };
    const campCoef = this.isEnemy ? 0.75 : 0.8;
    const aerialConst = 0.25 / 2;

    if (Math.random() > 0.5) {
      let proportional = this.weightAA * combinedFleetCoef / 400;
      shotDownNum += Math.floor(proportional * targetEquipment.slot);
    };
    if (Math.random() > 0.5) {
      let fixedShotDown = (this.weightAA + fleetAA) * combinedFleetCoef;
      fixedShotDown = fixedShotDown * campCoef * 0.25 / 2;
      shotDownNum += Math.floor(fixedShotDown);
    };
    if (!this.isEnemy) shotDownNum++;
    targetEquipment.slot -= shotDownNum;
    if (targetEquipment.slot <= 0) targetEquipment.slot = 0;
  }

}

export class CreateNewShip {
  constructor(shipData) {
    shipData = JSON.parse(JSON.stringify(shipData));
    for (let statName in shipData) {
      let value = shipData[statName];
      if (value === -1) value = '？'
      switch (statName) {
        case 'id':
        case 'name':
        case 'type':
        case 'luck':
        case 'torpedo_acc': {
          this[statName] = value;
          break;
        }
        case 'hp':
        case 'fuel':
        case 'ammo':
        case 'slots': {
          this['max' + Utility.ucfirst(statName)] = value;
          this[statName] = value;
          break;
        }
        case 'firepower_max':
        case 'armor_max':
        case 'torpedo_max':
        case 'evasion_max':
        case 'antiAir_max':
        case 'asw_max':
        case 'los_max': {
          this[statName.replace('_max', '')] = value;
          this['base' + Utility.ucfirst(statName.replace('_max', ''))] = value;
          break;
        }
        case 'speed':
        case 'range': {
          this[statName] = value;
          this['base' + Utility.ucfirst(statName)] = value;
          break;
        }
      };
    };
    this.equipments = [{}];
    for (let index in this.slots) this.equipments.push({});
    const newShip = new Ship(this);
    newShip.level = shipData.id < 1500 ? 99 : 1;
    if (shipData.id > 1500 && 'equipments' in shipData) {
      for (let index in shipData.equipments) {
        index = parseInt(index, 10);
        const id = shipData.equipments[index];
        if (id <= 0) continue;
        const equipment = JSON.parse(JSON.stringify(equipments_data[id]));
        newShip.setEquipment(index + 1, equipment);
      };
    };
    return newShip;
  }
}
