import React from 'react';
import { createAnimatableComponent } from 'react-native-animatable';
import Image from 'react-native-image-progress';
import { Circle } from 'react-native-progress';

const ProgressFadeInImage = createAnimatableComponent(Image);

export default class ProgressImage extends React.PureComponent {
  render() {
    const { onLoad, ...props } = this.props;
    return (
      <ProgressFadeInImage
        ref={e => (this.imageRef = e)}
        indicator={Circle}
        {...props}
        onLoad={() => {
          if (onLoad) onLoad();
          if (this.imageRef.fadeIn) this.imageRef.fadeIn();
        }}
      />
    );
  }
}
