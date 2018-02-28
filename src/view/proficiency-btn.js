import React, { Component } from 'react';
import { Popup, Input } from 'semantic-ui-react';

export class SetProficiencyBtn extends Component {
  state = { isOpen: false }
  handleOpen = () => this.setState({ isOpen: true })
  handleClose = () => this.setState({ isOpen: false })
  render() {
    const style = { opacity: 0.97,padding:0 };
    const { equipment } = this.props;
    return (
      <Popup
        trigger={'types' in equipment && equipment.types[4] &&
          <div style={{display:'inlineBlock',position: "absolute",right:20,top:15}} >
            <ProficiencyImg
              innerPro={equipment.proficiency}
              numVisible={true}
            />
          </div>
        }
        content={<ProficiencyPop onClose={this.handleClose} {...this.props} />}
        open={this.state.isOpen}
        onOpen={this.handleOpen}
        onClose={this.handleClose}
        style={style}
        wide='very'
        inverted
        basic
        on='click'
       />
    );
  }
}

const getProficiencyLevel = (inner) => {
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

class ProficiencyImg extends Component {
  render() {
    const innerPro = this.props.innerPro;
    const lvl = getProficiencyLevel(innerPro);
    const img = require(`../images/icons/proficiency-${lvl}.png`);
    const numStyle = {position: "absolute", fontSize: 10, ...this.props.numPosition};
    return (
      <span style={{position: "relative"}} >
        <img src={img} alt="" />
        { this.props.numVisible && <b style={numStyle} >{innerPro}</b> }
      </span>
    );
  }
}
ProficiencyImg.defaultProps = {
  innerPro: null,
  numVisible: false,
  numPosition: {bottom:0,right:-5},
}

export class ProficiencyPop extends Component {
  render() {
    return (
      <div>
        {
          [0,10,25,40,55,70,85,100,120].map(
            num => <ProficiencyBtn key={num} innerPro={num} {...this.props} />
          )
        }
        <DirectInput {...this.props} />
      </div>
    );
  }
}

class ProficiencyBtn extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.style = {padding: 10, cursor: "pointer"};
    this.lvl = getProficiencyLevel(this.props.innerPro);
    this.src = require(`../images/icons/proficiency-${this.lvl}.png`);
  }
  over = () => {
    const style = {...this.state.style, filter:"brightness(150%)"};
    this.setState({style: style});
  }
  out = () => {
    const style = {padding: 10,cursor: "pointer"};
    this.setState({style: style});
  }
  click = () => {
    if (typeof this.props.innerPro === "number") {
      this.props.equipment.proficiency = this.props.innerPro;
      this.props.onClose();
      this.props.update();
    }
  }
  render() {
    return (
      <span
        style={this.state.style}
        onMouseOver={this.over}
        onMouseOut={this.out}
        onClick={this.click}
      >
        <ProficiencyImg
         numVisible={true}
         innerPro={this.props.innerPro}
         numPosition={{bottom:-2, right:-5}}
        />
      </span>
    );
  }
}

class DirectInput extends Component {
  constructor(props) {
    super(props);
    this.state = {visible: true};
    this.state.style = {padding: 10,cursor: "pointer"};
    this.lvl = getProficiencyLevel(this.props.innerPro);
    this.src = require(`../images/icons/proficiency-${this.lvl}.png`);
  }
  over = () => {
    const style = {...this.state.style, filter:"brightness(150%)"};
    this.setState({visible: this.state.visible, style: style});
  }
  out = () => {
    const style = {padding: 10,cursor: "pointer"};
    this.setState({visible: this.state.visible, style: style});
  }
  click = () => {
    const state = {visible: false, style: this.state.style};
    this.setState(state);
  }
  change = (e, data) => {
    this.props.equipment.proficiency = parseInt(data.value, 10);
    this.props.update();
  }
  render() {
    return (
      <span
        style={this.state.style}
        onMouseOver={this.over}
        onMouseOut={this.out}
        onClick={this.click}
      >
        {this.state.visible?
          <ProficiencyImg innerPro="n" numVisible={true} numPosition={{bottom: -2, right: 0}}/>
          :<Input
            type="number"
            transparent
            inverted
            size="big"
            style={{width: "50px",backgroundColor: "rgba( 255, 255, 255, 0.4 )"}}
            onChange={this.change}
          />
        }
      </span>
    );
  }
}
