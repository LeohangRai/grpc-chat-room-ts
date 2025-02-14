import 'module-alias/register';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ReflectionService } from '@grpc/reflection';
import { ChatRoomService } from '@protos/chatroom_grpc_pb';
import config from 'config';
import path from 'path';
import { registerToRoom, sendNewsUpdate } from '../services/chat-room.service';

const PORT = config.get<string>('app.port') || '50051';

const server = new grpc.Server();
server.addService(ChatRoomService, {
  registerToRoom,
  sendNewsUpdate,
});
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      return console.error(err);
    }
    console.info(`Server is running at http://127.0.0.1:${port}`);
  }
);

/* 
  enable server reflection 
  https://grpc.io/docs/guides/reflection/
*/
const pkgDefinition = protoLoader.loadSync(
  path.join(__dirname, '../../protos/chatroom.proto')
);
const reflection = new ReflectionService(pkgDefinition);
reflection.addToServer(server);
