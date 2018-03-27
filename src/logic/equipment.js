
export class Equipment {
  constructor(equipment) {
    for (let prop in equipment) {
      this[prop] = equipment[prop];
    };
    this.toJSON = () => {
      const cloneEquipment = { ...this };
      delete cloneEquipment.parentObject;
      return cloneEquipment;
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
    if (!this.antiAir) return 0;
    const type = this.type;
    let [coefA, coefB] = [0, 0];
    if (type === 21) {
      coefA = 3;
      coefB = this.antiAir <= 7 ? 2 : 3;
    } else if (type === 36 || this.types[3] === 16) {
      coefA = 2;
      coefB = this.antiAir <= 7 ? 1 : 1.5;
    } else if ([12,13,93].includes(type)) {
      coefA = 1.5;
    }
    return 2 * (coefA * this.antiAir + coefB * Math.sqrt(this.improvement));
  }

  get fleetAABonus() {
    if (!this.antiAir || this.antiAir < 1) return 0;
    const type = this.type;
    let [coefA, coefB] = [0, 0];
    if (type === 36 || this.types[3] === 16) {
      coefA = 0.35;
      coefB = this.antiAir <= 7 ? 2 : 3;
    } else if (type === 18) {
      coefA = 0.6;
    } else if ([12,13,93].includes(type)) {
      coefA = 0.4;
      if (this.antiAir > 1) coefB = 1.5;
    } else if (this.name === '46cm三連装砲') {
      coefA = 0.25;
    } else {
      coefA = 0.2;
    }
    return coefA * this.antiAir + coefB * Math.sqrt(this.improvement);
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
    let antiAir = this.antiAir ? this.antiAir : 0;
    antiAir += improvementCoef * this.improvement;
    return Math.floor(antiAir * Math.sqrt(val) + bonus + Math.sqrt(proficiency / 10));
  }

  getLandBaseSortieFighterPower = val => {
    if (!val) return 0;
    let { antiAir, interception, proficiency } = this;
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
    antiAir = antiAir ? antiAir : 0;
    antiAir += interception ? interception * 1.5 : 0;
    antiAir += improvementCoef * this.improvement;
    return Math.floor(antiAir * Math.sqrt(val) + bonus + Math.sqrt(proficiency / 10));
  }

  getLandBaseDefenseFighterPower = val => {
    if (!val) return 0;
    let { antiAir, interception, antiBomber, proficiency } = this;
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
    antiAir = antiAir ? antiAir : 0;
    antiAir += interception ? interception : 0;
    antiAir += antiBomber ? antiBomber * 2 : 0;
    antiAir += improvementCoef * this.improvement;
    return Math.floor(antiAir * Math.sqrt(val) + bonus + Math.sqrt(proficiency / 10));
  }

  get improvementShellingMod() {
    if (this.improvement <= 0) return 0;
    let sqrtImp = Math.sqrt(this.improvement);
    if (this.firepower > 12) {
      return 1.5 * sqrtImp;
    }
    const { type } = this;
    if ([14,15,40].includes(type)) return 0.75 * sqrtImp;
    if (type >= 5 && type <= 17 || [22,27,28].includes(type)) return 0;
    return sqrtImp;
  }

}

export const getInnerProficiencyByLevel = (level) => {
  switch (level) {
    case 0: return 0;
    case 1: return 10;
    case 2: return 25;
    case 3: return 40;
    case 4: return 55;
    case 5: return 70;
    case 6: return 85;
    case 7: return 100;
  }
  return 0;
}

export const getProficiencyLevelByInner = (inner) => {
  if (typeof inner !== "number") return 0;
  if (inner >= 100) return 7;
  if (inner >= 85) return 6;
  if (inner >= 70) return 5;
  if (inner >= 55) return 4;
  if (inner >= 40) return 3;
  if (inner >= 25) return 2;
  if (inner >= 10) return 1;
  return 0;
}
