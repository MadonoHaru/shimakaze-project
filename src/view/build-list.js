
import React, { Component } from 'react';
import { Button, Icon, Divider, Image, Popup, Transition } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { user, getShipImage } from "./load-data";
import { CreateNewBuild } from "../logic/build";
import { Build } from '../logic/build';

export class BuildList extends Component {
  state = {builds: user.builds}
  setBuild = () => this.setState({builds: user.builds});
  render() {
    if (!("builds" in user)) user.builds = [0];
    const builds = user.builds;
    return (
      <div>
        {
          builds.map((build, key) =>
            <SelectBuildBtn build={build} keys={[key]} setBuild={this.setBuild} key={key} />
          )
        }
        <CreateBuildBtn builds={builds} />
      </div>
    );
  }
}

const CreateBuildBtn = withRouter((props) => {
  const handleClick = () => {
    const builds = props.builds;
    builds.push(new CreateNewBuild(builds.length));
    props.history.push("/build" + (builds.length - 1));
  }
  const style = {backgroundColor: "rgba( 255, 255, 255, 0.1 )", animation: "show 500ms"};
  return (
    <Button size="huge" inverted basic style={style} onClick={handleClick} >
      <Icon name="plus" />
      編成作成
    </Button>
  )
});

const SelectBuildBtn = withRouter((props) => {
  if (!props.build.name) return false;
  const click = () => {
    props.history.push("/build" + props.keys[0]);
  }
  const style = {animation: "show 500ms"};
  const flagShip = props.build.fleets[1].ships[1];
  return (
    <div>
      <Button size="huge" inverted basic style={style} onClick={click} >
        {flagShip.id && <Image src={getShipImage(flagShip.id)} inline />}
        <span style={{margin:30}} >{props.build.name}</span>
      </Button>
      <OptionsBtn {...props} />
      <Divider />
    </div>
  );
});

const OptionsBtn = props => {
  const handleRemove = () => {
    user.builds.splice(props.keys[0],1);
    props.setBuild();
  };
  const handleUp = () => {
    const key = props.keys[0];
    if (key === 1) return false;
    const [b1,b2] = [user.builds[key - 1], user.builds[key]];
    [user.builds[key], user.builds[key - 1]] = [b1,b2];
    props.setBuild();
  };
  const handleDown = () => {
    const key = props.keys[0];
    if (key === user.builds.length - 1) return false;
    const [b1,b2] = [user.builds[key], user.builds[key + 1]];
    [user.builds[key], user.builds[key + 1]] = [b2,b1];
    props.setBuild();
  };
  const handleCopy = () => {
    const key = props.keys[0];
    const build = user.builds[key];
    const newBuild = new Build(build);
    newBuild.name = newBuild.name + '-コピー';
    user.builds.push(newBuild);
    props.setBuild();
  };
  return (
    <Popup
      trigger={<Icon name='options' inverted size='big' />}
      content={
        <div>
          <Icon name='remove' size='big' onClick={handleRemove} />
          <Icon name='arrow up' size='big' onClick={handleUp} />
          <Icon name='arrow down' size='big' onClick={handleDown} />
          <Icon name='copy' size='big' onClick={handleCopy} />
        </div>
      }
      on='click'
    />
  );
};
