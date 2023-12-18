import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ChatService } from '../services/chat.service';
import SendBird from 'sendbird';

@Component({
  selector: 'app-chatpage',
  templateUrl: './chatpage.component.html',
  styleUrls: ['./chatpage.component.css']
})
export class ChatpageComponent {
  title = 'myapp';

  connected = false;
  listConversationsResult: string | null;
  selectedChannel: SendBird.GroupChannel;
  messages: Array<SendBird.UserMessage | SendBird.AdminMessage> | null;
  startConversationResult: string;
  conversations: Array<SendBird.GroupChannel>;
  textMessage: any;
  userId = 'tested3';
  userNickname = '123';
  searchQuery: string;
  filteredChannels: any[];
  autocompleteResults: any[];
  showAutocomplete: boolean;
  joinUserIds: any[];

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
    //this.chatService.init();
    //changes to get the conversations in real time
    this.connect();
    // const sendbird = this.chatService.getSendbirdInstance();
    //this.chatService.authenticateUser('sendbird')
    this.registerEventHandlers();
    this.getMyConversations();
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
    this.chatService.getMyGroupChannels('sendbird',
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

  joinChannel(channel: SendBird.GroupChannel){
    console.log("join channel");
    
  }
}
