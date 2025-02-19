import { ChatMessage, NewsUpdate } from '@protos/chatroom_pb';
import { ChatMonitorMessageQueue } from './chat-monitor.message-queue';
import { UserChatRoomMessageQueue } from './user-chat-room.message.queue';

export class MessageQueue {
  private static chatRoomMsgQueue: UserChatRoomMessageQueue[] = [];
  private static chatMonitoringMsgQueue = new ChatMonitorMessageQueue();

  public static createUserChatRoomMessageQueue(
    userId: string,
    roomName: string
  ): void {
    const queueAlreadyExists = this.chatRoomMsgQueue.find(
      (r) => r.getRoomName() === roomName && r.getUserId() === userId
    );
    if (queueAlreadyExists) {
      return;
    }
    this.chatRoomMsgQueue.push(new UserChatRoomMessageQueue(userId, roomName));
  }

  public static addMessageToRoom(msg: ChatMessage) {
    const roomName = msg.getRoomName();
    const userId = msg.getUserId();
    this.chatRoomMsgQueue
      .filter((q) => q.getRoomName() === roomName && q.getUserId() !== userId) // get message queues for other users in the room
      .forEach((q) => q.addMessage(msg));
    this.chatMonitoringMsgQueue.addMessage(msg);
  }

  public static addNewsUpdate(news: NewsUpdate) {
    const msg = new ChatMessage();
    msg.setMessage(
      JSON.stringify({
        title: news.getNewsTitle(),
        content: news.getNewsContent(),
      })
    );
    this.chatRoomMsgQueue.forEach((q) => q.addMessage(msg));
    this.chatMonitoringMsgQueue.addMessage(msg);
  }

  public static getChatRoomMessageCountForUserId(userId: string): number {
    const queue = this.chatRoomMsgQueue.find((q) => q.getUserId() === userId);
    return queue?.getMessageCount() || 0;
  }

  public static getChatRoomMessageForUserId(
    userId: string
  ): ChatMessage | null {
    const queue = this.chatRoomMsgQueue.find((q) => q.getUserId() === userId);
    return queue?.getNextMessage() || null;
  }

  public static getChatMonitoringMessageCount(): number {
    return this.chatMonitoringMsgQueue.getMessageCount();
  }

  public static getNextChatMonitoringMessage(): ChatMessage | null {
    return this.chatMonitoringMsgQueue.getNextMessage();
  }
}
