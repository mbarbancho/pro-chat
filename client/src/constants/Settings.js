// @flow

import { Constants } from 'expo';
import { Platform } from 'react-native';

import sizeInfo from '../utils/whatAmI';

const isInAppleReview = true;

const realName = 'Bütē Alert';

const debug = __DEV__;

const fields = [
  'id',
  'email',
  'birthday',
  'name',
  'first_name',
  'gender',
  'about',
  'picture',
  'interested_in',
  'likes',
];

const Settings = {
  refs: {
    channels: 'channels',
    relationships: 'relationships',
    users: 'users',
  },
  isDetached: false,
  facebookFields: fields,
  facebookLoginProps: {
    permissions: [
      'public_profile',
      'email',
      // 'user_friends'
    ],
  },
  hideBooty: true,
  noName: 'Sasuke Uchiha',
  isIos: Platform.OS === 'ios',
  osVersion: sizeInfo.osVersion,
  loginBehavior: sizeInfo.loginBehavior,
  isRunningInExpo: sizeInfo.isRunningInExpo,
  isIPhone: sizeInfo.isIPhone,
  isIPad: sizeInfo.isIPad,
  isIPhoneX: sizeInfo.isIPhoneX,
  bottomInset: sizeInfo.bottomInset,
  topInset: sizeInfo.topInset,
  isSimulator: !Constants.isDevice,
  debug,
  ignoredYellowBox: ['Class ABI', 'Module ABI', "Audio doesn't exist"],
  slug: debug ? 'crossy-road' : 'users',
  isCacheProfileUpdateActive: !debug || false,
  shouldDelayFirebaseProfileSyncInMinutes: 60,
  canEditPhoto: false,
  mainInitialRouteName: 'MainTab', // 'Chat'
  testOnboarding: false,
  needsProfileImage: true,
  location: {
    enableHighAccuracy: true,
    maximumAge: 2000,
    timeout: 20000,
  },
  debugGoToChat: false,
  avatarSize: 96,
  minimumAge: 17,
  email: 'bootyalertapp@gmail.com',
  // testingUID: "KukzZOJZaAefeh334uqElUWDjc92",
  messagesPageSize: 15,
  simulator: !Constants.isDevice,
  /*
      So many of these...
  */
  isInAppleReview,
  name: isInAppleReview ? 'Beauty' : 'Bütē',
  user: isInAppleReview ? 'Art' : 'Bütē',
  userPlural: isInAppleReview ? 'Artists' : 'Bütēs',
  debugging:
    global.isDebuggingInChrome ||
    __DEV__ ||
    process.env.NODE_ENV === 'development',
  giphyAPI: {
    debug: '8fd94ebef2e642a29137cc7d09412907',
    production: '',
  },
};

export default Settings;
