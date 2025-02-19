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
/* instead of using room registration as a unary API example, implement a unary client that provides stats regarding the number of active chat rooms or number of users in a particular chat-room, and so on */
const request = new RoomRegistrationRequest();
request.setRoomName('general');
client.registerToRoom(request, (err, response) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Room Joined:', response.getIsJoined());
  }
});
