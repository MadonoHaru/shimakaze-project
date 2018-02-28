import React, { Component } from 'react';
import { Button, Popup } from 'semantic-ui-react';

export class SetImprovementBtn extends Component {
  state = { isOpen: false }
  handleOpen = () => this.setState({ isOpen: true })
  handleClose = () => this.setState({ isOpen: false })
  render() {
    const style = { opacity: 0.97,padding:0 };
    const { equipment } = this.props;
    const impNum = equipment.improvement? equipment.improvement: 0;
    return (
      <Popup
        trigger={
          <div style={{fontSize:15,position: "absolute",right:55,top:20}} >
          ★{impNum}
          </div>
        }
        content={<ImprovementPop onClose={this.handleClose} {...this.props} />}
        open={this.state.isOpen}
        onOpen={this.handleOpen}
        onClose={this.handleClose}
        style={style}
        inverted
        basic
        wide="very"
        on='click'
       />
    );
  }
}

const ImprovementPop = props => {
  const handleClick = (e,data) => {
    props.equipment.improvement = data.num;
    props.onClose();
    props.update();
  }
  return (
    <div>
      {
        [0,1,2,3,4,5,6,7,8,9,10].map(num =>
          <Button
            style={{padding:8,height:50}}
            secondary
            num={num}
            onClick={handleClick}
            key={num}
          >
            ★{num}
          </Button>
        )
      }
    </div>
  );
};
