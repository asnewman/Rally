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

  const isUserRecruit = rally.usersId.includes((user.id));
  const isUserBackup = rally.backupUsersId.includes((user.id));

  if (rally.hasFilled && isUserRecruit) {
    rally.hasFilled = false;
  }

  if (messageReaction.emoji.name === REACT_EMOJI) {
    if (isUserRecruit) {
      const existingUserIndex = rally.usersId.findIndex(
          (currUserId: string) => currUserId === user.id
      );

      if (existingUserIndex !== -1) {
        rally.usersId.splice(existingUserIndex, existingUserIndex + 1);
      }
    }

    if (isUserBackup) {
      const existingUserIndex = rally.backupUsersId.findIndex(
          (currUserId: string) => currUserId === user.id
      );

      if (existingUserIndex !== -1) {
        rally.backupUsersId.splice(existingUserIndex, existingUserIndex + 1);
      }
    }

    // move backup player to player list
    if (rally.backupUsersId.length && !rally.hasFilled) {
      rally.usersId.push(rally.backupUsersId.shift());
      rally.hasFilled = true;
    }

    message.edit(generateRallyMessage(rally, rallyPlan));

    rally.save();
  }
};

export default rallyRemoveReactionHandler;
