// @flow
import React from 'react'

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    return <div id="App">{this.props.children}</div>;
  }
}
