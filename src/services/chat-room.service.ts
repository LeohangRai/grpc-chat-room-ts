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
import { MessagesQueue } from '../queue/message-queue';

export class ChatRoomServer implements IChatRoomServer {
  /* had to do this because `IChatRoomServer extends grpc.UntypedServiceImplementation` */
  [name: string]: grpc.UntypedHandleCall;

  registerToRoom(
    _call: ServerUnaryCall<RoomRegistrationRequest, RoomRegistrationResponse>,
    callback: sendUnaryData<RoomRegistrationResponse>
  ) {
    const roomId = Math.floor(Math.random() * 100);
    const response = new RoomRegistrationResponse();
    response.setRoomId(roomId);
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
      MessagesQueue.addNewsToQueue(request);
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
      if (MessagesQueue.getMessagesCount()) {
        const nextMessage = MessagesQueue.getNextMessage();
        call.write(nextMessage!);
      }
      await new Promise((resolve) => setTimeout(resolve, 200)); // in order to avoid blocking
    }
  }
}
