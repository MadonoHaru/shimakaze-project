import React, { Component } from 'react';
import { Segment, Table, Button, Header, Dropdown, Input, Checkbox, Modal, Progress, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { user } from "./load-data";
import { Build, CreateBuildByBuildData } from "../logic/build";
import { simulateAirState } from "../logic/aerial-combat";
import { map_data } from '../data/map-data';


export class AirStateSimulator extends Component {
  state = {key: Math.random()}
  update = () => this.setState({key: Math.random()})
  render() {
    const style = {
      backgroundColor: "rgba( 255, 255, 255, 0.1 )",
      animation: "show 500ms",
    };
    if (!('airStateSimulator' in user)) {
      user.airStateSimulator = {options: {num: 1000, sortieList: [0, 0, 0, 0]}};
    };
    const { options } = user.airStateSimulator;
    const { update } = this;
    const { build } = this.props;
    const simProps = { options, update, build };
    return (
      <div>
        {
          build ? <FighterPower build={build} />
          : <LoadBuildDropdown { ...simProps } />
        }
        <SelectAreaDropdown { ...simProps } />
        <LandBaseSwitch { ...simProps } />
        <div style={{margin: 5, marginTop: 20}} >
          <NumInput { ...simProps } />
          <ModalProgressOfSimulation { ...simProps } />
        </div>
        <ResultTable />
      </div>
    );
  }
}

const LoadBuildDropdown = props => {
  const { options, update, isEnemy } = props;
  const buildOptions = [];
  for (let buildKey in user.builds) {
    if (buildKey <= 0) continue;
    const build = user.builds[buildKey];
    buildOptions.push({key: buildKey, text: build.name, value: buildKey});
  };
  let [build, isCombinedFleet] = [false, false];
  let visibleBuildKey = false;
  if (isEnemy) visibleBuildKey = options.enemyKey;
  else visibleBuildKey = options.buildKey
  if (visibleBuildKey && user.builds) {
    build = user.builds[visibleBuildKey];
    if (build) isCombinedFleet = build.isCombinedFleet;
  };
  const style = {color: 'white', margin: 10};
  const handleChange = (event, data) => {
    if (isEnemy) options.enemyKey = data.value;
    else options.buildKey = data.value;
    update();
  };
  return (
    <div style={{marginTop: 10}}>
      <div>
        <span style={style} >{isEnemy? '　敵':'味方'}編成</span>
        <Dropdown
          placeholder='編成選択'
          selection
          defaultValue={options.buildKey}
          options={buildOptions}
          onChange={handleChange}
        />
      </div>
      <FighterPower build={build} isEnemy={isEnemy} />
    </div>
  );
};

export const SelectAreaDropdown = props => {
  const { options, update } = props;
  const areaOptions = [];
  for (let worldKey in map_data) {
    if (worldKey  <= 0) continue;
    const world = map_data[worldKey];
    for (let areaKey in world) {
      if (isNaN(+areaKey)) continue;
      let name;
      if (worldKey > 10) name = world.name + 'E' + areaKey;
      else name = world.name + areaKey;
      const keys = JSON.stringify([worldKey, areaKey]);
      areaOptions.push({key: name, text: name, value: keys});
    };
  };
  areaOptions.push({key: 1, text: '作成した編成から', value: 'self'});
  const style = {color: 'white', margin: 10};
  const handleChange = (event, data) => {
    const { value } = data;
    if (value === 'self') options.mapKeys = value;
    else options.mapKeys = JSON.parse(data.value);
    update();
  };
  return (
    <div style={{marginTop: 50, marginBottom: 50 }}>
      <div>
        <span style={style} >海域選択</span>
        <Dropdown
          placeholder='海域選択'
          selection
          defaultValue={JSON.stringify(options.mapKeys)}
          options={areaOptions}
          onChange={handleChange}
        />
        {options.mapKeys === 'self'
          ? <LoadBuildDropdown {...props} isEnemy />
          : <LoadEnemyDropdown {...props} />
        }
      </div>
    </div>
  );
};

export const LoadEnemyDropdown = props => {
  const { options, update } = props;
  const buildOptions = [];
  const { mapKeys } = options;
  if (mapKeys && mapKeys[0] && mapKeys[1]) {
    const map = map_data[mapKeys[0]][mapKeys[1]];
    for (let pointKey in map) {
      if (pointKey.length > 3) continue;
      for (let build of map[pointKey].builds) {
        const name = pointKey + ':' + build.name;
        build = JSON.stringify(build);
        buildOptions.push({key: name, text: name, value: build});
      };
    };
  };
  let [build, isCombinedFleet] = [false, false];
  if (options.enemyBuildData) {
    isCombinedFleet = options.enemyBuildData.isCombinedFleet;
    build = new CreateBuildByBuildData(options.enemyBuildData);
  };
  const handleChange = (event, data) => {
    const enemyBuildData = JSON.parse(data.value);;
    options.enemyFormation = enemyBuildData.formation;
    options.enemyBuildData = enemyBuildData;
    update();
  };
  const style = {color: 'white', margin: 10};
  return (
    <div style={{marginTop: 10}}>
      <div>
        <span style={style} >　敵編成</span>
        <Dropdown
          placeholder='敵編成選択'
          selection
          defaultValue={JSON.stringify(options.enemyBuildData)}
          options={buildOptions}
          onChange={handleChange}
        />
      </div>
      <FighterPower build={build} isEnemy />
    </div>
  );
};

const FighterPower = props => {
  const { build, isEnemy } = props;
  let isCombinedFleet = false;
  let [fighterPower, fighterPower1, fighterPower2] = [0, 0, 0];
  let [landBaseCombatFighterPower, landBaseCombatFighterPower1, landBaseCombatFighterPower2] = [0, 0, 0];
  if (build) {
    isCombinedFleet = build.isCombinedFleet;
    fighterPower1 = build.fleets[1].fighterPower;
    fighterPower2 = build.fleets[2].fighterPower;
    fighterPower = fighterPower1;
    if (isCombinedFleet) fighterPower += fighterPower2;
    landBaseCombatFighterPower1 = build.fleets[1].landBaseCombatFighterPower;
    landBaseCombatFighterPower2 = build.fleets[2].landBaseCombatFighterPower;
    landBaseCombatFighterPower = landBaseCombatFighterPower1;
    if (isCombinedFleet) landBaseCombatFighterPower += landBaseCombatFighterPower2;
  }
  return (
    <div style={{color: 'white', margin: 10}} >
    {'合計制空' + fighterPower}
    {isEnemy ? '　基地戦時' + landBaseCombatFighterPower : null}
      {isCombinedFleet && <span>
        {`　第一制空${fighterPower1}　第二制空${fighterPower2}`}
      </span>}
    </div>
  );
};

const SelectFormationDropdown = props => {
  const { options, isEnemy, isCombinedFleet } = props;
  let formationOptions = [
    {key: '単縦陣', text: '単縦陣', value: '単縦陣'},
    {key: '複縦陣', text: '複縦陣', value: '複縦陣'},
    {key: '輪形陣', text: '輪形陣', value: '輪形陣'},
    {key: '梯形陣', text: '梯形陣', value: '梯形陣'},
    {key: '単横陣', text: '単横陣', value: '単横陣'},
    {key: '警戒陣', text: '警戒陣', value: '警戒陣'},
  ];
  if (isCombinedFleet) {
    formationOptions = [
      {key: '1', text: '第一警戒航行序列', value: '第一警戒航行序列'},
      {key: '2', text: '第二警戒航行序列', value: '第二警戒航行序列'},
      {key: '3', text: '第三警戒航行序列', value: '第三警戒航行序列'},
      {key: '4', text: '第四警戒航行序列', value: '第四警戒航行序列'}
    ];
  };
  let camp, defaultFormation;
  if (isEnemy) {
    camp = '　敵';
    defaultFormation = options.enemyFormation;
  } else {
    camp = '味方';
    defaultFormation = options.formation;
  };
  const handleChange = (event, data) => {
    if (isEnemy) options.enemyFormation = data.value;
    else options.formation = data.value;
  };
  return (
    <span>
      <span style={{color: 'white', margin: 10}}>{camp + '陣形'}</span>
      <Dropdown
        placeholder='陣形選択'
        selection
        defaultValue={defaultFormation}
        options={formationOptions}
        onChange={handleChange}
      />
    </span>
  );
};

const LandBaseSwitch = props => {
  const { options } = props;
  return (
    <div style={{color: 'white'}}>
      <span style={{verticalAlign: 'middle', margin: 10}} >基地航空隊</span>
      {[1,2,3].map(key =>
        <SquadronCheckbox options={options} squadronKey={key} key={key} />
      )}
    </div>
  );
};

const SquadronCheckbox = props => {
  const { options, squadronKey } = props
  const checked1 = options.sortieList[squadronKey] > 0;
  const checked2 = options.sortieList[squadronKey] === 2;
  const handleChange = (event, data) => {
    if (data.checked) options.sortieList[squadronKey]++;
    else options.sortieList[squadronKey]--;
  };
  const style = {verticalAlign: 'middle', margin: 2};
  return (
    <span>
      <span style={style} >第{squadronKey}</span>
      <Checkbox style={style} defaultChecked={checked1} onChange={handleChange} />
      <Checkbox style={style} defaultChecked={checked2} onChange={handleChange} />
    </span>
  );
}

const NumInput = props => {
  const { options } = props;
  const handleChange = (event, data) => {
    options.num = data.value;
  }
  return (
    <span style={{margin: 5}} >
      <span style={{color: 'white', margin: 5}}>試行回数</span>
      <Input
        type='number'
        min='1'
        defaultValue={options.num}
        onChange={handleChange}
      />
    </span>
  );
};

class ModalProgressOfSimulation extends Component {
  state = { percent: 0 };
  num = 0;
  resultData = {};
  resultPlus = (result1, result2) => {
    for (let time in result1) {
      if (time === 'sortieList' || time === 'num') continue;
      for (let state in result1[time]) {
        result1[time][state] += result2[time][state];
      };
    };
  }
  sim = (build, enemyBuild, resultData) => {
    if (this.state.cancel) {
      this.setState({ open: false, cancel: false });
      this.num = 0;
      return false;
    };
    const { options, update } = this.props;

    const options100 = JSON.parse(JSON.stringify(options));
    options100.num = 100;
    const maxNum = this.props.options.num;
    if (maxNum - this.num >= 100) {
      this.resultPlus(resultData, simulateAirState(build, enemyBuild, options100));
      this.num += 100;
    } else {
      const optionsN = JSON.parse(JSON.stringify(options));
      optionsN.num = maxNum % 100;
      this.resultPlus(resultData, simulateAirState(build, enemyBuild, optionsN));
      this.num += maxNum % 100;
    };
    this.setState({percent: Math.floor(this.num * 100 / maxNum)});
    if (this.num < maxNum) {
      setTimeout(() => this.sim(build, enemyBuild, resultData), 0);
    } else {
      sessionStorage.resultData = JSON.stringify(resultData);
      this.num = 0;
      this.setState({ open: false });
      update();
    };
  }
  handleClick = event => {
    this.num = 0;
    const { buildKey, enemyKey, enemyBuildData, mapKeys, num, sortieList } = this.props.options;
    let build, enemyBuild;
    console.log(this.props.options);
    if (this.props.build) build = this.props.build;
    else if (user.builds && buildKey) build = user.builds[buildKey];
    if (mapKeys === 'self' && enemyKey) {
      enemyBuild = user.builds[enemyKey];
    } else if (typeof enemyBuildData === 'object') {
      enemyBuild = new CreateBuildByBuildData(enemyBuildData);
    };
    if (!enemyBuild || !build || num < 1) {
      alert("必要事項を入力してください");
      this.setState({ open: false, percent: 0 });
      return false;
    };

    this.setState({ open: true, percent: 0 });
    const resultData = {};
    for (let prop of ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', 'main']) {
      resultData[prop] = {'1': 0, '3': 0, '5': 0, '7': 0, '10': 0};
    };
    resultData.sortieList = sortieList;
    resultData.num = num;
    this.sim(build, enemyBuild, resultData);
  }
  handleCancel = () => this.setState({ open: false, cancel: true });
  render() {
    return (
      <Modal
        open={this.state.open}
        trigger={
          <Button basic inverted onClick={this.handleClick} >シミュレート開始</Button>
        }
        basic
        size='small'
      >
        <Header>
          <Icon loading name='spinner' />
        </Header>
        <Modal.Content>
          <Progress percent={this.state.percent} progress color='orange' />
        </Modal.Content>
        <Modal.Actions>
          <Button basic color='red' inverted onClick={this.handleCancel} >
            <Icon name='remove' /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

const ResultTable = props => {
  if (!sessionStorage.resultData) return false;
  const resultData = JSON.parse(sessionStorage.resultData);
  if (!resultData.sortieList) return false;
  const { sortieList } = resultData;
  const displayList = [];
  for (let index in sortieList) {
    const sortieNum = sortieList[index];
    if (sortieNum > 0) displayList.push(index + '-1');
    if (sortieNum === 2) displayList.push(index + '-2');
  };
  return (
    <Table celled compact='very' style={{maxWidth: 800}} >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>制空</Table.HeaderCell>
          {displayList.map(key =>
            <Table.HeaderCell key={key} >{key}</Table.HeaderCell>
          )}
          <Table.HeaderCell>本隊</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {[1,3,5,7,10].map(airState => {
          let name;
          if (airState === 1) name = '確保';
          else if (airState === 3) name = '優勢';
          else if (airState === 5) name = '均衡';
          else if (airState === 7) name = '劣勢';
          else if (airState === 10) name = '喪失';
          return (
            <Table.Row key={airState} >
              <Table.Cell>{name}</Table.Cell>
              {[...displayList,'main'].map(key =>
                <Table.Cell key={key} >
                  {resultData[key][airState] * 100 / resultData.num}%
                </Table.Cell>
              )}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};
