import { REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import { RallyInfo } from "../../entities/Rally";

type RallyInfoNoMessageId = Omit<RallyInfo, "messageId">;

const generateRallyMessage = (rally: RallyInfoNoMessageId) => {
  const { authorId, userCount, gameName, usersId, hasStarted } = rally;
  const neededPlayers = userCount - usersId.length - 1;

  if (hasStarted) {
    return (
      `<@${authorId}>'s ${gameName} party has filled with: \n` +
      `- <@${authorId}> \n` +
      `${generateUserListForRallyMessage(usersId)}`
    );
  }

  return (
    `🔻\n` +
    `<@${authorId}> has started a ${gameName} party. \n` +
    `- <@${authorId}> \n` +
    `${generateUserListForRallyMessage(usersId)}` +
    `Looking for **${neededPlayers}** more. React ${REACT_EMOJI} to join the party!\n` +
    `Organizer use ${REMOVE_EMOJI} to remove the event.`
  );
};

const generateUserListForRallyMessage = (usersId: String[]): string => {
  let formattedUsers = "";

  for (const userId of usersId) {
    formattedUsers += `- <@${userId}> \n`;
  }

  return formattedUsers;
};

export { generateRallyMessage };
