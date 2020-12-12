import dotenv from "dotenv";
import { Message, MessageReaction, User } from "discord.js";
import express from "express";
import mongoose from "mongoose";

dotenv.config();

import { COMMAND_PREFIX } from "./constants";
import rallyAddReactionHandler from "./commands/rallyCommand/rallyAddReactionHandler";
import rallyCommandHandler from "./commands/rallyCommand/rallyCommandHandler";
import rallyRemoveReactionHandler from "./commands/rallyCommand/rallyRemoveReactionHandler";
import { client } from "./bot";
import rallyRecruitHandler from "./commands/rallyRecruit/rallyRecruitHandler";
import { rallyHelpHandler } from "./commands/rallyHelp/rallyHelpHandler";
import { rallyChannelHandler } from "./commands/rallyChannel/rallyChannelHandler";
import rallyPlanHandler from "./commands/rallyPlan/rallyPlanHandler";

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.info("Successfully connected to the database");
});

const RALLY_USERNAME = process.env.ENV === "PROD" ? "Rally" : "RallyDev";

client.on(
  "message",
  async (message: Message): Promise<void> => {
    if (message.author.bot) return;
    if (!message.content.startsWith(COMMAND_PREFIX)) return;

    const parsedMessage = parseMessage(message);

    switch (parsedMessage.command) {
      case "rally":
        await rallyCommandHandler(message);
        break;
      case "rally_recruit":
        await rallyRecruitHandler(message);
        break;
      case "rally_help":
        await rallyHelpHandler(message);
        break;
      case "rally_channel":
        await rallyChannelHandler(message);
        break;
      case "rally_plan":
        await rallyPlanHandler(message);
        break;
      default:
        break;
    }
  }
);

client.on(
  "messageReactionAdd",
  async (messageReaction: MessageReaction, user: User): Promise<void> => {
    if (user.username === RALLY_USERNAME) return;
    if (messageReaction.message.author.username !== RALLY_USERNAME) return;

    await rallyAddReactionHandler(messageReaction, user);
  }
);

client.on(
  "messageReactionRemove",
  async (messageReaction: MessageReaction, user: User): Promise<void> => {
    if (messageReaction.message.author.username !== RALLY_USERNAME) return;

    await rallyRemoveReactionHandler(messageReaction, user);
  }
);

const parseMessage = (message: Message) => {
  const commandBody = message.content.slice(COMMAND_PREFIX.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase();

  return { commandBody, args, command };
};

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Rally service is running.");
});

app.listen(port, () => {
  console.log(`Rally is listening at http://localhost:${port}`);
});
