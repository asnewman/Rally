import { MessageReaction, User } from "discord.js";
import { REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import { Rally } from "../../entities/Rally";
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
    if (rally.authorId === user.id) return;

    if (!rally.hasStarted) {
      rally.usersId.push(user.id);
    }

    if (rally.userCount - 1 === rally.usersId.length) {
      rally.hasStarted = true;
    }

    message.edit(generateRallyMessage(rally));
    rally.save();
  } else if (messageReaction.emoji.name === REMOVE_EMOJI) {
    if (rally.authorId !== user.id) return;

    message.delete();
  }
};

export default rallyAddReactionHandler;
