import Fire from '../Fire';
import { filterUser } from './users';
import { dispatch } from './dispatch';

const popular = {
  state: {},
  reducers: {
    update: (state, { uid, user }) => {
      const _uid = uid || user.uid;
      const { [_uid]: currentUser = {}, ...otherUsers } = state;
      return {
        ...otherUsers,
        [_uid]: { ...currentUser, ...user },
      };
    },
    clear: () => ({}),
  },
  effects: {
    getAsync: async (props = {}) => {
      const { size = 2, start } = props;
      return;

      // TODO: Pull users into redux.users then host them here...
      // TODO: Just get the IDs of the popular people, maybe through https
      const { data, cursor } = await Fire.shared.getUsersPaged({
        size,
        start,
        orderBy: 'lastLoginAt',
      });
      for (const user of data) {
        dispatch.popular.update({ user: filterUser(user) });
      }
    },
  },
};
export default popular;
