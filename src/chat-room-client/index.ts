import 'module-alias/register';
import * as grpc from '@grpc/grpc-js';
import { ChatRoomClient } from '@protos/chatroom_grpc_pb';
import { ChatMessage } from '@protos/chatroom_pb';
import config from 'config';
import * as readline from 'node:readline'; // because no default import :(
import { delay, getCurrentTimeStamp } from '../utils';

const PORT = config.get<string>('app.port') || '50051';
const EXIT_COMMANDS = [
  'exit',
  '/exit',
  '\\exit',
  'quit',
  '\\q',
  '\\quit',
  '/quit',
];

const client = new ChatRoomClient(
  `localhost:${PORT}`,
  grpc.credentials.createInsecure()
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptUsernameAndRoomName(): Promise<{
  username: string;
  roomName: string;
}> {
  return new Promise((resolve) => {
    rl.question('Enter your name: ', (username) => {
      rl.question('Enter room name: ', (roomName) => {
        console.log(`Joining room ${roomName} as ${username}`);
        resolve({ username, roomName });
      });
    });
  });
}

async function startChat(username: string, roomName: string) {
  console.clear();
  const call = client.chat();
  /*
    The reason why it was essential to send an initial message is because the server only finds the userId and room that the current user is trying to join into from the call.on('data') event handler. If the server doesn't receive any message, it won't know which which queue(s) to stream the incoming messages to
  */
  const initialJoinMsg = new ChatMessage();
  initialJoinMsg.setUserId(username);
  initialJoinMsg.setMessage('joined the chat.');
  initialJoinMsg.setRoomName(roomName);
  initialJoinMsg.setTimestamp(getCurrentTimeStamp());
  call.write(initialJoinMsg);

  call.on('data', (response: ChatMessage) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(`${response.getUserId()}: ${response.getMessage()}`);
    rl.prompt();
  });

  call.on('error', (error) => {
    console.error(error);
    call.cancel();
    process.exit(1);
  });

  call.on('end', () => {
    console.log('\nDisconnected from chat.');
    process.exit(0);
  });

  /* send messages to the server */
  rl.prompt();
  rl.on('line', (input) => {
    if (EXIT_COMMANDS.includes(input.toLowerCase())) {
      call.end();
      rl.close();
      process.exit(0);
    } else {
      const message = new ChatMessage();
      message.setUserId(username);
      message.setMessage(input);
      message.setRoomName(roomName);
      message.setTimestamp(getCurrentTimeStamp());
      call.write(message);
    }
    rl.prompt();
  });
}

(async () => {
  const { username, roomName } = await promptUsernameAndRoomName();
  await delay(2000);
  startChat(username, roomName);
})();
