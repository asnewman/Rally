import { Message } from "discord.js";
import { REACT_EMOJI, REMOVE_EMOJI, COMMAND_PREFIX } from "../../constants";
import { IRally, Rally } from "../../entities/Rally";
import { generateRallyMessage } from "./rallyCommandHelper";

const rallyCommandHandler = async (message: Message): Promise<void> => {
  let rallyInfo: IRally = null;

  try {
    rallyInfo = parseRallyMessage(message);
  } catch (err) {
    console.error(err);
    message.reply(err.message);
    return;
  }

  if (!rallyInfo) {
    return;
  }

  await message.channel
    .send(generateRallyMessage(rallyInfo))
    .then(async (createdMessage) => {
      createdMessage.react(REACT_EMOJI);
      createdMessage.react(REMOVE_EMOJI);
      message.delete();
      const newRally = new Rally({
        messageId: createdMessage.id,
        gameName: rallyInfo.gameName,
        userCount: rallyInfo.userCount,
        authorId: message.author.id,
        usersId: [],
        hasStarted: rallyInfo.hasStarted,
      });
      await newRally.save();
    });
};

const parseRallyMessage = (message: Message): IRally => {
  const INVALID_RALLY_COMMAND_MSG =
    "Invalid rally command. Please use !rally <game name> <player count>.";

  const commandBody = message.content.slice(COMMAND_PREFIX.length);
  const args = commandBody.split(" ");
  args.shift();

  if (args.length < 2) {
    throw new Error(INVALID_RALLY_COMMAND_MSG);
  }

  const userCount = Number(args.pop());

  if (!userCount) {
    throw new Error(INVALID_RALLY_COMMAND_MSG);
  }

  const gameName = args.join(" ");

  return new Rally({
    messageId: message.id,
    gameName,
    userCount,
    authorId: message.author.id,
    usersId: [],
    hasStarted: false,
  });
};

export default rallyCommandHandler;
