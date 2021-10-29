import { Message, User } from "discord.js";
import { COMMAND_PREFIX } from "../../constants";
import { client } from "../../bot";
import { getMostRecentRallyForAuthor } from "../../entities/Rally/RallyService";

type RallyRecruit = {
  targetUsers: string[];
};

const rallyRecruitHandler = async (message: Message): Promise<void> => {
  try {
    const rallyRecruit: RallyRecruit = parseRallyRecruitMessage(message);

    if (!rallyRecruit) {
      return;
    }

    const targetUsers = [];
    for (const targetUser of rallyRecruit.targetUsers) {
      // user could be a role if the id starts with &
      if (targetUser.charAt(0) === '&') {
        const roleId = targetUser.replace('&', '');
        const roleMembers = message.guild.roles.cache.get(roleId).members;

        for (const member of roleMembers) {
          if (message.author.id === member[0]) continue;

          targetUsers.push(await client.users.fetch(member[0])); 
        }
      }
      else {
        targetUsers.push(await client.users.fetch(targetUser));
      }
    }

    validateRallyRecruitMessage(targetUsers, message.author);

    const mostRecentRally = await getMostRecentRallyForAuthor(
      message.author.id
    );

    const linkToMessage =
      "http://discordapp.com/channels/" +
      message.guild.id +
      "/" +
      message.channel.id +
      "/" +
      mostRecentRally.messageId;

    for (const targetUser of targetUsers) {
      targetUser.send(
        `${message.author.username} has invited you to join in a game of **${mostRecentRally.gameName}**! Check it out: ${linkToMessage}.`
      );
    }

    message.reply(
      `Invite to ${targetUsers} for a game of **${mostRecentRally.gameName}** sent.`
    );
  } catch (err) {
    if (err.name === "DiscordAPIError") {
      message.reply("Failed to get data from the discord API. " + err.message);
    } else {
      message.reply(err.message);
    }
    console.error(err);
  } finally {
    message.delete();
  }
};

const validateRallyRecruitMessage = (
  targetUsers: User[],
  recruitAuthor: User
): void => {
  const uniqueUsers = new Set();

  for (const targetUser of targetUsers) {
    if (!targetUser) {
      throw new Error(`User ${targetUser} does not exist.`);
    }
    uniqueUsers.add(targetUser.id);
  }

  if (uniqueUsers.size !== targetUsers.length) {
    throw new Error(`User invitation list is not unique.`);
  }

  if (uniqueUsers.has(recruitAuthor.id)) {
    throw new Error(`You cannot recruit yourself to a Rally that you created.`);
  }
};

const parseRallyRecruitMessage = (message: Message): RallyRecruit => {
  const INVALID_RALLY_COMMAND_MSG =
    "Invalid rally command. Please use !rally_recruit <user1> <user2> <userx...>.";

  const commandBody = message.content.slice(COMMAND_PREFIX.length);
  const args = commandBody.split(" ");
  args.shift();

  if (args.length === 0) {
    throw new Error(INVALID_RALLY_COMMAND_MSG);
  }

  // Remove special characters that get added when you @ someone
  const targetUsers = [];
  for (const arg of args) {
    targetUsers.push(arg.replace(/<|>|@|!/g, ""));
  }

  return { targetUsers };
};

export default rallyRecruitHandler;
