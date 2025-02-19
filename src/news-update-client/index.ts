import 'module-alias/register';
import * as grpc from '@grpc/grpc-js';
import { ChatRoomClient } from '@protos/chatroom_grpc_pb';
import { NewsUpdate } from '@protos/chatroom_pb';
import config from 'config';
import { getCurrentTimeStamp } from '../utils';

const PORT = config.get<string>('app.port') || '50051';

const client = new ChatRoomClient(
  `localhost:${PORT}`,
  grpc.credentials.createInsecure()
);

const call = client.sendNewsUpdate((err, response) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Stream successful:', response.getIsSuccessful());
  }
});

const newsUpdates = [
  {
    newsTitle: 'News 1',
    newsContent: 'Content 1',
  },
  {
    newsTitle: 'News 2',
    newsContent: 'Content 2',
  },
  {
    newsTitle: 'News 3',
    newsContent: 'Content 3',
  },
];

let i = 0;
const intervalId = setInterval(() => {
  const request = new NewsUpdate();
  request.setNewsTitle(newsUpdates[i].newsTitle);
  request.setNewsContent(newsUpdates[i].newsContent);
  request.setTimestamp(getCurrentTimeStamp());

  call.write(request);
  i++;
  if (i === newsUpdates.length - 1) {
    call.end();
    clearInterval(intervalId);
  }
});
