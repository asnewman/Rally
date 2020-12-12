import { Message } from "discord.js";
import { REACT_EMOJI, REMOVE_EMOJI, COMMAND_PREFIX } from "../../constants";
import { IRally, Rally } from "../../entities/Rally/Rally";
import {
  generateRallyMessage,
  parseRallyMessageString,
} from "./rallyCommandHelper";

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
        channelId: createdMessage.channel.id,
        gameName: rallyInfo.gameName,
        userCount: rallyInfo.userCount,
        authorId: message.author.id,
        usersId: [],
        hasFilled: rallyInfo.hasFilled,
      });
      await newRally.save();
    });
};

const parseRallyMessage = (message: Message): IRally => {
  const rallyCommandBareInfo = parseRallyMessageString(message.content);

  return new Rally({
    messageId: message.id,
    channelId: message.channel.id,
    gameName: rallyCommandBareInfo.gameName,
    userCount: rallyCommandBareInfo.userCount,
    authorId: message.author.id,
    usersId: [],
    hasFilled: false,
  });
};

export default rallyCommandHandler;
