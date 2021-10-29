import { client } from "../../bot";
import { COMMAND_PREFIX, REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import {
  IRally,
  RallyCommandBareInfo,
  RallyInfo,
} from "../../entities/Rally/Rally";
import { IRallyPlan } from "../../entities/RallyPlan/RallyPlan";
import { getMinutesUntilRally } from "../rallyPlan/rallyPlanHelper";

type RallyInfoNoMessageId = Omit<RallyInfo, "messageId">;

const generateRallyMessage = (
  rally: RallyInfoNoMessageId,
  rallyPlan: IRallyPlan
) => {
  const { authorId, userCount, gameName, userIds, hasFilled, backupUserIds } =
    rally;
  const neededPlayers = userCount - userIds.length - 1;

  let rallyMsg: string;

  if (hasFilled) {
    rallyMsg =
      `🔻\n` +
      `<@${authorId}>'s ${gameName} Rally has filled with: \n` +
      `- <@${authorId}> \n` +
      `${generateUserListForRallyMessage(userIds)}`;

    if (backupUserIds.length) {
      rallyMsg +=
        `\nBackup players:\n` +
        `${generateUserListForRallyMessage(backupUserIds)}`;
    }

    if (rallyPlan && rallyPlan.scheduledEpoch > Date.now()) {
      rallyMsg += `The Rally is planned to start in **${
        getMinutesUntilRally(rallyPlan.scheduledEpoch) + 1
      } minutes**.\n`;
    }
  } else {
    rallyMsg = `🔻\n` + `<@${authorId}> has created a ${gameName} Rally. \n`;

    if (rallyPlan && rallyPlan.scheduledEpoch > Date.now()) {
      rallyMsg += `The Rally is planned to start in **${
        getMinutesUntilRally(rallyPlan.scheduledEpoch) + 1
      } minutes**.\n`;
    }

    rallyMsg +=
      `Current recruits include: \n` +
      `- <@${authorId}> \n` +
      `${generateUserListForRallyMessage(userIds)}` +
      `Looking for **${neededPlayers}** more. React ${REACT_EMOJI} to join the party!\n` +
      `Organizer use ${REMOVE_EMOJI} to remove the event.\n`;
  }

  return rallyMsg;
};

export const generateUserListForRallyMessage = (userIds: string[]): string => {
  let formattedUsers = "";

  for (const userId of userIds) {
    formattedUsers += `- <@${userId}> \n`;
  }

  return formattedUsers;
};

const parseRallyMessageString = (command: string): RallyCommandBareInfo => {
  const INVALID_RALLY_COMMAND_MSG =
    "Invalid Rally command. Please use !rally <game name> <player count>. For more help use !rally_help.";

  const commandBody = command.slice(COMMAND_PREFIX.length);

  const args = commandBody.split(" ");
  args.shift();

  if (args.length < 2) {
    throw new Error(INVALID_RALLY_COMMAND_MSG);
  }

  const userCount = Number(args.pop());

  if (!userCount) {
    throw new Error(INVALID_RALLY_COMMAND_MSG);
  }

  if (userCount < 2) {
    throw new Error("All rallies must call for at least 2 users.");
  }

  const gameName = args.join(" ");

  return {
    gameName,
    userCount,
  };
};

const dmRallyReadyToUsers = async (rally: IRally) => {
  const rallyUsers = rally.userIds;

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

export { generateRallyMessage, parseRallyMessageString, dmRallyReadyToUsers };
