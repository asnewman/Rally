import { Message } from "discord.js";
import { COMMAND_PREFIX, REACT_EMOJI, REMOVE_EMOJI } from "../../constants";
import { IRally, Rally } from "../../entities/Rally/Rally";
import { IRallyPlan, RallyPlan } from "../../entities/RallyPlan/RallyPlan";
import { generateRallyMessage, parseRallyMessageString } from "../rallyCommand/rallyCommandHelper";

const rallyPlanHandler = async (message: Message) => {
  try {
    await createRallyAndRallyPlan(message);
  } catch (e) {
    message.reply(e.message);
  }
};

const createRallyAndRallyPlan = async (message: Message) => {
  const { rally, rallyPlan } = parseRallyPlanMessage(message);


  await message.channel
    .send(generateRallyMessage(rally, rallyPlan))
    .then(async (createdMessage) => {
      rally.messageId = createdMessage.id;
      createdMessage.react(REACT_EMOJI);
      createdMessage.react(REMOVE_EMOJI);
      await rally.save();
      rallyPlan.rallyId = rally._id;
      await rallyPlan.save();
      message.delete();
    });
};

const parseRallyPlanMessage = (
  message: Message
): { rallyPlan: IRallyPlan; rally: IRally } => {
  const INVALID_RALLY_PLAN_COMMAND_MSG =
    "Invalid Rally Plan command. Please use !rally_plan <mintues untill Rally> <game name> <player count>. Minutes must be less than 10080.";

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
      userIds: [],
      hasFilled: false,
    });

    const minutesSinceEpoch = Math.floor(Math.round(Date.now() / 1000) / 60);

    // Check to see if the second arguement is a whole number
    if (!/^-?\d+$/.test(args[1])) {
      throw new Error(INVALID_RALLY_PLAN_COMMAND_MSG);
    }

    const minuteArg = parseInt(args[1], 10);

    if (minuteArg > 10080) {
      throw new Error(INVALID_RALLY_PLAN_COMMAND_MSG);
    }

    const rallyPlan = new RallyPlan({
      scheduledEpoch: (minutesSinceEpoch + minuteArg) * 60 * 1000,
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
