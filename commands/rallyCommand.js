const PREFIX = '!';

const rallies = {};

const rallyMessageHandler = (message) => {
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
      rallies[createdMessage.id] = rallyCommand;
    });
};

/**
 * Takes in a rally command message and returns information about the command
 * @param {String} message Command string starting with the rally command
 * @returns { { gameName: String, userCount: List<String>, author: User, users: List<User>} }
 */
const parseRallyMessage = (message) => {
  const INVALID_RALLY_COMMAND_MSG = 'Invalid rally command. Please use !rally <game name> <player count>.';

  const commandBody = message.content.slice(PREFIX.length);
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

/**
 * Creates the response to a rally command
 * @param { { gameName: String, userCount: List<String>, author: User, users: List<User>} } rallyMessageCommand Rally message object created by the parseRallyMessage
 * @returns {String}
 */
const generateRallyMessage = (rallyMessageCommand) => {
  const { author, userCount, gameName, users } = rallyMessageCommand;
  const neededPlayers = userCount - users.length - 1;

  if (userCount - users.length - 1 <= 0) {
    return `${author}'s ${gameName} party has filled with: \n` +
    `- ${author} \n` +
    `${generateUserListForRallyMessage(users)}`;
  }

  return `${author} has started a ${gameName} party. \n` +
         `- ${author} \n` +
         `${generateUserListForRallyMessage(users)}` +
         `Looking for **${neededPlayers}** more. React to join the party!\n`;
};

const generateUserListForRallyMessage = (users) => {
  let listStr = '';

  for (const user of users) {
    listStr += `- ${user} \n`;
  }

  return listStr;
};

const rallyAddReactionHandler = (messageReaction, user) => {
  const { message } = messageReaction;

  const rallyCommand = rallies[message.id];

  if (!rallyCommand) {
    console.error('Rally command could not be found');
  }

  const existingUser = rallyCommand.users.find(existingUser => existingUser.id === user.id);

  if (!existingUser) {
    rallyCommand.users.push(user);
  }

  message.edit(generateRallyMessage(rallyCommand));
};

const rallyRemoveReactionHandler = (messageReaction, user) => {
  const { message } = messageReaction;

  const rallyCommand = rallies[message.id];

  if (!rallyCommand) {
    console.error('Rally command could not be found');
  }

  const existingUserIndex = rallyCommand.users.findIndex(existingUser => existingUser.id === user.id);

  if (existingUserIndex !== -1) {
    rallyCommand.users.splice(existingUserIndex, existingUserIndex + 1);
  }

  message.edit(generateRallyMessage(rallyCommand));
};

module.exports = {
  rallyMessageHandler,
  rallyAddReactionHandler,
  rallyRemoveReactionHandler
};
