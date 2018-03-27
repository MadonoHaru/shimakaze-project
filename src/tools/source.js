export const getApi = url => {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", url, false);
  xmlHttp.send();
  let str = xmlHttp.responseText;
  str = str.replace(/(\\u)([0-9a-fA-F]{4})/g,str => {
    str = str.replace('\\u', '');
    return String.fromCharCode(parseInt(str, 16));
  });
  return str;
};

export const getEventMapDataByWikia = str => {
  const div = document.createElement('div');
  div.innerHTML = str;
  document.body.appendChild(div);
  const wikiaElement = document.getElementById('WikiaMainContent');
  document.body.removeChild(div);
  const areas = [];
  let area;
  for (let element of wikiaElement.getElementsByClassName('scrollable')) {
    for (let child of element.children) {
      if (child.tagName === 'DIV') {
        area = { name: child.id };
        continue;
      };
      for (let th of child.getElementsByTagName('th')) {
        if (th.innerHTML.includes('Node')) {
          area.type = th.innerText.replace(/\sNode/, '').replace(/\n/, '');
        } else if (th.innerHTML.includes('Air Raids')) {
          area = { name: 'Air Raids', type: 'Air Raids' };
        };
      };

      area.builds = [];
      for (let tr of child.getElementsByTagName('tr')) {
        if (!tr.getElementsByTagName('img').length) continue;
        const build = { formations: [], fleet1: [] };
        for (let explain of tr.getElementsByClassName('explain')) {
          build.formations.push([explain.innerText.replace(/\n/g, ' '), explain.title]);
        };
        if (!build.formations[0]) {
          let td = tr.children[0];
          if (td.innerText.length < 5) td = tr.children[1];
          build.formations.push([td.innerText.replace(/\n/g, ' '), td.title]);
        };
        for (let img of tr.getElementsByTagName('img')) {
          if (!img.alt.includes('Battle')) continue;
          let shipId = /(\d+)/.exec(img.alt);
          if (!shipId) continue;
          shipId = parseInt(shipId[0], 10);
          if (shipId < 1000) shipId += 1000;
          if (build.fleet1.length < 6) {
            build.fleet1.push(shipId);
          } else {
            if (!build.fleet2) build.fleet2 = [];
            build.fleet2.push(shipId);
          };
        };
        area.builds.push(build);
      };
      areas.push(area);
    };
  };
  return areas;
};

export const getMapDataByKcwiki = str => {
  const kcwikiElement = document.createElement('div');
  kcwikiElement.innerHTML = str;
  const maps = [];
  let map;
  for (let td of kcwikiElement.getElementsByTagName('td')) {
    console.log(td.className);
  };
};
