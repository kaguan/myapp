import { Component,ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';


@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent {
  title = 'myapp';
  @ViewChild('messageInput', { static: false }) messageInputRef: ElementRef;
  
  connected = false;
  listConversationsResult: string | null;
  selectedChannel: SendBird.GroupChannel;
  messages: Array<SendBird.UserMessage | SendBird.AdminMessage> | null;
  startConversationResult: string;
  conversations: Array<SendBird.GroupChannel> | null;
  textMessage: any;

  constructor(private chatService: ChatService) {}
  messageText: string = '';
 
  selectedChannelName: string;

  ngOnInit() {
    this.chatService.init();
    this.connect();
    this.startConversation();
  }

  connect() {
    this.chatService.connect('sendbird', null, (error: any, user: any) => {
      if (!error) {
        // We are connected to Sendbird servers!
        this.registerEventHandlers();
        this.getMyConversations();
        this.connected = true;
      }
    });
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
            }
          }
        }
      }
    );
  }

  startConversation() {
    let channelName = 'android-tutorial';
    let userIds = ['01'];
    this.chatService.createGroupChannel(
      channelName,
      userIds,
      (error: SendBird.SendBirdError, groupChannel: SendBird.GroupChannel) => {
        if (error) {
          this.startConversationResult = 'Error creating the conversation';
        } else {
          this.startConversationResult = 'Conversation created';
          this.getMyConversations();
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
          this.selectedChannelName = channel.name;
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
    if (this.textMessage.trim() !== '') {
      this.chatService.sendMessage(
        this.selectedChannel,
        this.textMessage,
        (error: SendBird.SendBirdError, userMessage: SendBird.UserMessage) => {
          this.getMessages(this.selectedChannel);
          this.textMessage = ''; // Clear the input text
          this.messageInputRef.nativeElement.value = ''; // Clear the input value
          this.messageInputRef.nativeElement.focus(); // Focus the input again
        }
      );
    }
  }
  
  formatTimestamp(timestamp: number) {
    const date = new Date(timestamp);
      // Format the month abbreviation (e.g., Oct)
  const monthAbbreviation = date.toLocaleString('default', { month: 'short' });

  // Format the day with a leading zero (e.g., 09)
  const day = ('0' + date.getDate()).slice(-2);

  // Format the year (e.g., 2023)
  const year = date.getFullYear();

  // Format the hours (1-12) and minutes (e.g., 9:30)
  const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const time = `${hours}:${minutes}`;

  // Format the AM/PM indicator (e.g., am/pm)
  const ampm = date.getHours() < 12 ? 'am' : 'pm';

  // Combine the formatted parts into the desired format
  const formattedTimestamp = `${monthAbbreviation}. ${day} ${year} | ${time}${ampm}`;

    return formattedTimestamp;
  }
  


}
