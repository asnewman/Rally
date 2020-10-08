import dotenv from 'dotenv';
import Discord, { Message, MessageReaction, User } from 'discord.js';
import express from 'express';

dotenv.config();

import { rallyMessageHandler, rallyAddReactionHandler, rallyRemoveReactionHandler } from './commands/rallyCommand';
import { COMMAND_PREFIX, REACT_EMOJI } from './constants';

const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

client.on('message', (message: Message): void => {
  if (message.author.bot) return;
  if (!message.content.startsWith(COMMAND_PREFIX)) return;

  const parsedMessage = parseMessage(message);

  switch (parsedMessage.command) {
    case 'rally':
      rallyMessageHandler(message);
      break;
  }
});

client.on('messageReactionAdd', (messageReaction: MessageReaction, user: User): void => {
  if (user.username === 'Rally') return;
  if (messageReaction.message.author.username !== 'Rally') return;
  if (messageReaction.emoji.name !== REACT_EMOJI) return;

  rallyAddReactionHandler(messageReaction, user);
});

client.on('messageReactionRemove', (messageReaction: MessageReaction, user: User): void => {
  if (messageReaction.message.author.username !== 'Rally') return;

  rallyRemoveReactionHandler(messageReaction, user);
});

const parseMessage = (message: Message) => {
  const commandBody = message.content.slice(COMMAND_PREFIX.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

  return { commandBody, args, command };
};

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Rally service is running.');
});

app.listen(port, () => {
  console.log(`Rally is listening at http://localhost:${port}`);
})
;
