import { Message, MessageReaction, User } from "discord.js";

import { COMMAND_PREFIX, REACT_EMOJI } from '../constants';

const rallies: Map<string, Rally> = new Map();

type Rally = {
  gameName: string
  userCount: number
  author: User
  users: User[]
}

const rallyMessageHandler = (message: Message): void => {
  let rallyCommand = null;

  try {
    rallyCommand = parseRallyMessage(message);
  } catch (err) {
    message.reply(err.message);
    return;
  }

  if (!rallyCommand) {
    return;
  }

  message.channel.send(generateRallyMessage(rallyCommand))
    .then((createdMessage) => {
      createdMessage.react(REACT_EMOJI);
      rallies[createdMessage.id] = rallyCommand;
    });
};


const parseRallyMessage = (message: Message): Rally => {
  const INVALID_RALLY_COMMAND_MSG = 'Invalid rally command. Please use !rally <game name> <player count>.';

  const commandBody = message.content.slice(COMMAND_PREFIX.length);
  const args = commandBody.split(' ');
  args.shift();

  if (args.length < 2) {
    throw new Error(INVALID_RALLY_COMMAND_MSG);
  }

  const userCount = Number(args.pop());

  if (!userCount) {
    throw new Error(INVALID_RALLY_COMMAND_MSG);
  }

  const gameName = args.join(' ');

  return { gameName, userCount, author: message.author, users: [] };
};


const generateRallyMessage = (rally: Rally) => {
  const { author, userCount, gameName, users } = rally;
  const neededPlayers = userCount - users.length - 1;

  if (userCount - users.length - 1 <= 0) {
    return `${author}'s ${gameName} party has filled with: \n` +
    `- ${author} \n` +
    `${generateUserListForRallyMessage(users)}`;
  }

  return `${author} has started a ${gameName} party. \n` +
         `- ${author} \n` +
         `${generateUserListForRallyMessage(users)}` +
         `Looking for **${neededPlayers}** more. React ${REACT_EMOJI} to join the party!\n`;
};

const generateUserListForRallyMessage = (users: User[]): string  => {
  let formattedUsers = '';

  for (const user of users) {
    formattedUsers += `- ${user} \n`;
  }

  return formattedUsers;
};

const rallyAddReactionHandler = (messageReaction: MessageReaction, user: User): void => {
  const { message } = messageReaction;

  const rallyCommand = rallies[message.id];

  if (rallyCommand.author.id === user.id) return;

  if (!rallyCommand) {
    console.error('Rally command could not be found');
  }

  const existingUser = rallyCommand.users.find((currUser: User) => currUser.id === user.id);

  if (!existingUser) {
    rallyCommand.users.push(user);
  }

  message.edit(generateRallyMessage(rallyCommand));
};

const rallyRemoveReactionHandler = (messageReaction: MessageReaction, user: User) => {
  const { message } = messageReaction;

  const rallyCommand = rallies[message.id];

  if (!rallyCommand) {
    console.error('Rally command could not be found');
  }

  const existingUserIndex = rallyCommand.users.findIndex((currUser: User) => currUser.id === user.id);

  if (existingUserIndex !== -1) {
    rallyCommand.users.splice(existingUserIndex, existingUserIndex + 1);
  }

  message.edit(generateRallyMessage(rallyCommand));
};

export {
  rallyMessageHandler,
  rallyAddReactionHandler,
  rallyRemoveReactionHandler
};
