import { MessageReaction, User } from "discord.js";
import { REACT_EMOJI } from "../../constants";
import { IRally } from "../../entities/Rally/Rally";
import { IRallyPlan } from "../../entities/RallyPlan/RallyPlan";
import { generateRallyMessage } from "./rallyCommandHelper";

const rallyRemoveReactionHandler = async (
  messageReaction: MessageReaction,
  user: User,
  rally: IRally,
  rallyPlan: IRallyPlan
): Promise<void> => {
  const { message } = messageReaction;

  const isUserRecruit = rally.userIds.includes(user.id);
  const isUserBackup = rally.backupUserIds.includes(user.id);

  if (rally.hasFilled && isUserRecruit) {
    rally.hasFilled = false;
  }

  if (messageReaction.emoji.name === REACT_EMOJI) {
    if (isUserRecruit) {
      const existingUserIndex = rally.userIds.findIndex(
        (currUserId: string) => currUserId === user.id
      );

      if (existingUserIndex !== -1) {
        rally.userIds.splice(existingUserIndex, existingUserIndex + 1);
      }
    }

    if (isUserBackup) {
      const existingUserIndex = rally.backupUserIds.findIndex(
        (currUserId: string) => currUserId === user.id
      );

      if (existingUserIndex !== -1) {
        rally.backupUserIds.splice(existingUserIndex, existingUserIndex + 1);
      }
    }

    // move backup player to player list
    if (rally.backupUserIds.length && !rally.hasFilled) {
      rally.userIds.push(rally.backupUserIds.shift());
      rally.hasFilled = true;
    }

    message.edit(generateRallyMessage(rally, rallyPlan));

    rally.save();
  }
};

export default rallyRemoveReactionHandler;
