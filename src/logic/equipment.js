import { equipments_data } from '../data/equipments-data';

export class Equipment {
  constructor(equipment) {
    for (let prop in equipment) {
      this[prop] = equipment[prop];
    };
  }

  get slot() {
    if (!this.key) return 0;
    return this.slots[this.key - 1];
  }
  set slot(val) {
    if (!this.key) return false;
    this.slots[this.key - 1] = val;
  }

  get weightAA() {
    if (!this.aa) return 0;
    const type = this.type;
    let [coefA, coefB] = [0, 0];
    if (type === 21) {
      coefA = 3;
      coefB = this.aa <= 7 ? 2 : 3;
    } else if (type === 36 || this.types[3] === 16) {
      coefA = 2;
      coefB = this.aa <= 7 ? 1 : 1.5;
    } else if ([12,13,93].includes(type)) {
      coefA = 1.5;
    }
    return 2 * (coefA * this.aa + coefB * Math.sqrt(this.improvement));
  }

  get fleetAABonus() {
    if (!this.aa || this.aa < 1) return 0;
    const type = this.type;
    let [coefA, coefB] = [0, 0];
    if (type === 36 || this.types[3] === 16) {
      coefA = 0.35;
      coefB = this.aa <= 7 ? 2 : 3;
    } else if (type === 18) {
      coefA = 0.6;
    } else if ([12,13,93].includes(type)) {
      coefA = 0.4;
      if (this.aa > 1) coefB = 1.5;
    } else if (this.name === '46cm三連装砲') {
      coefA = 0.25;
    } else {
      coefA = 0.2;
    }
    return coefA * this.aa + coefB * Math.sqrt(this.improvement);
  }

  getFighterPower = val => {
    if (!val) return 0;
    const { proficiency } = this;
    let [bonus, improvementCoef] = [0, 0];
    switch (this.type) {
      case 6:
      case 45:
      case 56:
        improvementCoef = 0.2;
        bonus = proficiency >= 100 ? 22
        : proficiency >= 70 ? 14
        : proficiency >= 55 ? 9
        : proficiency >= 40 ? 5
        : proficiency >= 25 ? 2 : 0;
        break;
      case 11:
        bonus = proficiency >= 100 ? 6
        : proficiency >= 70 ? 3
        : proficiency >= 25 ? 1 : 0;
        break;
      case 7:
      case 57:
        improvementCoef = 0.25;
        break;
      case 8:
      case 58:
        break;
      default: return 0;
    };
    let aa = this.aa ? this.aa : 0;
    aa += improvementCoef * this.improvement;
    return Math.floor(aa * Math.sqrt(val) + bonus + Math.sqrt(proficiency / 10));
  }

  getLandBaseSortieFighterPower = val => {
    if (!val) return 0;
    let { aa, interception, proficiency } = this;
    let [bonus, improvementCoef] = [0, 0];
    switch (this.type) {
      case 6:
      case 45:
      case 48:
      case 56:
        improvementCoef = 0.2;
        bonus = proficiency >= 100 ? 22
        : proficiency >= 70 ? 14
        : proficiency >= 55 ? 9
        : proficiency >= 40 ? 5
        : proficiency >= 25 ? 2 : 0;
        break;
      case 11:
        bonus = proficiency >= 100 ? 6
        : proficiency >= 70 ? 3
        : proficiency >= 25 ? 1 : 0;
        break;
      case 7:
      case 57:
        improvementCoef = 0.25;
        break;
      case 8:
      case 9:
      case 10:
      case 41:
      case 47:
      case 58:
      case 59:
      case 94:
        break;
      default: return 0;
    };
    aa = aa ? aa : 0;
    aa += interception ? interception * 1.5 : 0;
    aa += improvementCoef * this.improvement;
    return Math.floor(aa * Math.sqrt(val) + bonus + Math.sqrt(proficiency / 10));
  }

  getLandBaseDefenseFighterPower = val => {
    if (!val) return 0;
    let { aa, interception, antiBomber, proficiency } = this;
    let [bonus, improvementCoef] = [0, 0];
    switch (this.type) {
      case 6:
      case 45:
      case 48:
      case 56:
        improvementCoef = 0.2;
        bonus = proficiency >= 100 ? 22
        : proficiency >= 70 ? 14
        : proficiency >= 55 ? 9
        : proficiency >= 40 ? 5
        : proficiency >= 25 ? 2 : 0;
        break;
      case 11:
        bonus = proficiency >= 100 ? 6
        : proficiency >= 70 ? 3
        : proficiency >= 25 ? 1 : 0;
        break;
      case 7:
      case 57:
        improvementCoef = 0.25;
        break;
      case 8:
      case 9:
      case 10:
      case 41:
      case 47:
      case 58:
      case 59:
      case 94:
        break;
      default: return 0;
    };
    aa = aa ? aa : 0;
    aa += interception ? interception : 0;
    aa += antiBomber ? antiBomber * 2 : 0;
    aa += improvementCoef * this.improvement;
    return Math.floor(aa * Math.sqrt(val) + bonus + Math.sqrt(proficiency / 10));
  }

}
