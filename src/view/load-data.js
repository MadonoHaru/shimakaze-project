import { Build } from '../logic/build';
import { ships_data } from '../data/ships-data';

const saveUserData = (obj) => { localStorage.userData = JSON.stringify(obj) };
const handler = {
    get: (target, prop, receiver) => {
      const getData = Reflect.get(target, prop, receiver);
      setTimeout(() => {saveUserData(target)}, 0);
      return getData;
    },
    set: (target, prop, value, receiver) => {
      const bool = Reflect.set(target, prop, value, receiver);
      saveUserData(target);
      return bool;
    },
    deleteProperty: (target, prop) => {
      const bool = Reflect.deleteProperty(target, prop);
      saveUserData(target);
      return bool;
    }
};

if ( !("userData" in localStorage) ) localStorage.userData= "{}";
export const user = new Proxy(JSON.parse(localStorage.userData), handler);
if (user.builds) for (let key in user.builds) {
  if (key == 0) continue;
  user.builds[key] = new Build(user.builds[key]);
};

user.getDataByKey = function(key0, key1, key2, key3) {
  if (!key0) return false;
  const props = ['builds','fleets','ships','equipments'];
  const keys = [key0,key1,key2,key3];
  let obj = this;
  for (let i = 0;i <= 3;i++) {
    let [prop, key] = [props[i], keys[i]];
    if (key === undefined) return obj;
    if (key1 === 'landBase') {
      if (i === 1) {
        obj = obj.landBase;
        continue;
      }
      if (i === 2) prop = 'squadrons'
    }
    if (prop in obj) obj = obj[prop];
    if (key in obj) obj = obj[key];
    else return false;
  };
  return obj;
};

export const getParams = () => {
  const params = {};
  const arr = window.location.search.substring(1).split('&');
  const inter = [];
  for (let val of arr) {
    const kv = val.split('=');
    params[kv[0]] = kv[1];
    inter.push(kv[1]);
  };
  return params;
}

export const getShipImage = id => {
  try {
    return require(`../images/ships/${id}.png`);
  } catch (e) {
    const name = ships_data[id].name;
    for (let dataId in ships_data) {
      if (name !== ships_data[dataId].name) continue;
      try {
        return require(`../images/ships/${dataId}.png`);
      } catch (e) {
        continue;
      };
    };
  };
};
