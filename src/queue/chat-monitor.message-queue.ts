import { ChatMessage } from '@protos/chatroom_pb';

export class ChatMonitorMessageQueue {
  private queue: ChatMessage[] = [];

  addMessage(msg: ChatMessage): void {
    this.queue.push(msg);
  }
  getNextMessage(): ChatMessage | null {
    return this.queue.length > 0 ? this.queue.shift()! : null;
  }

  getMessageCount(): number {
    return this.queue.length;
  }
}
