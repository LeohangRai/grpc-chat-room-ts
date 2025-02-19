import { ChatMessage } from '@protos/chatroom_pb';

export class UserChatRoomMessageQueue {
  private msgQueue: ChatMessage[] = [];
  private userId: string;
  private roomName: string;

  constructor(userId: string, roomName: string) {
    this.userId = userId;
    this.roomName = roomName;
  }

  addMessage(msg: ChatMessage): void {
    this.msgQueue.push(msg);
  }

  getMessageCount(): number {
    return this.msgQueue.length;
  }

  getNextMessage(): ChatMessage | null {
    return this.msgQueue.length > 0 ? this.msgQueue.shift()! : null;
  }

  getRoomName(): string {
    return this.roomName;
  }

  getUserId(): string {
    return this.userId;
  }
}
