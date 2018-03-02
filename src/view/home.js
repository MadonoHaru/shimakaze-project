import React, { Component } from 'react';
import { Segment, Button, Header, List, Icon } from 'semantic-ui-react';
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
  const white = {color: 'white'};
  return (
    <div>
      <Segment inverted style={style} >
        <Header inverted as='h2' >使い方</Header>
        <p>[編成]で編成を作成してください</p>
        <p>基地航空隊も[編成]から作成します</p>
        <p>基地航空隊を設定せずに[制空シミュ]で基地を使用しても、判定は行いません</p>
        <Header inverted as='h3' >制空シミュについて</Header>
        <p>自艦隊は256分割撃墜乱数、敵艦隊は0.35A+0.65B撃墜乱数を使用</p>
        <Header inverted as='h3' >連絡先</Header>
        <p>要望、バグ報告、開発協力等はこちらへ</p>
        <Icon name='twitter' />
        <a style={white}  href='https://twitter.com/MadonoHaru'>@MadonoHaru</a>
        <Header inverted as='h3' >次の実装予定</Header>
        <p>とりあえず火力計算機を予定しています</p>
        <Header inverted as='h3' >開発運営協力</Header>
        <p>艦これ、HTML5、CSS3、JavaScript、React、GitHub全部ド素人なので教えてください</p>
        <Header inverted as='h3' >参考</Header>
        <List >
          <List.Item>
            <List.Icon name='home' verticalAlign='middle' />
            <List.Content>
              <a style={white}  href='http://www.dmm.com/netgame/feature/kancolle.html'>艦隊これくしょん -艦これ-</a>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name='book' verticalAlign='middle' />
            <List.Content>
              <a style={white}  href='http://wikiwiki.jp/kancolle/'>艦隊これくしょん -艦これ- 攻略 Wiki*</a>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name='book' verticalAlign='middle' />
            <List.Content>
              <a style={white} href='http://ja.kancolle.wikia.com/wiki/%E8%89%A6%E3%81%93%E3%82%8C%E6%A4%9C%E8%A8%BCWiki'>艦これ検証Wiki</a>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name='book' verticalAlign='middle' />
            <List.Content>
              <a style={white}  href='http://kancolle.wikia.com/wiki/Kancolle_Wiki'>Kancolle Wiki</a>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Icon name='paint brush' verticalAlign='middle' />
            <List.Content>
              <a style={white}  href='http://fleet.diablohu.com/arsenal/'>是谁呼叫舰队</a>
            </List.Content>
          </List.Item>
        </List>
        <p>当サイトの画像の多くは、DMM.comと角川ゲームスが共同開発した『艦隊これくしょん -艦これ-』から引用しています</p>
        <p>著作権者からの削除依頼は連絡先にお知らせください</p>
      </Segment>
      <Link to='/ship-list' ><Button inverted basic >艦娘一覧</Button></Link>
      <Link to='/equipment-list' ><Button inverted basic >装備一覧</Button></Link>
      <Button inverted basic onClick={handleClick} >ローカルデータ削除</Button>
    </div>
  );
};
