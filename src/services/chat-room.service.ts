import {
  sendUnaryData,
  ServerReadableStream,
  ServerUnaryCall,
} from '@grpc/grpc-js';
import {
  NewsStreamStatus,
  NewsUpdate,
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

export function sendNewsUpdate(
  call: ServerReadableStream<NewsUpdate, NewsStreamStatus>,
  callback: sendUnaryData<NewsStreamStatus>
) {
  call.on('data', (request: NewsUpdate) => {
    console.log('Received news update:');
    console.log('Title:', request.getNewsTitle());
    console.log('Content:', request.getNewsContent());
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
