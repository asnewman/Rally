import { Guild, Message, MessageReaction, User } from "discord.js";
import { client } from "../../bot";
import { REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import { IRally, Rally } from "../../entities/Rally/Rally";
import { IRallyChannel, RallyChannel } from "../../entities/RallyChannel";
import { generateRallyMessage } from "./rallyCommandHelper";

const rallyAddReactionHandler = async (
  messageReaction: MessageReaction,
  user: User
): Promise<void> => {
  const { message } = messageReaction;

  const rally = await Rally.findOne({ messageId: message.id });

  if (!rally) {
    console.error("Rally could not be found");
  }

  if (messageReaction.emoji.name === REACT_EMOJI) {
    handleReactEmoji(rally, user, message);
  } else if (messageReaction.emoji.name === REMOVE_EMOJI) {
    if (rally.authorId !== user.id) return;

    message.delete();
  }
};

const handleReactEmoji = (rally: IRally, user: User, message: Message) => {
  if (rally.authorId === user.id) return;

  if (!rally.hasFilled) {
    rally.usersId.push(user.id);
  }

  // Rallying is starting
  if (rally.userCount - 1 === rally.usersId.length && !rally.hasFilled) {
    rally.hasFilled = true;
    dmRallyReadyToUsers(rally);
  }

  message.edit(generateRallyMessage(rally));
  rally.save();
};

const dmRallyReadyToUsers = async (rally: IRally) => {
  const rallyUsers = rally.usersId;

  const readyMessage = `The Rally created by <@${rally.authorId}> for **${rally.gameName}** is filled. Game on!`;

  for (const userId of rallyUsers) {
    const user = await client.users.fetch(userId);
    user.send(readyMessage);
  }

  const author = await client.users.fetch(rally.authorId);
  author.send(
    `${readyMessage}\nType **!rally_channel** to create a temporary channel for this Rally.`
  );
};

export default rallyAddReactionHandler;
