import { Permissions } from 'expo';
import { Linking } from 'react-native';

export default async function getPermission(permission) {
  const { status } = await Permissions.askAsync(permission);
  if (status !== 'granted') {
    Linking.openURL('app-settings:');
    return false;
  }
  return true;
}
