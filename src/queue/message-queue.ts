import { ChatMessage, NewsUpdate } from '@protos/chatroom_pb';

export class MessagesQueue {
  private static queue: ChatMessage[] = [];

  static addNewsToQueue(newsUpdate: NewsUpdate): void {
    const chatMessage = new ChatMessage();
    chatMessage.setMessage(newsUpdate.getNewsTitle());
    this.queue.push(chatMessage);
  }

  static getNextMessage(): ChatMessage | null {
    return this.queue.length > 0 ? this.queue.shift()! : null;
  }

  static getMessagesCount(): number {
    return this.queue.length;
  }
}
