import { Message, User } from "discord.js";
import { COMMAND_PREFIX } from "../../constants";
import { client } from "../../bot";
import { IRally, Rally } from "../../entities/Rally";

type RallyRecruit = {
  targetUser: string;
};

const rallyRecruitHandler = async (message: Message): Promise<void> => {
  try {
    const rallyRecruit: RallyRecruit = parseRallyRecruitMessage(message);

    if (!rallyRecruit) {
      return;
    }

    const targetUser = await client.users.fetch(rallyRecruit.targetUser);
    const ralliesOwnedByAuthor = await Rally.find({
      authorId: message.author.id,
    });

    // Order so the newest message is first
    ralliesOwnedByAuthor.sort(
      (a, b) => b._id.getTimestamp() - a._id.getTimestamp()
    );

    validateRallyRecruitMessage(targetUser);

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

    targetUser.send(
      `${message.author.username} has invited you to join in a game of **${mostRecentRally.gameName}**! Check it out: ${linkToMessage}.`
    );

    message.reply(
      `Invite to ${targetUser} for a game of **${mostRecentRally.gameName}** sent.`
    );
  } catch (err) {
    console.error(err);
    message.reply(err.message);
  } finally {
    message.delete();
  }
};

const validateRallyRecruitMessage = (targetUser: User): void => {
  if (!targetUser) {
    throw new Error(`User ${targetUser} does not exist.`);
  }
};

const parseRallyRecruitMessage = (message: Message): RallyRecruit => {
  const INVALID_RALLY_COMMAND_MSG =
    "Invalid rally command. Please use !rally_recruit <user>.";

  const commandBody = message.content.slice(COMMAND_PREFIX.length);
  const args = commandBody.split(" ");
  args.shift();

  if (args.length !== 1) {
    throw new Error(INVALID_RALLY_COMMAND_MSG);
  }

  // Remove special characters that get added when you @ someone
  const targetUser = args[0].replace(/<|>|@|!/g, "");

  return { targetUser };
};

export default rallyRecruitHandler;
