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

export const csvToJson = csv => {
  const jsonArray = [];
  const csvArray = csv.split('\n').map(str => str.split(','));
  const propNames  = csvArray.shift();
  for (let csvLineArray of csvArray) {
    const jsonData = {};
    csvLineArray.forEach((str, index) => {
      jsonData[propNames[index]] = str;
    });
    jsonArray.push(jsonData);
  };
  return JSON.stringify(jsonArray);
};

export const getEventMapDataByWikia = str => {
  const div = document.createElement('div');
  div.innerHTML = str;
  document.body.appendChild(div);
  const wikiaElement = document.getElementById('WikiaMainContent');
  document.body.removeChild(div);
  const cells = [];
  let cell;
  for (let element of wikiaElement.getElementsByClassName('scrollable')) {
    for (let child of element.children) {
      if (child.tagName === 'DIV') {
        cell = { name: child.id };
        continue;
      };
      for (let th of child.getElementsByTagName('th')) {
        if (th.innerHTML.includes('Node')) {
          cell.type = th.innerText.replace(/\sNode/, '').replace(/\n/, '');
        } else if (th.innerHTML.includes('Air Raids')) {
          cell = { name: 'Air Raids', type: 'Air Raids' };
        };
      };

      cell.fleets = [];
      for (let tr of child.getElementsByTagName('tr')) {
        if (!tr.getElementsByTagName('img').length) continue;
        const fleet = { formations: [], ships: [] };
        for (let explain of tr.getElementsByClassName('explain')) {
          fleet.formations.push([explain.innerText.replace(/\n/g, ' '), explain.title]);
        };
        if (!fleet.formations[0]) {
          let td = tr.children[0];
          if (td.innerText.length < 5) td = tr.children[1];
          fleet.formations.push([td.innerText.replace(/\n/g, ' '), td.title]);
        };
        for (let aElem of tr.getElementsByTagName('a')) {
          if (!aElem.children[0].alt.includes('Battle')) continue;
          let shipId = /\d+(?=[)])/.exec(aElem.title);
          console.log(shipId);
          if (!shipId) continue;
          shipId = parseInt(shipId[0], 10);
          if (shipId < 1000) shipId += 1000;
          if (fleet.ships.length < 6) {
            fleet.ships.push(shipId);
          } else {
            if (!fleet.escortShips) fleet.escortShips = [];
            fleet.escortShips.push(shipId);
          };
        };
        cell.fleets.push(fleet);
      };
      cells.push(cell);
    };
  };
  return JSON.stringify(cells);
};

const getEventKindByType = type => {
  switch (type) {
    case 'Normal Battle':
    case 'Boss Battle': return 1;
    case 'Air Defense': return 6;
  }
  return type;
};

const getFormationIdByName = name => {
  switch (name) {
    case 'Line Ahead': return 1;
    case 'Double Line': return 3;
    case 'Diamond': return 3;
    case 'Echelon': return 4;
    case 'Line Abreast': return 5;
    case 'Vanguard': return 6;
  }
  if (name.includes('Cruising Formation ')) {
    return parseInt(name.replace('Cruising Formation ', ''), 10) + 10;
  };
  return name;
};

const getEventMapRankIdByName = name => {
  if (name.includes('Casual')) return 1;
  if (name.includes('Easy')) return 2;
  if (name.includes('Medium')) return 3;
  if (name.includes('Hard')) return 4;
};

export const getMapDataByJSON = (mapData, areaId, num) => {
  const map = {};
  map.areaId = areaId;
  map.no = num;
  map.id = parseInt(map.areaId + '' + map.no, 10);
  map.cells = [];
  let prevEventMapRank = 5;
  for (let cellData of mapData) {
    const cell = {};
    const cellNameData = /E-(\d)_(\D)_(\D+)/.exec(cellData.name);
    let eventMapRank;
    if (cellNameData) {
      cell.name = cellNameData[2];
      eventMapRank = getEventMapRankIdByName(cellNameData[3]);
      prevEventMapRank = eventMapRank;
    } else {
      cell.name = cellData.name;
      eventMapRank = prevEventMapRank - 1;
    };
    cell.fleets = [];
    if (cellData.type === 'Boss Battle') cell.isBoss = true;
    cell.eventKind = getEventKindByType(cellData.type);
    for (let fleetData of cellData.fleets) {
      for (let formationData of fleetData.formations) {
        const fleet = {};
        fleet.eventMapRank = eventMapRank;
        fleet.formation = getFormationIdByName(formationData[0]);
        fleet.encounterRate = formationData[1];
        fleet.ships = fleetData.ships;
        if (fleetData.escortShips) fleet.escortShips = fleetData.escortShips;
        cell.fleets.push(fleet);
      };
    };
    const sameCell = map.cells.find(otherCell => otherCell.name === cell.name);
    if (sameCell) sameCell.fleets.push(...cell.fleets);
    else map.cells.push(cell);
  };
  return map;
};

export const getMapDataByKcwiki = str => {
  const kcwikiElement = document.createElement('div');
  kcwikiElement.innerHTML = str;
  const cells = [];
  let cell;
  for (let td of kcwikiElement.getElementsByTagName('td')) {
    if (td.getAttribute('style') && td.getAttribute('style').length > 200) {
      if (!td.children.length) continue;
      if (cell) cells.push(cell);
      cell = { cellName: td.children[0].children[0].innerText };
      cell.fleetName = td.nextElementSibling.children[0].children[0].innerText;
      cell.builds = [];
    } else if (td.getAttribute('colspan') == 2) {
      for (let table of td.getElementsByTagName('table')) {
        const build = { fleet1: [] };
        for (let td of table.getElementsByTagName('td')) {
          if (td.className === 'formation_mobile') {
            build.formation = td.innerText;
          } else if (td.className === 'enemy_mobile') {
            for (let img of td.getElementsByTagName('img')) {
              let src = img.getAttribute('src');
              if (!src || !src.includes('Banner')) continue;
              const shipId = parseInt(/\d+(?=Banner)/.exec(src)[0], 10);
              if (build.fleet1.length < 6) {
                build.fleet1.push(shipId);
              } else {
                if (!build.fleet2) build.fleet2 = [];
                build.fleet2.push(shipId);
              };
            };
          };
        };
        cell.builds.push(build);
      };
    };
  };
  cells.push(cell);
  return JSON.stringify(cells).replace(/\\n/g, ' ');
};
