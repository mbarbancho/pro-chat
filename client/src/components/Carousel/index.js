import React, { Component } from 'react';
import { FlatList } from 'react-native';

import Section from '../Section';
import Cell from './Cell';

export default class Carousel extends Component {
  static propTypes = {};
  static defaultProps = {
    // users: []
  };

  render() {
    const { users, navigation, ...props } = this.props;
    return (
      <Section {...props}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          horizontal
          style={{ overflow: 'visible' }}
          data={users}
          keyExtractor={(item, index) => `Carousel-${index}`}
          renderItem={({ item, index }) => (
            <Cell uid={item} key={index} onPress={event => navigation.navigate('OtherProfile', { uid: item })} />
          )}
        />
      </Section>
    );
  }
}
