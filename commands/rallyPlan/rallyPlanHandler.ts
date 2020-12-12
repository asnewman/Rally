import { Message } from "discord.js";
import { COMMAND_PREFIX, REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import { IRally, Rally } from "../../entities/Rally/Rally";
import { IRallyPlan, RallyPlan } from "../../entities/RallyPlan/RallyPlan";
import { parseRallyMessageString } from "../rallyCommand/rallyCommandHelper";
import { generateRallyPlanMessage } from "./rallyPlanHelper";

const rallyPlanHandler = async (message: Message) => {
  try {
    await createRallyAndRallyPlan(message);
    message.delete();
  } catch (e) {
    message.reply(e.message);
  }
};

const createRallyAndRallyPlan = async (message: Message) => {
  const { rally, rallyPlan } = parseRallyPlanMessage(message);

  rally.save();

  rallyPlan.rallyId = rally._id;
  rallyPlan.save();

  await message.channel
    .send(generateRallyPlanMessage(rally, rallyPlan))
    .then(async (createdMessage) => {
      createdMessage.react(REACT_EMOJI);
      createdMessage.react(REMOVE_EMOJI);
      message.delete();
    });
};

const parseRallyPlanMessage = (
  message: Message
): { rallyPlan: IRallyPlan; rally: IRally } => {
  const INVALID_RALLY_PLAN_COMMAND_MSG =
    "Invalid Rally Plan command. Please use !rally_plan <mintues untill Rally> <game name> <player count>.";

  const commandBody = message.content.slice(COMMAND_PREFIX.length);
  const args = commandBody.split(" ");

  if (args.length < 3) {
    throw new Error(INVALID_RALLY_PLAN_COMMAND_MSG);
  }

  const argsWithoutMinutes = [...args];
  argsWithoutMinutes.splice(1, 1);
  const argsWithoutMinutesMsg = argsWithoutMinutes.join(" ");
  try {
    const rallyCommandBareInfo = parseRallyMessageString(argsWithoutMinutesMsg);

    const rally = new Rally({
      messageId: message.id,
      channelId: message.channel.id,
      gameName: rallyCommandBareInfo.gameName,
      userCount: rallyCommandBareInfo.userCount,
      authorId: message.author.id,
      usersId: [],
      hasFilled: false,
    });

    const minutesSinceEpoch = Math.floor(Math.round(Date.now() / 1000) / 60);

    // Check to see if the second arguement is a whole number
    if (!/^-?\d+$/.test(args[1])) {
      throw new Error(INVALID_RALLY_PLAN_COMMAND_MSG);
    }

    const rallyPlan = new RallyPlan({
      scheduledEpoch: (minutesSinceEpoch + parseInt(args[1], 10)) * 60 * 1000,
    });

    return {
      rally,
      rallyPlan,
    };
  } catch (e) {
    throw new Error(INVALID_RALLY_PLAN_COMMAND_MSG);
  }
};

export default rallyPlanHandler;
