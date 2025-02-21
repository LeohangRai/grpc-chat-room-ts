import 'module-alias/register';
import * as grpc from '@grpc/grpc-js';
import { ChatRoomClient } from '@protos/chatroom_grpc_pb';
import { NewsUpdate } from '@protos/chatroom_pb';
import axios from 'axios';
import config from 'config';
import { NewsArticle } from '../common/types';
import { getCurrentTimeStamp } from '../utils';

const PORT = config.get<string>('app.port') || '50051';
const NEWS_API_URL = 'https://newsapi.org/v2/everything?q=golang';
const NEWS_API_KEY = config.get<string>('api_keys.news_api');

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

async function getNewsArticles(): Promise<NewsArticle[]> {
  const response = await axios.get(NEWS_API_URL, {
    headers: {
      'X-Api-Key': NEWS_API_KEY,
    },
  });
  return response.data?.articles || [];
}

getNewsArticles().then((newsArticles) => {
  let i = 0;
  const intervalId = setInterval(() => {
    const request = new NewsUpdate();
    request.setNewsTitle(newsArticles[i].title);
    request.setNewsContent(newsArticles[i].content);
    request.setTimestamp(getCurrentTimeStamp());

    call.write(request);
    i++;
    if (i === newsArticles.length - 1) {
      call.end();
      clearInterval(intervalId);
    }
  }, 120000); // 2 minutes
});
