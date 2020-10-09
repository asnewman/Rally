import { Message, MessageReaction, User } from "discord.js";

import { COMMAND_PREFIX, REACT_EMOJI, REMOVE_EMOJI } from '../constants';
import { RallyInfo, IRally, Rally } from '../entities/Rally';

type RallyInfoNoMessageId = Omit<RallyInfo, "messageId">

const rallyMessageHandler = async (message: Message): Promise<void> => {
  let rallyInfo: RallyInfo = null;

  try {
    rallyInfo = parseRallyMessage(message);
  } catch (err) {
    console.error(err)
    message.reply(err.message);
    return;
  }

  if (!rallyInfo) {
    return;
  }

  await message.channel.send(generateRallyMessage(rallyInfo))
    .then(async (createdMessage) => {
      createdMessage.react(REACT_EMOJI);
      createdMessage.react(REMOVE_EMOJI);
      message.delete();
      const newRally = new Rally({ 
        messageId: createdMessage.id, 
        gameName: rallyInfo.gameName, 
        userCount: rallyInfo.userCount, 
        authorId: message.author.id, 
        usersId: []
      })
      await newRally.save();
    });
};


const parseRallyMessage = (message: Message): IRally => {
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

  return new Rally({ messageId: message.id, gameName, userCount, authorId: message.author.id, usersId: []});
};


const generateRallyMessage = (rally: RallyInfoNoMessageId) => {
  const { authorId, userCount, gameName, usersId } = rally;
  const neededPlayers = userCount - usersId.length - 1;

  if (userCount - usersId.length - 1 <= 0) {
    return `${authorId}'s ${gameName} party has filled with: \n` +
    `- ${authorId} \n` +
    `${generateUserListForRallyMessage(usersId)}`;
  }

  return `🔻\n` +
         `${authorId} has started a ${gameName} party. \n` +
         `- ${authorId} \n` +
         `${generateUserListForRallyMessage(usersId)}` +
         `Looking for **${neededPlayers}** more. React ${REACT_EMOJI} to join the party!\n`+
         `Organizer use ${REMOVE_EMOJI} to remove the event.`;
};

const generateUserListForRallyMessage = (usersId: String[]): string  => {
  let formattedUsers = '';

  for (const userId of usersId) {
    formattedUsers += `- <@${userId}> \n`;
  }

  return formattedUsers;
};

const rallyAddReactionHandler = async (messageReaction: MessageReaction, user: User): Promise<void> => {
  const { message } = messageReaction;

  const rally = await Rally.findOne({messageId: message.id});

  if (!rally) {
    console.error('Rally could not be found');
  }

  if (messageReaction.emoji.name === REACT_EMOJI) {
    if (rally.authorId === user.id) return;

    const existingUser = rally.usersId.find((currUserId: String) => currUserId === user.id);

    if (!existingUser) {
      rally.usersId.push(user.id);
    }

    message.edit(generateRallyMessage(rally));
    rally.save();
  }
  else if (messageReaction.emoji.name === REMOVE_EMOJI) {
    if (rally.authorId !== user.id) return;

    message.delete();
  };
};

const rallyRemoveReactionHandler = async (messageReaction: MessageReaction, user: User): Promise<void> => {
  const { message } = messageReaction;

  const rally = await Rally.findOne({messageId: message.id});

  if (!rally) {
    console.error('Rally could not be found');
  }

  if (messageReaction.emoji.name === REACT_EMOJI) {

    const existingUserIndex = rally.usersId.findIndex((currUserId: String) => currUserId === user.id);

    if (existingUserIndex !== -1) {
      rally.usersId.splice(existingUserIndex, existingUserIndex + 1);
    }

    message.edit(generateRallyMessage(rally));

    rally.save();
  }
};

export {
  rallyMessageHandler,
  rallyAddReactionHandler,
  rallyRemoveReactionHandler
};
