import React, { Component } from 'react';
import { Segment, Image, Button, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { user } from "./load-data";

export const Home = props => {
  const style = {
    backgroundColor: "rgba( 255, 255, 255, 0.1 )",
    animation: "show 500ms",
  };
  const handleClick = () => {
    delete user.builds;
    localStorage.clear();
    sessionStorage.clear();
  }
  return (
    <div>
      <Header inverted >test</Header>
      <Link to='/ship-list' ><Button inverted basic >艦娘一覧</Button></Link>
      <Link to='/equipment-list' ><Button inverted basic >装備一覧</Button></Link>
      <Button inverted basic onClick={handleClick} >ローカルデータ削除</Button>

      <Image src={require('../images/jervis.png')} floated='right' />

    </div>
  );
};
