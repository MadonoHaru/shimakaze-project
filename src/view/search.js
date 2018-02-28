import React, { Component } from 'react';
import { Button, Input } from 'semantic-ui-react';

export default class SearchForm extends Component {
  state = {value: ''}
  handleClick = () => {
    this.refs.input.focus();
  }
  handleChange = (event) => {
    let str = event.target.value;
    this.setState({value: str});
    str = str.trim().split(/\s+/);
    this.props.setInput(str);
  }
  render() {
    const { value } = this.state;
    return (
      <Button basic inverted style={{padding:10}} onClick={this.handleClick} >
          <Input
            onChange={this.handleChange}
            value={value}
            icon='search'
            inverted
            transparent
            ref={'input'}
            style={{margin:1}}
          />
      </Button>
    );
  }
}
