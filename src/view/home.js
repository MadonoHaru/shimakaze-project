import React, { Component } from 'react';
import { Segment, Button, Header } from 'semantic-ui-react';
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
      <Segment inverted size='big' style={style} >
        <Header inverted as='h1' >使い方</Header>
        <p>[編成]で編成を作成してください</p>
        <p>基地航空隊も[編成]から作成します</p>
        <p>基地航空隊を設定せずに[制空シミュ]で基地を使用しても、判定は行いません</p>
      </Segment>
      <Link to='/ship-list' ><Button inverted basic >艦娘一覧</Button></Link>
      <Link to='/equipment-list' ><Button inverted basic >装備一覧</Button></Link>
      <Button inverted basic onClick={handleClick} >ローカルデータ削除</Button>
    </div>
  );
};
