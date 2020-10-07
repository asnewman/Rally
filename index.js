require('dotenv').config();
const Discord = require('discord.js');

const { rallyMessageHandler, rallyAddReactionHandler, rallyRemoveReactionHandler } = require('./commands/rallyCommand');
const { COMMAND_PREFIX, REACT_EMOJI } = require('./constants');

const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

client.on('message', function (message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(COMMAND_PREFIX)) return;

  const parsedMessage = parseMessage(message);

  switch (parsedMessage.command) {
    case 'rally':
      rallyMessageHandler(message);
      break;
  }
});

client.on('messageReactionAdd', function (messageReaction, user) {
  if (user.username === 'Rally') return;
  if (messageReaction.message.author.username !== 'Rally') return;
  if (messageReaction.emoji.name !== REACT_EMOJI) return;

  rallyAddReactionHandler(messageReaction, user);
});

client.on('messageReactionRemove', function (messageReaction, user) {
  if (messageReaction.message.author.username !== 'Rally') return;

  rallyRemoveReactionHandler(messageReaction, user);
});

/**
 * Takes in a message and returns information about the command
 * @param {String} message Command string starting with the PREFIX character
 * @returns { { commandBody: String, args: List<String>, command: String } }
 */
const parseMessage = (message) => {
  const commandBody = message.content.slice(COMMAND_PREFIX.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

  return { commandBody, args, command };
};
