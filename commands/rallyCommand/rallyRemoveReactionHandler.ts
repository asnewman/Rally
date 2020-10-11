import { MessageReaction, User } from "discord.js";
import { REACT_EMOJI } from "../../constants";
import { Rally } from "../../entities/Rally";
import { generateRallyMessage } from "./rallyCommandHelper";

const rallyRemoveReactionHandler = async (
  messageReaction: MessageReaction,
  user: User
): Promise<void> => {
  const { message } = messageReaction;

  const rally = await Rally.findOne({ messageId: message.id });

  if (!rally) {
    console.error("Rally could not be found");
  }

  if (rally.hasStarted) {
    return;
  }

  if (messageReaction.emoji.name === REACT_EMOJI) {
    const existingUserIndex = rally.usersId.findIndex(
      (currUserId: String) => currUserId === user.id
    );

    if (existingUserIndex !== -1) {
      rally.usersId.splice(existingUserIndex, existingUserIndex + 1);
    }

    message.edit(generateRallyMessage(rally));

    rally.save();
  }
};

export default rallyRemoveReactionHandler;
