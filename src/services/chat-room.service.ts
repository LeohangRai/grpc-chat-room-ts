import * as grpc from '@grpc/grpc-js';
import {
  sendUnaryData,
  ServerReadableStream,
  ServerUnaryCall,
  ServerWritableStream,
} from '@grpc/grpc-js';
import { IChatRoomServer } from '@protos/chatroom_grpc_pb';
import {
  ChatMessage,
  NewsStreamStatus,
  NewsUpdate,
  RoomRegistrationRequest,
  RoomRegistrationResponse,
} from '@protos/chatroom_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { MessageQueue } from '../queue/message.queue';

export class ChatRoomServer implements IChatRoomServer {
  /* had to do this because `IChatRoomServer extends grpc.UntypedServiceImplementation` */
  [name: string]: grpc.UntypedHandleCall;

  registerToRoom(
    call: ServerUnaryCall<RoomRegistrationRequest, RoomRegistrationResponse>,
    callback: sendUnaryData<RoomRegistrationResponse>
  ) {
    const response = new RoomRegistrationResponse();
    const userId = call.request.getUserId();
    const roomName = call.request.getRoomName();
    MessageQueue.createUserChatRoomMessageQueue(userId, roomName);
    response.setIsJoined(true);
    callback(null, response);
  }

  sendNewsUpdate(
    call: ServerReadableStream<NewsUpdate, NewsStreamStatus>,
    callback: sendUnaryData<NewsStreamStatus>
  ) {
    call.on('data', (request: NewsUpdate) => {
      console.log('\nReceived news update:');
      console.log('Title:', request.getNewsTitle());
      console.log('Content:', request.getNewsContent());
      console.log('Timestamp:', request.getTimestamp()?.toDate());
      MessageQueue.addNewsUpdate(request);
    });
    call.on('error', (error) => {
      console.error(error);
      callback(error, null);
    });
    call.on('end', () => {
      const response = new NewsStreamStatus();
      response.setIsSuccessful(true);
      callback(null, response);
    });
  }

  async monitorChatRoom(call: ServerWritableStream<Empty, ChatMessage>) {
    while (!call.cancelled) {
      if (MessageQueue.getChatMonitoringMessageCount()) {
        const nextMessage = MessageQueue.getNextChatMonitoringMessage();
        call.write(nextMessage!);
      }
      await new Promise((resolve) => setTimeout(resolve, 200)); // in order to avoid blocking
    }
  }

  async chat(call: grpc.ServerDuplexStream<ChatMessage, ChatMessage>) {
    let userId: string | null = null;
    let roomName: string | null = null;
    call.on('data', (request: ChatMessage) => {
      userId = request.getUserId();
      roomName = request.getRoomName();
      console.log('Server received chat message:');
      console.log({
        userId,
        roomName,
      });
      console.log('Message:', request.getMessage());
      /* only adds a queue if it does not exist previously */
      MessageQueue.createUserChatRoomMessageQueue(userId, roomName);
      MessageQueue.addMessageToRoom(request);
    });
    call.on('error', (error) => {
      console.error(error);
    });
    call.on('end', () => {
      call.end();
    });
    while (!call.cancelled) {
      if (
        userId &&
        roomName &&
        MessageQueue.getChatRoomMessageCountForUserId(userId)
      ) {
        const nextMessage = MessageQueue.getChatRoomMessageForUserId(userId);
        console.log('next message:', nextMessage);
        call.write(nextMessage!);
      }
      await new Promise((resolve) => setTimeout(resolve, 400)); // in order to avoid blocking
    }
  }
}
