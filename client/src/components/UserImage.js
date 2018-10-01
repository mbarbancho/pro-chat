import React, { Component } from 'react';
import { View } from 'react-native';

import Circle from './Circle';
import LoadingImage from './LoadingImage';
import NotificationDot from './NotificationDot';

export default class UserImage extends Component {
  static defaultProps = {
    size: 48,
  };

  render() {
    const {
      style, source, size, containerStyle, isNew,
    } = this.props;
    return (
      <View style={[{ width: size, aspectRatio: 1, marginRight: 8 }, containerStyle]}>
        <Circle
          style={[
            {
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              overflow: 'visible',
              backgroundColor: '#eee',
              width: size,
              borderColor: 'white',
            },
            style,
          ]}
        >
          <LoadingImage
            size={size}
            source={source}
            style={{
              flex: 1,
              maxWidth: size,
              minWidth: size,
              minHeight: size,
              maxHeight: size,
              borderRadius: size / 2,
            }}
          />
        </Circle>
        {isNew && <NotificationDot />}
      </View>
    );
  }
}
