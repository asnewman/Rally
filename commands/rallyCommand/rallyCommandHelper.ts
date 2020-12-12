import { COMMAND_PREFIX, REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import { RallyCommandBareInfo, RallyInfo } from "../../entities/Rally/Rally";

type RallyInfoNoMessageId = Omit<RallyInfo, "messageId">;

const generateRallyMessage = (rally: RallyInfoNoMessageId) => {
  const { authorId, userCount, gameName, usersId, hasFilled } = rally;
  const neededPlayers = userCount - usersId.length - 1;

  if (hasFilled) {
    return (
      `<@${authorId}>'s ${gameName} Rally has filled with: \n` +
      `- <@${authorId}> \n` +
      `${generateUserListForRallyMessage(usersId)}`
    );
  }

  return (
    `🔻\n` +
    `<@${authorId}> has started a ${gameName} Rally. \n` +
    `- <@${authorId}> \n` +
    `${generateUserListForRallyMessage(usersId)}` +
    `Looking for **${neededPlayers}** more. React ${REACT_EMOJI} to join the party!\n` +
    `Organizer use ${REMOVE_EMOJI} to remove the event.`
  );
};

export const generateUserListForRallyMessage = (usersId: String[]): string => {
  let formattedUsers = "";

  for (const userId of usersId) {
    formattedUsers += `- <@${userId}> \n`;
  }

  return formattedUsers;
};

const parseRallyMessageString = (command: string): RallyCommandBareInfo => {
  const INVALID_RALLY_COMMAND_MSG =
    "Invalid Rally command. Please use !rally <game name> <player count>.";

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
    userCount
  };
}

export { generateRallyMessage, parseRallyMessageString };
