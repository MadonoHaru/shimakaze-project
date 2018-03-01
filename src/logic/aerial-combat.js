import { Build } from "./build";
import { Squadron } from './squadron';

export const simulateAerialCombat = (buildData, enemyBuildData, options) => {
  const { formation, enemyFormation } = options;
  const fleetAA = buildData.getFleetAA(formation);
  const enemyFleetAA = enemyBuildData.getFleetAA(enemyFormation);
  const data = {};

  for (let num = options.num;num--;) {
    data[num] = {airState: {}};
    const build = new Build(buildData);
    build.isEnemy = false;
    const enemyBuild = new Build(enemyBuildData);
    enemyBuild.isEnemy = true;

    for (let key = 1;key <= 3;key++) {
      const sortieNum = options.sortieList[key];
      if (sortieNum <= 0) continue;
      let squadron = new Squadron(build.landBase.squadrons[key]);
      if (!squadron.hasEquipment) continue;
      data[num].airState[key + '-1'] = aerialCombat(build, enemyBuild, fleetAA, enemyFleetAA, squadron);
      if (sortieNum > 1) {
        squadron = new Squadron(build.landBase.squadrons[key]);
        data[num].airState[key + '-2'] = aerialCombat(build, enemyBuild, fleetAA, enemyFleetAA, squadron);
      };
      build.landBase.squadrons[key] = squadron;
    };

    data[num].airState['main'] = aerialCombat(build, enemyBuild, fleetAA, enemyFleetAA);

  };

  const resultData = {};
  resultData.sortieList = options.sortieList.concat();
  for (let prop of ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', 'main']) {
    resultData[prop] = {'1': 0, '3': 0, '5': 0, '7': 0, '10': 0};
    for (let index in data) {
      const { airState } = data[index];
      if (airState[prop]) resultData[prop][airState[prop]]++;
    };
  };
  resultData.num = options.num;
  return resultData;
};

export const aerialCombat = (build, enemyBuild, fleetAA, enemyFleetAA, squadron) => {
  const airState = stage1(build, enemyBuild, squadron);
  //stage2(build, enemyBuild, fleetAA, enemyFleetAA, squadron);
  return airState;
};

export const stage1 = (build, enemyBuild, squadron) => {
  const { fleets } = build;
  const { fleets: enemyFleets } = enemyBuild;
  const isCombinedFleetCombat = build.isCombinedFleet && enemyBuild.isCombinedFleet;
  let [fighterPower, enemyFighterPower] = [0, 0];

  if (squadron !== undefined) {
    enemyFighterPower = enemyFleets[1].landBaseCombatFighterPower;
    fighterPower = squadron.sortieFighterPower;
    if (isCombinedFleetCombat) {
      enemyFighterPower += enemyFleets[2].landBaseCombatFighterPower;
    };
  } else {
    fighterPower = fleets[1].fighterPower;
    enemyFighterPower = enemyFleets[1].fighterPower;
    if (isCombinedFleetCombat) {
      fighterPower += fleets[2].fighterPower;
      enemyFighterPower += enemyFleets[2].fighterPower;
    };
  };

  let airStateNum = 1;
  if (enemyFighterPower > 0) {
    const fpRatio = fighterPower / enemyFighterPower;
    if (fpRatio >= 3) airStateNum = 1;
    else if (fpRatio >= 1.5) airStateNum = 3;
    else if (fpRatio >= 2 / 3) airStateNum = 5;
    else if (fpRatio >= 1 / 3) airStateNum = 7;
    else airStateNum = 10;
  };

  if (squadron !== undefined) {
    enemyFleets[1].shotDownByStage1(airStateNum, true);
    squadron.shotDownByStage1(airStateNum);
    if (isCombinedFleetCombat) {
      enemyFleets[2].shotDownByStage1(airStateNum, true);
    };
  } else {
    fleets[1].shotDownByStage1(airStateNum);
    enemyFleets[1].shotDownByStage1(airStateNum);
    if (isCombinedFleetCombat) {
      fleets[2].shotDownByStage1(airStateNum);
      enemyFleets[2].shotDownByStage1(airStateNum);
    };
  };
  return airStateNum;
};

export const stage2 = (build, enemyBuild, fleetAA, enemyFleetAA, squadron) => {
  const { fleets } = build;
  const { fleets: enemyFleets } = enemyBuild;
  const isCombinedFleetCombat = build.isCombinedFleet && enemyBuild.isCombinedFleet;
  const [shipList, enemyShipList] = [[], []];
  const [aircraftList, enemyAircraftList] = [[], []];

  for (let ship of fleets[1].ships) {
    if(!ship.hp) continue;
    shipList.push(ship);
  };
  for (let ship of enemyFleets[1].ships) {
    if(!ship.hp) continue;
    enemyShipList.push(ship);
  };
  if (isCombinedFleetCombat) {
    for (let ship of fleets[2].ships) {
      if(!ship.hp) continue;
      shipList.push(ship);
    };
    for (let ship of enemyFleets[2].ships) {
      if(!ship.hp) continue;
      enemyShipList.push(ship);
    };
  };
  if (shipList.length <= 0 || enemyShipList.length <= 0) return false;

  if (squadron !== undefined) {
    aircraftList.push(...squadron.aircraftListOfStage2);
  } else {
    aircraftList.push(...fleets[1].aircraftListOfStage2);
    enemyAircraftList.push(...enemyFleets[1].aircraftListOfStage2);
    if (isCombinedFleetCombat) {
      aircraftList.push(...fleets[2].aircraftListOfStage2);
      enemyAircraftList.push(...enemyFleets[2].aircraftListOfStage2);
    };
    for (let aircraft of enemyAircraftList) {
      const rondomKey = Math.floor(Math.random() * shipList.length);
      const ship = shipList[rondomKey];
      ship.shotDownOfStage2(aircraft, fleetAA);
    };
  };

  for (let aircraft of aircraftList) {
    const rondomKey = Math.floor(Math.random() * enemyShipList.length);
    const enemyShip = enemyShipList[rondomKey];
    enemyShip.shotDownOfStage2(aircraft, enemyFleetAA);
  }
};
