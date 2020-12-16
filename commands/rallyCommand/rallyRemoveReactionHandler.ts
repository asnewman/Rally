import { MessageReaction, User } from "discord.js";
import { REACT_EMOJI } from "../../constants";
import { IRally, Rally } from "../../entities/Rally/Rally";
import { IRallyPlan } from "../../entities/RallyPlan/RallyPlan";
import { generateRallyMessage } from "./rallyCommandHelper";

const rallyRemoveReactionHandler = async (
  messageReaction: MessageReaction,
  user: User,
  rally: IRally,
  rallyPlan: IRallyPlan
): Promise<void> => {
  const { message } = messageReaction;

  if (rally.hasFilled) {
    return;
  }

  if (messageReaction.emoji.name === REACT_EMOJI) {
    const existingUserIndex = rally.usersId.findIndex(
      (currUserId: string) => currUserId === user.id
    );

    if (existingUserIndex !== -1) {
      rally.usersId.splice(existingUserIndex, existingUserIndex + 1);
    }

    message.edit(generateRallyMessage(rally, rallyPlan));

    rally.save();
  }
};

export default rallyRemoveReactionHandler;
