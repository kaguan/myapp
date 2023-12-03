import { Injectable, Query } from '@angular/core';
import SendBird from 'sendbird';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
          
export class ChatService {
    constructor(private http: HttpClient) {
      //this.sendbird = new SendBird({ appId: '3E5D9881-2E39-4986-992A-C9CD45E1B5D4' });
    }
    sb: any;
    user: SendBird.User;
     // https://dashboard.sendbird.com
    APP_ID = '3E5D9881-2E39-4986-992A-C9CD45E1B5D4';
    API_TOKEN = '3d44fed23ea8ee5368ba21325cf6e08cd981e3f7';

    init() {
        this.sb = new SendBird({ appId: this.APP_ID });
        SendBird.setLogLevel(SendBird.LogLevel.ERROR);
    }
    connect(userId: string, token: any, callback: any) {
        this.sb.connect(userId, this.API_TOKEN, (user: any, error: any) => {
            callback(user, error);
        });
    }

    isConnected() {
        return this.sb && this.sb.currentUser && this.sb.currentUser.userId;
    }

    getConnectedUser() {
        return this.sb && this.sb.currentUser ? this.sb.currentUser : null;
    }

    authenticateUser(userId: string): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        this.sb.connect(userId, (user: SendBird.User, error: SendBird.SendBirdError) => {
          if (error) {
            reject(error);
          } else {
            this.user = user;
            resolve();
          }
        });
      });
    }

    getSendbirdInstance(): SendBird.SendBirdInstance {
      return this.sb;
    }
  
    getCurrentUser(): SendBird.User {
      return this.user;
    }
    
    createUser(user_id: string, nickname: string, profile_url: string): Observable<any> {
      const apiUrl = `https://api-3E5D9881-2E39-4986-992A-C9CD45E1B5D4.sendbird.com/v3/users`;
      const apiToken = this.API_TOKEN;

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Api-Token': apiToken
      });

      const body = {
        user_id: user_id,
        nickname: nickname,
        profile_url: profile_url
      };

      return this.http.post(apiUrl, JSON.stringify(body), {headers});
    }

    deleteUser(userId: string) {
      const url = `https://api-3E5D9881-2E39-4986-992A-C9CD45E1B5D4.sendbird.com/v3/users/${userId}`;
      const apiToken = this.API_TOKEN;

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Api-Token': apiToken
      });

      this.http.delete(url, { headers }).subscribe(
        (response) => {
          console.log('User deleted successfully', response);
        },
        (error) => {
          console.error('Failed to delete user', error);
        }
      );
    }

    registerEventHandlers(UNIQUE_HANDLER_ID: string, callback: any) {
        var channelHandler = new this.sb.ChannelHandler();

        channelHandler.onMessageReceived = (channel: any, message: any) => {
          callback({
            event: 'onMessageReceived',
            data: {
              channel,
              message,
            },
          });
        };
        // channelHandler.onMessageUpdated = function (channel, message) {};
        // channelHandler.onMessageDeleted = function (channel, messageId) {};
        // channelHandler.onMentionReceived = function (channel, message) {};
        // channelHandler.onChannelChanged = function (channel) {};
        // channelHandler.onChannelDeleted = function (channelUrl, channelType) {};
        // channelHandler.onChannelFrozen = function (channel) {};
        // channelHandler.onChannelUnfrozen = function (channel) {};
        // channelHandler.onMetaDataCreated = function (channel, metaData) {};
        // channelHandler.onMetaDataUpdated = function (channel, metaData) {};
        // channelHandler.onMetaDataDeleted = function (channel, metaDataKeys) {};
        // channelHandler.onMetaCountersCreated = function (channel, metaCounter) {};
        // channelHandler.onMetaCountersUpdated = function (channel, metaCounter) {};
        // channelHandler.onMetaCountersDeleted = function (channel, metaCounterKeys) {};
        // channelHandler.onChannelHidden = function (groupChannel) {};
        // channelHandler.onUserReceivedInvitation = function (groupChannel, inviter, invitees) {};
        // channelHandler.onUserDeclinedInvitation = function (groupChannel, inviter, invitee) {};
        // channelHandler.onUserJoined = function (groupChannel, user) {};
        // channelHandler.onUserLeft = function (groupChannel, user) {};
        // channelHandler.onDeliveryReceiptUpdated = function (groupChannel) {};
        // channelHandler.onReadReceiptUpdated = function (groupChannel) {};
        // channelHandler.onTypingStatusUpdated = function (groupChannel) {};
        // channelHandler.onUserEntered = function (openChannel, user) {};
        // channelHandler.onUserExited = function (openChannel, user) {};
        // channelHandler.onUserMuted = function (channel, user) {};
        // channelHandler.onUserUnmuted = function (channel, user) {};
        // channelHandler.onUserBanned = function (channel, user) {};
        // channelHandler.onUserUnbanned = function (channel, user) {};
        // channelHandler.onChannelMemberCountChanged = function (channels) {};
        // channelHandler.onChannelParticipantCountChanged = function (channels) {};

        // Add this channel event handler to the `SendBird` instance.
        this.sb.addChannelHandler(UNIQUE_HANDLER_ID, channelHandler);
    }

    createGroupChannel(
        channelName: string,
        userIds: Array<string>,
        callback: any
      ) {
        const params = new this.sb.GroupChannelParams();
        params.addUserIds();
        params.addUserIds(userIds);
        params.name = channelName;
        this.sb.GroupChannel.createChannel(
          params,
          (groupChannel: SendBird.GroupChannel, error: SendBird.SendBirdError) => {
            callback(error, groupChannel);
          }
        );
    }

    createGlobalChat(
        channelName: string,
        userIds: Array<string>,
        callback: any
        ) {
        const params = new this.sb.GroupChannelParams();
        params.isSuper = true;
        params.addUserIds(userIds);
        params.name = channelName;
        this.sb.GroupChannel.createChannel(
          params, 
          (groupChannel: SendBird.GroupChannel, error: SendBird.SendBirdError) => {
            callback(error, groupChannel);
          }
        );
    }
    
    
    getGlobalChat(): Promise<SendBird.GroupChannel> {
      const channelUrl = 'sendbird_group_channel_301359777_5da333fd7478c2ebffe06b7e5965b55b81173370';
      return this.sb.GroupChannel.getChannel(channelUrl).then((channel: SendBird.GroupChannel) => {
        console.log(channel);
        return channel;
      });
    }

    getMyGroupChannels(UserId: any, callback: any) {
        const listQuery = this.sb.GroupChannel.createMyGroupChannelListQuery(UserId);
        listQuery.includeEmpty = true;
        listQuery.memberStateFilter = 'joined_only';
        listQuery.order = 'latest_last_message';
        listQuery.limit = 15; // The value of pagination limit could be set up to 100.
        if (listQuery.hasNext) {
          listQuery.next((groupChannels: any, error: any) => {
            callback(error, groupChannels);
          });
        }
    }

    getMessagesFromChannel(groupChannel: SendBird.GroupChannel, callback: any) {
        const listQuery = groupChannel.createPreviousMessageListQuery();
        listQuery.limit = 100;
        listQuery.includeMetaArray = true;
        listQuery.includeParentMessageInfo = true;
        // Retrieving previous messages.
        listQuery.load((messages, error) => {
          callback(error, messages);
        });
    }

    //changes to get the conversations in real time
    getMessages(channel: SendBird.GroupChannel, callback: any) {
      const listQuery = channel.createPreviousMessageListQuery();
      //listQuery.limit = 100; // Adjust the limit as needed.
      listQuery.reverse = true; // Get the latest messages first.
      listQuery.includeMetaArray = true;
      listQuery.includeParentMessageInfo = true;
  
      listQuery.load((messages, error) => {
          if (!error) {
              callback(messages, null);
          } else {
              callback(null, error);
          }
      });
    }
  
    sendMessage(
        channel: SendBird.GroupChannel | SendBird.OpenChannel,
        message: string,
        callback: any
      ) {
        const params = new this.sb.UserMessageParams();
        params.message = message;
        channel.sendUserMessage(params, (userMessage, error) => {
          callback(error, userMessage);
        });
    }

    
  inviteUser(channel: SendBird.GroupChannel, userIds: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      channel.inviteWithUserIds(userIds, (response: any, error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // inviteUsersToSupergroupChannel(userIds: string[]): void {
  //   const supergroupChannel = this.sb.GroupChannel.getChannel('sendbird_group_channel_301359777_5da333fd7478c2ebffe06b7e5965b55b81173370') as SendBird.SupergroupChannel;
  //   supergroupChannel.addMembers(userIds, (response, error) => {
  //     if (error) {
  //       console.error('Failed to invite users:', error);
  //       return;
  //     }

  //     console.log('Users invited successfully:', response);
  //   });
  // }
}