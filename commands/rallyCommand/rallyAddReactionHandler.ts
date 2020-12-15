import { Message, MessageReaction, User } from "discord.js";
import { REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import { IRally } from "../../entities/Rally/Rally";
import { IRallyPlan } from "../../entities/RallyPlan/RallyPlan";
import { dmRallyReadyToUsers, generateRallyMessage } from "./rallyCommandHelper";

const rallyAddReactionHandler = async (
  messageReaction: MessageReaction,
  user: User,
  rally: IRally,
  rallyPlan: IRallyPlan
): Promise<void> => {
  const { message } = messageReaction;

  if (messageReaction.emoji.name === REACT_EMOJI) {
    handleReactEmoji(rally, rallyPlan, user, message);
  } else if (messageReaction.emoji.name === REMOVE_EMOJI) {
    if (rally.authorId !== user.id) return;

    message.delete();
  }
};

const handleReactEmoji = (rally: IRally, rallyPlan: IRallyPlan, user: User, message: Message) => {
  if (rally.authorId === user.id) return;

  if (!rally.hasFilled) {
    rally.usersId.push(user.id);
  }

  // Rallying is starting
  if (rally.userCount - 1 === rally.usersId.length && !rally.hasFilled) {
    rally.hasFilled = true;

    if ((rallyPlan && rallyPlan.scheduledEpoch <= Date.now()) || !rallyPlan) {
      dmRallyReadyToUsers(rally);
    }
  }

  message.edit(generateRallyMessage(rally, rallyPlan));
  rally.save();
};

export default rallyAddReactionHandler;
