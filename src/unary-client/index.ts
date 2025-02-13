import 'module-alias/register';
import * as grpc from '@grpc/grpc-js';
import { ChatRoomClient } from '@protos/chatroom_grpc_pb';
import { RoomRegistrationRequest } from '@protos/chatroom_pb';
import config from 'config';

const PORT = config.get<string>('app.port') || '50051';

const client = new ChatRoomClient(
  `localhost:${PORT}`,
  grpc.credentials.createInsecure()
);
const request = new RoomRegistrationRequest();
request.setRoomName('general');
client.registerToRoom(request, (err, response) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Room ID:', response.getRoomId());
  }
});
