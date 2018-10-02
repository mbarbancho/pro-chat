import React from 'react';
import { StyleSheet, View } from 'react-native';
import TouchableBounce from 'react-native/Libraries/Components/Touchable/TouchableBounce';
import { connect } from 'react-redux';

// import { getProfileImage, getPropertyForUser } from '../redux/profiles';
import LoadingImage from './LoadingImage';
import Meta from './Meta';
import { dispatch } from '@rematch/core';

class SliderCell extends React.PureComponent {
  componentWillMount() {
    this.load(this.props.uid);
  }

  componentWillReceiveProps(next) {
    if (this.props.uid !== next.uid) {
      this.load(next.uid);
    }
  }

  load = async (uid) => {
    if (typeof uid === 'string') {
      if (!this.props.image) {
        dispatch.users.getProfileImage({ uid });
      }
      if (!this.props.firstName) {
        dispatch.users.getPropertyForUser({ uid, property: 'firstName' });
      }
      if (!this.props.about) {
        dispatch.users.getPropertyForUser({ uid, property: 'about' });
      }
      if (!this.props.rating) {
        dispatch.users.getPropertyForUser({ uid, property: 'rating' });
      }
    }
  };

  render() {
    const {
      itemWidth,
      onPressItem,
      // index,
      uid,
      about,
      rating,
      image,
    } = this.props;

    // const center = index * itemWidth;

    const style = {
      width: itemWidth,
      marginTop: 36,
    };

    return (
      <View style={style}>
        <View
          style={{
            width: itemWidth,
            aspectRatio: 1,
          }}
        >
          <TouchableBounce
            activeOpacity={0.7}
            style={{ flex: 1 }}
            onPress={() => onPressItem(uid)}
          >
            <LoadingImage
              source={image}
              style={[
                {
                  backgroundColor: 'white',
                  width: itemWidth,
                  height: itemWidth,
                  borderRadius: itemWidth / 2,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: '#F9F9F9',
                  shadowColor: 'rgba(114,45,250, 0.2)',
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 1,
                },
              ]}
            />
          </TouchableBounce>
        </View>
        <Meta
          color="white"
          title={this.props.firstName}
          subtitle={about}
          rating={rating}
        />
      </View>
    );
  }
}

const mergeProps = (state, actions, { uid, ...localProps }) => {
  const { users, ...props } = state;

  const user = users[uid] || {};
  // const image = images[uid];

  return {
    ...localProps,
    ...props,
    image: user.photoURL,
    uid,
    firstName: user.firstName,
    about: user.about,
    rating: user.rating,

    ...actions,
  };
};

export default connect(
  ({ users }) => ({ users }),
  {
    // getPropertyForUser,
    // getProfileImage
  },
  mergeProps,
)(SliderCell);
