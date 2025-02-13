import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import {
  RoomRegistrationRequest,
  RoomRegistrationResponse,
} from '@protos/chatroom_pb';

export function registerToRoom(
  _call: ServerUnaryCall<RoomRegistrationRequest, RoomRegistrationResponse>,
  callback: sendUnaryData<RoomRegistrationResponse>
) {
  const roomId = Math.floor(Math.random() * 100);
  const response = new RoomRegistrationResponse();
  response.setRoomId(roomId);
  callback(null, response);
}
