import { Message, User } from "discord.js";
import { COMMAND_PREFIX } from "../../constants";
import { client } from "../../bot";
import { IRally, Rally } from "../../entities/Rally";

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
      targetUsers.push(await client.users.fetch(targetUser));
    }

    const ralliesOwnedByAuthor = await Rally.find({
      authorId: message.author.id,
    });

    // Order so the newest message is first
    ralliesOwnedByAuthor.sort(
      (a, b) => b._id.getTimestamp() - a._id.getTimestamp()
    );

    validateRallyRecruitMessage(targetUsers, message.author);

    if (ralliesOwnedByAuthor.length < 1) {
      throw new Error("No rallies found to invite users to.");
    }

    const mostRecentRally = ralliesOwnedByAuthor[0];

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
    uniqueUsers.add(targetUser.username);
  }

  if (uniqueUsers.size !== targetUsers.length) {
    throw new Error(`User invitation list is not unique.`);
  }

  if (uniqueUsers.has(recruitAuthor.username)) {
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
