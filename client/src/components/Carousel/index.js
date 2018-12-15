import React, { Component } from 'react';
import { FlatList } from 'react-native';

import Section from '../Section';
import Cell from './Cell';
import NavigationService from '../../navigation/NavigationService';

export default class Carousel extends Component {
  static propTypes = {};
  static defaultProps = {
    destination: 'Profile',
    // users: []
  };

  render() {
    const { data, destination, ...props } = this.props;

    return (
      <Section {...props}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          horizontal
          style={{ overflow: 'visible' }}
          data={data}
          keyExtractor={({ uid }, index) => `Carousel-${uid || index}`}
          renderItem={({ item, index }) => {
            const { image, name, uid } = item;
            return (
              <Cell
                destination={destination}
                image={image}
                name={name}
                uid={uid}
                key={index}
              />
            );
          }}
        />
      </Section>
    );
  }
}
