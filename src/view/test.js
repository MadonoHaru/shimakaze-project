import React, { Component } from 'react';
import { Segment, Table, Button, Header, Dropdown, Input, Checkbox, Modal, Form, Icon, TextArea } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { user } from "./load-data";
import { ShipSegment } from "./ship-segment";
import { CreateBuildByDeckBuilderData } from "../logic/build";
import { getApi, getEventMapDataByWikia, getMapDataByKcwiki, csvToJson } from "../tools/source";


export class TestPage extends Component {
  state = {key: Math.random()}
  update = () => this.setState({key: Math.random()})
  api = {url: 'http://api.kcwiki.moe/ship/1'}
  render() {
    const style = {
      backgroundColor: "rgba( 255, 255, 255, 0.1 )",
      animation: "show 500ms",
    };
    const ship = user.builds[1].fleets[1].ships[1];
    const { update, api } = this;
    return (
      <Segment style={style} inverted >
        <Header inverted >テストページ</Header>
        <TestBtn update={update} api={api} />
        <SourceTextArea update={update} api={api} />
        <WikiaEventTextArea update={update} api={api} />
        <KcwikiTextArea update={update} api={api} />
        <div>{api.str}</div>
      </Segment>
    );
  }
}

const SourceTextArea = props => {
  const {api} = props;
  const handleChange = (event, data) => {
    api.url = data.value;
  };
  const handleClick = () => {
    api.str = getApi(api.url);
    api.data = JSON.parse(api.str);
    props.update();
  };
  return (
    <Form>
      <Input type='text' defaultValue={api.url} onChange={handleChange} />
      <Button onClick={handleClick} icon='download' inverted color='teal' />
    </Form>
  );
}

const TestBtn = props => {
  const { api, update } = props;
  const handleClick = () => {
    const req = new XMLHttpRequest();
    const csvPath = require('../data/ElectronicObserverRecord/EnemyFleetRecord.csv');
    req.open("get", csvPath, true);
    req.send(null);
    req.onload = () => console.log(csvToJson(req.responseText));
    update();
  };
  return (
    <Form>
      <Button onClick={handleClick} icon='download' inverted color='green' />
    </Form>
  );
}

const WikiaEventTextArea = props => {
  const { api, update } = props;
  const handleChange = (event, data) => {
    api.str = data.value;
  };
  const handleClick = () => {
    api.str = getEventMapDataByWikia(api.str);
    update();
  };
  return (
    <Form>
      from event map of wikia
      <TextArea type='text' onChange={handleChange} />
      <Button onClick={handleClick} icon='download' inverted color='pink' />
    </Form>
  );
}

const KcwikiTextArea = props => {
  const { api, update } = props;
  const handleChange = (event, data) => {
    api.str = data.value;
  };
  const handleClick = () => {
    api.str = getMapDataByKcwiki(api.str);
    update();
  };
  return (
    <Form>
      from kcwiki
      <TextArea type='text' onChange={handleChange} />
      <Button onClick={handleClick} icon='download' inverted color='pink' />
    </Form>
  );
}
