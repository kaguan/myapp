import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ChatService } from './services/chat.service';
import SendBird from 'sendbird';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',  
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'myapp';

  connected = false;
  listConversationsResult: string | null;
  globalChannel: SendBird.GroupChannel;
  selectedChannel: SendBird.GroupChannel;
  messages: Array<SendBird.UserMessage | SendBird.AdminMessage> | null;
  startConversationResult: string;
  conversations: Array<SendBird.GroupChannel>;
  textMessage: any;
  userId = 'help';
  userNickname = '123';
  searchQuery: string;
  filteredChannels: any[];
  autocompleteResults: any[];
  showAutocomplete: boolean;
  joinUserIds: string[];
  autoAcceptInvite = false;

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}
  @ViewChild('messageList') private messageList: ElementRef;

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    // Call the SendBirdService to get the list of channels
    const channels = this.conversations;
    // Filter the channels based on the search value
    return channels.filter(channel => channel.name.toLowerCase().includes(filterValue));
  }

  ngOnInit() {
    this.chatService.init();
    //changes to get the conversations in real time
    //this.connect();
    // const sendbird = this.chatService.getSendbirdInstance();
    this.chatService.authenticateUser('sendbird')
    //console.log(this.chatService.sb.getConnectionState())
    this.registerEventHandlers();
    this.getMyConversations();
    console.log(this.chatService.sb.getConnectionState())
  }

  connect() {
    this.chatService.connect('sendbird', '3d44fed23ea8ee5368ba21325cf6e08cd981e3f7', (error: any, user: any) => {
      if (!error) {
        // We are connected to Sendbird servers!
        // this.registerEventHandlers();
        // this.getMyConversations();
        this.connected = true;
      }
    });
  }

  createUser() {
    this.chatService.createUser(this.userId, this.userNickname, '').subscribe(
      response => {
        console.log('User created successfully:', response);
        // Handle the response or perform any additional actions
      },
      error => {
        console.error('Error creating user:', error);
        // Handle the error or display an error message
      }
    );
    this.chatService.getGlobalChat().then((channel: SendBird.GroupChannel) => {
      this.globalChannel = channel;
      this.joinUserIds = [this.userId];
      console.log(this.joinUserIds, this.globalChannel)
      this.chatService.inviteUser(this.globalChannel, this.joinUserIds)
      .then(response => {
        console.log('Users invited successfully:', response);
      })
      .catch(error => {
        console.error('Failed to invite users:', error);
      });
    }).catch((error: any) => {
      // Handle any errors that occur during the retrieval
      console.error('Failed to retrieve global chat:', error);
    });
  }


  deleteUser() {
    this.chatService.deleteUser(this.userId)
  }

  registerEventHandlers() {
    this.chatService.registerEventHandlers(
      '123',
      (data: { event: string; data: any }) => {
        console.log('New event: ' + data.event, data.data);
        if (this.selectedChannel) {
          if (data.event == 'onMessageReceived' && this.messages) {
            if (data.data.channel.url == this.selectedChannel.url) {
              this.messages.push(data.data.message);
              this.cdr.detectChanges();
              this.scrollToBottom();
            }
          }
        }
      }
    );
  }

  startConversation() {
    let channelName = 'android-tutorial';
    let userIds = [this.userId, '01'];
    this.chatService.createGroupChannel(
      channelName,
      userIds,
      (error: SendBird.SendBirdError, groupChannel: SendBird.GroupChannel) => {
        if (error) {
          this.startConversationResult = 'Error creating the conversation';
        } else {
          this.startConversationResult = 'Conversation created';
          this.getMyConversations();

          //changes to get the conversations in real time
          this.chatService.getMessages(groupChannel, (error: SendBird.SendBirdError, messages: any) => {
            if (!error) {
                this.messages = messages;
            }
        });
        }
      }
    );
  }

  getMyConversations() {
    this.chatService.getMyGroupChannels(this.userId,
      (
        error: SendBird.SendBirdError,
        groupChannels: Array<SendBird.GroupChannel>
      ) => {
        if (error) {
          this.listConversationsResult = 'Unable to get your conversations';
        } else {
          this.conversations = groupChannels;
        }
      }
    );
  }

  getMessages(channel: SendBird.GroupChannel) {
    this.selectedChannel = channel;
    console.log(this.selectedChannel);
    this.chatService.getMessagesFromChannel(
      channel,
      (
        error: SendBird.SendBirdError,
        messages: Array<
          SendBird.UserMessage | SendBird.AdminMessage
        >
      ) => {
        if (!error) {
          this.messages = messages;
        }
      }
    );
  }

  updateTextMessage(event: any) {
    const value = event.target.value;
    if (!value || !this.selectedChannel) {
      return;
    }
    this.textMessage = value;
  }

  sendMessage() {
    this.chatService.sendMessage(
      this.selectedChannel,
      this.textMessage,
      (error: SendBird.SendBirdError, userMessage: SendBird.UserMessage) => {
        this.getMessages(this.selectedChannel);
      }
    );
  }

  scrollToBottom() {
    if (this.messageList) {
      const element = this.messageList.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  search(event: any) {
    //console.log(event.target.value);
    this.filteredChannels = this.conversations.filter(channel => {
      return channel.name.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
    this.autocompleteResults = this.conversations.filter(channel => {
      return channel.name.toLowerCase().startsWith(this.searchQuery.toLowerCase());
    });
    this.showAutocomplete = this.searchQuery.length > 0 && this.autocompleteResults.length > 0;
  }

  selectAutocomplete(channel: any) {
    this.searchQuery = channel.name;
    this.filteredChannels = this.conversations.filter(c => c.name === channel.name);
    this.showAutocomplete = false;
  }

  inviteUser() {
    const userIds = ['02', '03'];
    this.chatService.inviteUser(this.selectedChannel, userIds)
      .then(response => {
        console.log('Users invited successfully:', response);
      })
      .catch(error => {
        console.error('Failed to invite users:', error);
      });
  }

  acceptInvite() {

  }

  declineInvite() {

  }

  createGlobalChat() {
    let channelName = "Global Chat";
    let userIds = [this.userId, '01'];
    this.chatService.createGlobalChat(
      channelName, 
      userIds, 
      (error: SendBird.SendBirdError, groupChannel: SendBird.GroupChannel) => {
        if (error) {
          console.error('Error creating supergroup:', error);
        } else {
          console.log('Supergroup created:', groupChannel);
        }
      }
    );
  }

  leaveChannel() {
    this.chatService.leaveChannel(this.selectedChannel, this.userId);
  }
}

