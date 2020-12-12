import { REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import { IRally } from "../../entities/Rally/Rally"
import { IRallyPlan } from "../../entities/RallyPlan/RallyPlan";
import { generateUserListForRallyMessage } from "../rallyCommand/rallyCommandHelper"

export const generateRallyPlanMessage = (rally: IRally, rallyPlan: IRallyPlan) => {
  const { authorId, userCount, gameName, usersId, hasFilled } = rally;
  const neededPlayers = userCount - usersId.length - 1;

  if (hasFilled) {
    return (
      `<@${authorId}>'s ${gameName} Rally has filled with: \n` +
      `- <@${authorId}> \n` +
      `${generateUserListForRallyMessage(usersId)} \n` +
      `The Rally will start in **${getMinutesUntilRally(rallyPlan.scheduledEpoch)} minutes**.`
    );
  }

  return (
    `🔻\n` +
    `<@${authorId}> has planned a ${gameName} Rally to start in **${getMinutesUntilRally(rallyPlan.scheduledEpoch)} minutes**. \n` +
    `- <@${authorId}> \n` +
    `${generateUserListForRallyMessage(usersId)}` +
    `Looking for **${neededPlayers}** more. React ${REACT_EMOJI} to join the party!\n` +
    `Organizer use ${REMOVE_EMOJI} to remove the event.`
  );
}

const getMinutesUntilRally = (scheduledEpoch: number) => {
  return Math.floor(Math.round((scheduledEpoch - Date.now()) / 1000) / 60);
}