/* @flow */
import type { Action, UnreadHuddlesState } from '../types';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  MARK_MESSAGES_READ,
} from '../actionConstants';
import { getRecipientsIds } from '../utils/message';
import { addItemsToHuddleArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';

const initialState: UnreadHuddlesState = NULL_ARRAY;

export default (state: UnreadHuddlesState = initialState, action: Action): UnreadHuddlesState => {
  switch (action.type) {
    case REALM_INIT:
      return (action.data.unread_msgs && action.data.unread_msgs.huddles) || NULL_ARRAY;

    case ACCOUNT_SWITCH:
      return initialState;

    case EVENT_NEW_MESSAGE: {
      if (action.message.type !== 'private') {
        return state;
      }

      if (action.message.display_recipient.length < 3) {
        return state;
      }

      if (action.ownEmail && action.ownEmail === action.message.sender_email) {
        return state;
      }

      return addItemsToHuddleArray(
        state,
        [action.message.id],
        getRecipientsIds(action.message.display_recipient),
      );
    }
    case MARK_MESSAGES_READ:
      return removeItemsDeeply(state, action.messageIds);

    case EVENT_MESSAGE_DELETE:
      return removeItemsDeeply(state, [action.messageId]);

    case EVENT_UPDATE_MESSAGE_FLAGS: {
      if (action.flag !== 'read') {
        return state;
      }

      if (action.all) {
        return initialState;
      }

      if (action.operation === 'add') {
        return removeItemsDeeply(state, action.messages);
      } else if (action.operation === 'remove') {
        // we do not support that operation
      }

      return state;
    }

    default:
      return state;
  }
};
