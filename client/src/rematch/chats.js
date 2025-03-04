'use-strict';

import { dispatch } from './dispatch';
import firebase from 'expo-firebase-app';
import Fire from '../Fire';
import { FieldValue } from 'expo-firebase-firestore';

const firstCursorCollection = {};

const cursorCollection = {};

function transformMessageForGiftedChat({ message, user }) {
  const { key: _id, uid, timestamp: createdAt, ...existingMessage } = message;
  console.log('TRANSFORMERESS', user);

  const _userObject = { name: user.name, _id: uid };

  if (user.image && user.image !== '') {
    _userObject.avatar = user.image;
  }
  return {
    ...existingMessage,
    _id,
    createdAt,
    user: _userObject,
  };
}

const chats = {
  state: {
    // [groupId]: {}
  },
  reducers: {
    update: (state, payload) => ({ ...state, ...payload }),
    set: (state, payload) => payload,
    removeMessage: (state, { groupId, messageId }) => {
      if (!groupId || !messageId) {
        return state;
      }
      const { [groupId]: currentMessages = {}, ...nextState } = state;
      const { [messageId]: messageToRemove, ...messages } = currentMessages;
      return {
        ...nextState,
        [groupId]: messages,
      };
    },
    removeGroup: (state, { groupId }) => {
      if (!groupId || !(groupId in state)) {
        return state;
      }
      const { [groupId]: groupToRemove, ...nextState } = state;
      return {
        ...nextState,
      };
    },
    addMessages: (state, { groupId, messages }) => {
      if (!groupId || !messages) {
        return state;
      }
      const { [groupId]: currentMessages = {}, ...nextState } = state;
      // TODO: So bad, don't sort every time.
      const nextMessages = { ...currentMessages, ...messages };
      // .sort(
      //   (a, b) => a.createdAt < b.createdAt,
      // );
      return {
        ...nextState,
        [groupId]: nextMessages,
      };
    },
    clear: (state, { uid }) => ({ ...state, [uid]: undefined }),
  },
  effects: {
    subscribeToChannel: () => {
      console.warn('TODO: subscribeToChannel');
    },
    deleteMessageFromChannel: async ({
      groupId,
      messageId,
      storagePath,
      resolve,
      reject,
    }) => {
      try {
        dispatch.chats.removeMessage({ groupId, messageId });
        await Fire.shared
          .getMessagesCollection(groupId)
          .doc(messageId)
          .delete();

        if (storagePath) {
          await firebase
            .storage()
            .ref(storagePath)
            .delete();
        }

        if (resolve) {
          resolve();
        }
      } catch (error) {
        if (reject) {
          reject(error);
        } else {
          throw error;
        }
      }
    },
    loadEarlier: () => {
      console.warn('TODO: loadEarlier');
    },
    updatedInputText: () => {
      console.warn('TODO: updatedInputText');
    },
    deleteChannel: async groupId => {
      console.log('deleteMessageThread: ', groupId);

      /* Remove a user's access to a message thread without giving them the ability to delete the other user's access */

      // TODO: Bacon: This is broken natively...

      // Fire.shared.getChatGroupDoc(groupId).update({
      //   members: FieldValue.arrayRemove(Fire.shared.uid),
      // });

      const groupChatDocRef = Fire.shared.getChatGroupDoc(groupId);

      try {
        await Fire.shared.db.runTransaction(transaction => {
          // This code may get re-run multiple times if there are conflicts.
          return transaction.get(groupChatDocRef).then(doc => {
            if (!doc.exists) {
              throw new Error('Document does not exist!');
            }
            const { members = [] } = doc.data();
            const userId = Fire.shared.uid;
            const membersWithoutCurrentUser = members.filter(
              uid => uid !== userId,
            );
            console.log('Deleting user:', {
              userId,
              members,
              membersWithoutCurrentUser,
            });
            transaction.update(groupChatDocRef, {
              members: membersWithoutCurrentUser,
            });
          });
        });

        dispatch.messages.remove({ id: groupId });
        dispatch.chats.removeGroup({ groupId });
      } catch (error) {
        console.log('deleteChannel', { error });
        alert(
          "Error: Couldn't delete the group at this time, please try again later.",
        );
      }
    },
    updatedGifOpened: () => {
      console.warn('TODO: updatedGifOpened');
    },
    _parseMessage: async ({ message, groupId }, { chats }) => {
      if (chats[groupId] && chats[groupId][message.key]) {
        // prevent duplicates.
        // throw new Error('Found duplicated ' + message.key + ' ' + groupId);
        console.log('FIXME: Duplicate');
        return;
      }
      const { uid } = message;
      if (!uid || uid === '') {
        throw new Error("Invalid UID, can't parse message");
      }

      // TODO: Nope...
      const user = await new Promise(res =>
        dispatch.users.ensureUserIsLoadedAsync({ uid, callback: res }),
      );
      console.log('_parseMessage: has user', !!user, uid);
      //   const user = await Fire.shared.getUserAsync({ uid });
      if (user == null) {
        throw new Error("Invalid User data found, can't parse message");
      }
      console.log('Add Message', message.key);

      const messages = {
        ...chats[groupId],
        [message.key]: transformMessageForGiftedChat({ message, user }),
      };

      dispatch.chats.addMessages({
        groupId,
        messages,
      });

      // / UGH

      const sortedMessages = Object.values(messages).sort(
        (a, b) => a.timestamp < b.timestamp,
      );
      dispatch.messages.updateWithMessage({
        groupId,
        message: sortedMessages[0],
      });
    },
    startChatting: async ({ uids, callback, groupId }, { chats }) => {
      console.log('start chatting', !chats[groupId]);
      if (!chats[groupId]) {
        const exists = await Fire.shared.ensureChatGroupExists(uids);
        console.log('startChatting.exists', exists);
        if (exists) {
          dispatch.chats.update({ [groupId]: {} });
        } else {
          throw new Error("Couldn't create chat group", groupId);
        }
      }
      let startAt;
      if (chats[groupId]) {
        startAt = Object.keys(chats[groupId]).length;
      }
      console.log({ startAt });
      const unsubscribe = Fire.shared.subscribeToChatGroup({
        groupId,
        cursor: (cursorCollection[groupId] || {}).ref,
      });
      callback(unsubscribe);
    },
    loadPrevious: async ({ groupId, callback }) => {
      if (firstCursorCollection[groupId]) {
        const startBefore = firstCursorCollection[groupId];
        firstCursorCollection[groupId] = undefined;
        Fire.shared.loadMoreFromChatGroup({ groupId, callback, startBefore });
      }
      // TODO: IDK
      callback(true);
    },
    receivedMessage: async (props = {}, { chats }) => {
      const { groupId, snapshot } = props;
      if (!chats[groupId]) {
        // TODO: This seems leaky... make sure receivedMessage is only called from a subscription
        // const exists = await Fire.shared.ensureChatGroupExists(groupId);
        // if (exists) {
        dispatch.chats.update({ [groupId]: {} });
        // }
        throw new Error(
          "Error: chats.receivedMessage: chat group doesn't exist yet.",
        );
      }

      if (!snapshot.docChanges) {
        throw new Error('Error: snapshot is invalid');
      }
      snapshot.docChanges.forEach(({ type, doc }) => {
        console.log('Found message: parseMessagesSnapshot: ', type, doc.id);
        if (type === 'added') {
          const message = { key: doc.id, ...doc.data() };
          dispatch.chats._parseMessage({ message, groupId });
        } else if (type === 'removed') {
          // removed
          const messageKey = doc.id;
          dispatch.chats.removeMessage({ messageKey, groupId });
          // TODO: Maybe remove
        } else {
          console.warn('TODO: parseMessagesSnapshot: ', type);
        }
      });
      if (!firstCursorCollection[groupId]) {
        firstCursorCollection[groupId] = snapshot.docs[0];
      }
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      if (lastVisible) {
        const lastTimestamp = lastVisible.data().timestamp;
        if (
          !cursorCollection[groupId] ||
          lastTimestamp > cursorCollection[groupId].timestamp
        ) {
          cursorCollection[groupId] = {
            ref: lastVisible,
            timestamp: lastTimestamp,
          };
        }
      }
    },
  },
};

export default chats;
