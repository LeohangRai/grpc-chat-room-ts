import 'module-alias/register';
import * as grpc from '@grpc/grpc-js';
import { ChatRoomClient } from '@protos/chatroom_grpc_pb';
import { ChatMessage } from '@protos/chatroom_pb';
import config from 'config';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';

const PORT = config.get<string>('app.port') || '50051';

const client = new ChatRoomClient(
  `localhost:${PORT}`,
  grpc.credentials.createInsecure()
);
const call = client.monitorChatRoom(new Empty());
call.on('data', (response: ChatMessage) => {
  console.log('\nReceived message:');
  console.log('Message:', response.getMessage());
  console.log('User:', response.getUser());
  console.log('Timestamp:', response.getTimestamp()?.toDate());
});

call.on('error', (error) => {
  console.error(error);
  call.cancel();
});
