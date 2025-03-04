import React from 'react';
import { connect } from 'react-redux';
import { dispatch } from '../rematch/dispatch';
import { View, Text } from 'react-native';
import Meta from '../constants/Meta';
import Fire from '../Fire';
import IdManager from '../IdManager';
import Images from '../Images';
import NavigationService from '../navigation/NavigationService';
import firebase from 'expo-firebase-app';
import EmptyListMessage from './EmptyListMessage';
import MessageRow from './MessageRow';
import UserList from './UserList';
import tabBarImage from './Tabs/tabBarImage';
import Assets from '../Assets';
// import SwipeableListRow from './primitives/SwipeableListRow';
import NewMatchesCarousel from './NewMatchesCarousel';
import Settings from '../constants/Settings';
class MessageList extends React.Component {
  state = {
    refreshing: false,
    loadCount: 0,
  };

  componentDidMount() {
    dispatch.notifications.registerAsync();

    if (Settings.debugGoToChat) {
      NavigationService.navigateToUserSpecificScreen(
        'ReportUser',
        'fHgE92IvgLbUmbG2nU7DOyLsk5e2',
      );
    }
  }

  componentWillReceiveProps({ badgeCount }) {
    if (badgeCount !== this.props.badgeCount) {
      firebase.messaging().setBadgeNumber(badgeCount);
    }
  }

  onRefresh = async () => {
    this.setState(
      { refreshing: true, loadCount: this.state.loadCount + 1 },
      async () => {
        await Fire.shared.getMessageList(true, this.state.loadCount % 3 === 0);
        this.setState({ refreshing: false });
      },
    );
  };

  renderItem = ({
    item: { name, image, isSeen, isOutgoing, message, timeAgo, groupId },
  }) => (
    <MessageRow
      name={name}
      image={image}
      isSeen={isSeen}
      isOutgoing={isOutgoing}
      message={message}
      timeAgo={timeAgo}
      groupId={groupId}
    />
  );
  // <SwipeableListRow
  //     onSelect={direction => {
  //       if (direction === 'right') {
  //         setTimeout(() => {
  //           Fire.shared.deleteMessageThread(groupId);
  //         }, 1000);
  //       }
  //     }}
  //   ></SwipeableListRow>

  render() {
    const { style, data } = this.props;
    return (
      <UserList
        ListHeaderComponent={CustomNewMatchesCarousel}
        style={style}
        data={data}
        refreshing={this.state.refreshing}
        onRefresh={this.onRefresh}
        renderItem={this.renderItem}
        ListEmptyComponent={MessagesEmptyListMessage}
      />
    );
  }
}

function CustomNewMatchesCarousel(props) {
  return (
    <View>
      <NewMatchesCarousel />
      <Text
        style={{
          marginHorizontal: 16,
          marginTop: 4,
          marginBottom: 12,
          textAlign: 'left',
          color: 'black',
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        Messages
      </Text>
    </View>
  );
}

const MessagesEmptyListMessage = () => (
  <EmptyListMessage
    onPress={() => dispatch.users.messageRandom()}
    image={Images.empty.messages}
    buttonTitle={Meta.no_messages_action}
    title={Meta.no_messages_title}
    subtitle={Meta.no_messages_subtitle}
  />
);

const MessageScreen = connect(
  ({ messages = {} }) => {
    const badgeCount = 0;
    return {
      data: Object.values(messages),
      badgeCount,
    };
  },
  {},
)(MessageList);

MessageScreen.navigationOptions = {
  title: 'Chat',
  tabBarIcon: tabBarImage({
    active: Assets.images.chat_active,
    inactive: Assets.images.chat_inactive,
  }),
};

export default MessageScreen;
