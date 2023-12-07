import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ChatService } from './services/chat.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',  
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'myapp';

  connected = false;
  listConversationsResult: string | null;
  selectedChannel: SendBird.GroupChannel;
  messages: Array<SendBird.UserMessage | SendBird.AdminMessage> | null;
  startConversationResult: string;
  conversations: Array<SendBird.GroupChannel> | null;
  textMessage: any;
  userId = 'tested3';
  userNickname = '123';

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}
  @ViewChild('messageList') private messageList: ElementRef;

  ngOnInit() {
    this.chatService.init();
    //changes to get the conversations in real time
    this.connect();
    this.registerEventHandlers();
  }

  connect() {
    this.chatService.connect('sendbird', '3d44fed23ea8ee5368ba21325cf6e08cd981e3f7', (error: any, user: any) => {
      if (!error) {
        // We are connected to Sendbird servers!
        //changes to get the conversations in real time
        //this.registerEventHandlers();
        this.getMyConversations();
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

        if (data.event === 'onUserJoined') {
            alert(`User joined: ${data.data.user.nickname}`);
        }

        if (data.event === 'onUserLeft') {
          alert(`User left: ${data.data.user.nickname}`);
      }

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
    this.chatService.getMyGroupChannels(
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
}

