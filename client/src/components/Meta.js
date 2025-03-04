import React from 'react';
import { Text, View } from 'react-native';

import RatingTitle from './RatingTitle';
import Colors from '../constants/Colors';
import Settings from '../constants/Settings';

export default ({
  style,
  title,
  subtitle,
  rating,
  color = Colors.white,
  uid,
  onRatingPressed,
}) => (
  <View style={[style, styles.container]}>
    <Text numberOfLines={1} style={[styles.title, { color }]}>
      {title}
    </Text>
    <Text numberOfLines={3} style={[styles.subtitle, { color }]}>
      {subtitle}
    </Text>
    {!Settings.isInAppleReview && (
      <RatingTitle
        title={rating}
        uid={uid}
        style={{}}
        onRatingPressed={onRatingPressed}
      />
    )}
  </View>
);

const styles = {
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    minHeight: 25,
    backgroundColor: Colors.transparent,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    minHeight: 60,
    backgroundColor: Colors.transparent,
    textAlign: 'center',
  },
};
