import React, { Component } from 'react';
import { Segment, Input, Header, Tab, Checkbox, Label, Button, Modal } from 'semantic-ui-react';
import { user } from "./load-data";
import { ShipSegment } from "./ship-segment";
import { FleetSegment } from "./fleet-segment";
import { EquipmentCard } from "./equipment-card";
import { LandBaseSegment } from "./land-base-segment";
import { AirStateSimulator  } from "./air-state-simulator";

export const BuildPage = props => {
  const keys = [parseInt(props.match.params.key, 10)];
  const build = user.getDataByKey(keys[0]);
  if (!keys[0]) return false;
  if (!build) return false;
  return (
    <BuildSegment build={build} keys={keys} />
  );
};

export class BuildSegment extends Component {
  state = { key: Math.random() }
  update = () => this.setState({ key: Math.random() })
  render() {
    const { build, keys } = this.props;
    return (
      <div>
        <BuildHeader build={build} />
        <div>
          <CombinedFleetSwitch build={build} update={this.update} />
          <EnemySwitch build={build} update={this.update} />
          <ModalDisplayDeckBuilderData build={build} />
        </div>
        <BuildTab keys={keys} build={build} update={this.update} />
      </div>
    );
  }
}

class BuildHeader extends Component {
  state = {inputMode: false}
  build = this.props.build
  click = () => this.setState({inputMode: true});
  blur = () => this.setState({inputMode: false});
  change = (event) => {
    const value = event.target.value;
    this.build.name = value;
  }
  render() {
    const name = this.build.name;
    return (
      <div onClick={this.click} >
        {this.state.inputMode
          ? <Input
            autoFocus
            onInput={this.change}
            onBlur={this.blur}
            defaultValue={name}
            />
         : <Header as='h1' inverted >{name}</Header>
      }
      </div>
    );
  }
}

const CombinedFleetSwitch = props => {
  const { build, update } = props;
  const handleChange = (event, data) => {
    build.isCombinedFleet = data.checked;
    update();
  };
  const style = {verticalAlign: 'middle', margin: 5};
   return (
    <span>
      <span style={{color: 'white', ...style}}>
        連合艦隊
      </span>
      <Checkbox
        toggle
        style={style}
        onChange={handleChange}
        defaultChecked={build.isCombinedFleet}
      />
    </span>
  );
};

const EnemySwitch = props => {
  const { build, update } = props;
  const handleChange = (event, data) => {
    build.isEnemy = data.checked;
    update();
  };
  const style = {verticalAlign: 'middle', margin: 5};
   return (
    <span style={{margin: 10}}>
      <span style={{color: 'white', ...style}}>
        敵判定
      </span>
      <Checkbox
        style={style}
        onChange={handleChange}
        defaultChecked={build.isEnemy}
      />
    </span>
  );
};

const ModalDisplayDeckBuilderData = props => {
  const { build } = props;
  const handleCopy = () => {
    const copyTextToClipboard = textVal => {
      const copyFrom = document.createElement("textarea");
      copyFrom.textContent = textVal;
      const bodyElm = document.getElementsByTagName("body")[0];
      bodyElm.appendChild(copyFrom);
      copyFrom.select();
      const retVal = document.execCommand('copy');
      bodyElm.removeChild(copyFrom);
      return retVal;
    };
    if (copyTextToClipboard(build.deckBuilderData)) {
      alert('コピーしました');
    } else {
      alert('コピーに失敗しました');
    };
  };
  const handleClick = () => {
    const url = 'http://kancolle-calc.net/deckbuilder.html?predeck=' + build.deckBuilderData;
    window.open(url);
  };
  return (
    <Modal
      trigger={<Button basic inverted size='tiny' >デッキビルダー形式で表示</Button>}
      header='デッキビルダー形式のデータ'
      content={build.deckBuilderData}
      actions={[
        { key: 'copy', icon: 'clipboard', content: 'クリップボードにコピー', basic: true, inverted: true, color: 'orange', onClick: handleCopy },
        { key: 'open', icon: 'external', content: 'デッキビルダーで開く', basic: true, inverted: true, color: 'blue', onClick: handleClick },
        { key: 'ok', icon: 'reply', content: 'OK', basic: true, inverted: true, color: 'blue' },
      ]}
      basic
    />
  );
}

const BuildTab = props => {
  const { keys, build, update } = props;
  let tab1Name, tab2Name;
  if (build.isCombinedFleet) {
    tab1Name = '連合第1';
    tab2Name = '連合第2';
  } else {
    tab1Name = '1';
    tab2Name = '2';
  };
  const panes = [
    { menuItem: tab1Name, render: () => <FleetSegment keys={[...keys,1]} update={update} /> },
    { menuItem: tab2Name, render: () => <FleetSegment keys={[...keys,2]} update={update} /> },
    { menuItem: '3', render: () => <FleetSegment keys={[...keys,3]} update={update} /> },
    { menuItem: '4', render: () => <FleetSegment keys={[...keys,4]} update={update} /> },
    { menuItem: '基地', render: () => <LandBaseSegment keys={[...keys,'landBase']} update={update} build={build} /> },
    { menuItem: '制空シミュ', render: () => <AirStateSimulator build={build} /> }
  ];
  const handleChange = (event, data) => {
    sessionStorage['activeIndex' + keys[0]] = data.activeIndex;
  };
  return (
    <Tab
      defaultActiveIndex={sessionStorage['activeIndex' + keys[0]]}
      onTabChange={handleChange}
      menu={{secondary: true, inverted: true}}
      panes={panes}
      style={{backgroundColor: "rgba( 255, 255, 255, 0 )"}}
    />
  );
}
