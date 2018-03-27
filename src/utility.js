export const Utility = {};
Utility.ucfirst =  str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
Utility.snakeToCamel = str => {
  return str.replace(/_./g, s => s.charAt(1).toUpperCase());
};
Utility.camelToSnake = str => {
  return str.replace(/([A-Z])/g, s => '_' + s.charAt(0).toLowerCase());
};
Utility.camelToHyphen = str => {
  return str.replace(/([A-Z])/g, s => '-' + s.charAt(0).toLowerCase());
};
Utility.getStatIconSrc = statName => {
  statName = statName.replace(/([A-Z])/g, s => '-' + s.charAt(0).toLowerCase());
  return require(`./images/icons/${statName}.png`);
};
Utility.getParams = () => {
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
