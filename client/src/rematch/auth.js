import { Alert } from 'react-native';
import { dispatch } from './dispatch';
// import firebase from 'firebase';
import firebase from '../universal/firebase';
import { statics } from 'expo-firebase-auth';
import Settings from '../constants/Settings';
import Fire from '../Fire';
import { Constants, Facebook } from '../universal/Expo';
import getGithubTokenAsync from '../utils/getGithubTokenAsync';

const { FacebookAuthProvider, GithubAuthProvider } = statics;
const FacebookLoginTypes = {
  Success: 'success',
  Cancel: 'cancel',
};

async function deleteUserAsync(uid) {
  const db = firebase.firestore();
  return db
    .collection(Settings.refs.users)
    .doc(uid)
    .delete();
}

async function getFacebookTokenAsync() {
  let auth;
  try {
    auth = await Facebook.logInWithReadPermissionsAsync(
      Constants.manifest.facebookAppId,
      Settings.facebookLoginProps,
    );
  } catch ({ message }) {
    Alert.alert(`Facebook Login Error: ${message}`);
  }
  if (auth) {
    const { type, expires, token } = auth;
    if (type === FacebookLoginTypes.Success) {
      dispatch.auth.set({ expires, token });
    } else if (type === FacebookLoginTypes.Cancel) {
      // do nothing, user cancelled
    } else {
      // unknown type, this should never happen
      Alert.alert(`Failed to authenticate ${type}`);
    }
    return token;
  }
  return null;
}

export const SocialTypes = {
  Facebook: 'facebook',
  Github: 'github',
  // TODO: Google, Twitter
};

async function getAuthInfoForSocialAccountAsync(loginType) {
  let token;
  let provider;
  switch (loginType) {
    case SocialTypes.Facebook:
      token = await getFacebookTokenAsync();
      provider = FacebookAuthProvider;
      break;
    case SocialTypes.Github:
      token = await getGithubTokenAsync();
      provider = GithubAuthProvider;
      break;
    default:
      throw new Error(
        `getAuthInfoForSocialAccountAsync: Invalid loginType ${loginType}`,
      );
  }
  return { token, provider };
}

async function upgradeAccountWithAuthAsync(token, provider) {
  console.log('upgradeAccountWithAuthAsync: ', {
    token,
    provider,
    credential: provider.credential,
  });
  if (!token || !provider) {
    throw new Error('upgradeAccountWithAuth: Invalid token or provider');
  }

  try {
    const user = await upgradeWithTokenAndProvider(token, provider);
    console.log('upgradeAccountWithToken: Upgraded Successful');
    dispatch.auth.authorized(user);
  } catch ({ message, code }) {
    if (code === 'auth/credential-already-in-use') {
      console.log(
        'upgradeAccountWithAuthAsync: Account is already linked',
        message,
        code,
      );
      // Delete current account while signed in
      // TODO: This wont work
      const { uid } = Fire.shared;
      if (uid) {
        console.log('Should delete:', uid);
        // await deleteUserAsync(uid);
        console.log('All deleted');
      } else {
        console.log('??? do something:', uid);
      }
      await loginToFirebaseWithAuthAsync(token, provider);
    } else {
      // If the account is already linked this error will be thrown
      console.log('Error: upgradeAccountWithToken', message, code);
      Alert.alert(message);
    }
  }
}

async function loginToFirebaseWithAuthAsync(token, provider) {
  if (!token || !provider) {
    throw new Error('upgradeAccountWithAuth: Invalid token or provider');
  }

  try {
    const user = await signInWithTokenAndProvider(token, provider);
    dispatch.auth.authorized(user);
  } catch ({ message }) {
    console.log('Error: loginToFirebase');
    Alert.alert(message);
  }
}

const auth = {
  state: null,
  reducers: {
    set: (state, props) => props,
  },
  effects: {
    upgrade: async socialType => {
      const { token, provider } = await getAuthInfoForSocialAccountAsync(
        socialType,
      );
      await upgradeAccountWithAuthAsync(token, provider);
    },
    login: async (socialType = SocialTypes.Facebook) => {
      console.log('auth.login: A: ', { socialType });
      const { token, provider } = await getAuthInfoForSocialAccountAsync(
        socialType,
      );
      console.log('auth.login: B: ', { token, provider });
      await loginToFirebaseWithAuthAsync(token, provider);
    },
    authorized: user => {
      let _user = user;
      if (_user.toJSON) {
        _user = user.toJSON();
      }
      //   console.log('True User', _user);
      dispatch.user.update(_user);
    },
    logoutAsync: async () => {
      try {
        await firebase.auth().signOut();
      } catch ({ message }) {
        console.log('ERROR: user.logoutAsync: ', message);
        Alert.alert(message);
      }
    },

    signInAnonymously: () => {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        console.log('Error: signInAnonymously', message);
        Alert.alert(message);
      }
    },
  },
};

function upgradeWithTokenAndProvider(token, provider) {
  const credential = provider.credential(token);
  return firebase.auth().currentUser.linkWithCredential(credential);
}

function signInWithTokenAndProvider(token, provider) {
  const credential = provider.credential(token);
  return firebase.auth().signInWithCredential(credential);
}

export default auth;
