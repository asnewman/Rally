import { Message, MessageReaction, User } from "discord.js";
import { client } from "../../bot";
import { REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import { IRally, Rally } from "../../entities/Rally";
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

  if (!rally.hasStarted) {
    rally.usersId.push(user.id);
  }

  // Rallying is starting
  if (rally.userCount - 1 === rally.usersId.length) {
    rally.hasStarted = true;
    dmRallyReadyToUsers(rally);
  }

  message.edit(generateRallyMessage(rally));
  rally.save();
};

const dmRallyReadyToUsers = async (rally: IRally) => {
  const rallyUsersAndAuthor = [...rally.usersId, rally.authorId];

  for (const userId of rallyUsersAndAuthor) {
    const user = await client.users.fetch(userId);
    user.send(
      `The Rally created by <@${rally.authorId}> for **${rally.gameName}** is filled. Game on!`
    );
  }
};

export default rallyAddReactionHandler;
