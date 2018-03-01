import { Equipment } from './equipment';

export class Squadron {
  constructor(squadron) {
    squadron = JSON.parse(JSON.stringify(squadron));
    for (let prop in squadron) {
      this[prop] = squadron[prop];
    };
    for (let index in this.equipments) {
      this.equipments[index] = new Equipment(this.equipments[index]);
      this.equipments[index].slots = this.slots;
      this.equipments[index].key = index;
    };
  }

  setEquipment = (key, equipment) => {
    const { equipments } = this;
    equipments[key] = new Equipment(JSON.parse(JSON.stringify(equipment)));
    equipments[key].improvement = 0;
    equipments[key].proficiency = equipment.id < 500 ? 100 : 0;
    equipments[key].slots = this.slots;
    equipments[key].key = key;
    if ([9,10,41,59,94].includes(this.equipments[key].type) && key > 0) {
      this.slots[key - 1] = 4;
      this.slotsMax[key - 1] = 4;
    }
  }

  removeEquipment = key => {
    this.equipments[key] = {};
    if (key > 0) {
      this.slots[key - 1] = 18;
      this.slotsMax[key - 1] = 18;
    }
  }

  get sortieFighterPower() {
    let val = 0;
    for (let index in this.equipments) {
      if (index === 0 || !this.equipments[index].id ) continue;
      val += this.equipments[index].getLandBaseSortieFighterPower(this.slots[index - 1]);
    };
    return val;
  }

  get defenseFighterPower() {
    let val = 0;
    let recon = 1;
    for (let index in this.equipments) {
      const equipment = this.equipments[index];
      if (index === 0 || !equipment.id ) continue;
      val += equipment.getLandBaseDefenseFighterPower(this.slots[index - 1]);
      const { type, los } = equipment;
      let num = 1;
      if ([10,41].includes(type)) {
        num = los <= 7 ? 1.1
        : los === 8 ? 1.13
        : los >= 9 ? 1.16
        : 1;
      } else if ([9,59,94].includes(type)) {
        num = los <= 7 ? 1.2
        : los >= 9 ? 1.3
        : 1;
      }
      if (num > recon) recon = num;
    };
    return Math.floor(val * recon);
  }

  get defenseShotDownBonus() {
    let [ interceptor, landBaseFighter ] = [ 0, 0 ];
    console.log(this);
    for (let index in this.equipments) {
      if (index <= 0) continue;
      if (this.slots[index - 1] <= 0) continue;
      if (!this.equipments[index].types) continue;
      const iconType = this.equipments[index].types[3];
      if (iconType === 38) interceptor++;
      if (iconType === 44) landBaseFighter++;
    };
    return interceptor * 10 + landBaseFighter * 7;
  }

  get distance() {
    let [ minDistance, maxReconDistance, reconDistanceBonus ] = [ null, 0, 0 ];
    for (let equipment of this.equipments) {
      if (!('distance' in equipment)) continue;
      const { type, distance } = equipment;
      if (minDistance === null || minDistance > distance) {
        minDistance = distance;
      }
      if ([9,10,41,59,94].includes(type)) {
        if (maxReconDistance < distance) maxReconDistance = distance;
      };
    };
    if (minDistance === null) minDistance = 0;
    if (maxReconDistance > 0) {
      reconDistanceBonus = Math.sqrt(maxReconDistance - minDistance);
      if (reconDistanceBonus > 3) reconDistanceBonus = 3;
    };

    return Math.round(minDistance + reconDistanceBonus);
  }

  shotDownByStage1 = (airStateNum) => {
    const { slots, equipments } = this;
    let joinList = [6,7,8,11,45,56,57,58];
    joinList = joinList.concat([9,10,41,47,48,59,94]);
    for (let index in equipments) {
      if (index <= 0) continue;
      if (slots[index - 1] <= 0) continue;
      if (!joinList.includes(equipments[index].type)) continue;

      let [maxNum, randomNum, shotDownNum] = [ 0, 0, 0 ];
      maxNum = airStateNum * 15;
      let minNum = 0;
      if (airStateNum <= 1) minNum = 7;
      else if (airStateNum <= 3) minNum = 20;
      else if (airStateNum <= 5) minNum = 30;
      else if (airStateNum <= 7) minNum = 45;
      else minNum = 65;
      randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      randomNum = randomNum / 256;

      shotDownNum = Math.floor(slots[index - 1] * randomNum);
      slots[index - 1] -= shotDownNum;
      if (slots[index - 1] < 0) slots[index - 1] = 0;
    };
  }

  get aircraftListOfStage2() {
    const list = [];
    for (let equipment of this.equipments) {
      if (![7,8,11,47,57,58].includes(equipment.type)) continue;
      if (equipment.slot <= 0) continue;
      list.push(equipment);
    };
    return list;
  }

  get hasEquipment() {
    let bool = false;
    for (let equipment of this.equipments) {
      if (equipment.id > 0) bool = true;
    }
    return bool;
  }
}
