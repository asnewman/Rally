import dotenv from "dotenv";
import { Message, MessageReaction, User } from "discord.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

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
import { Rally } from "./entities/Rally/Rally";
import { RallyPlan } from "./entities/RallyPlan/RallyPlan";
import rallyPlanUpdater from "./commands/rallyPlan/rallyPlanUpdater";
import rally from "./api/rally";

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.info("Successfully connected to the database");
});

const RALLY_USERNAME = process.env.ENV === "PROD" ? "Rally" : "RallyDev";

rallyPlanUpdater();

client.on("message", async (message: Message): Promise<void> => {
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
});

client.on(
  "messageReactionAdd",
  async (messageReaction: MessageReaction, user: User): Promise<void> => {
    const msg = await messageReaction.message.fetch();

    if (user.username === RALLY_USERNAME) return;
    if (msg.author.username !== RALLY_USERNAME) return;

    const { message } = messageReaction;

    const rally = await Rally.findOne({ messageId: message.id });

    if (!rally) {
      console.error("Rally not found");
      return;
    }

    const rallyPlan = await RallyPlan.findOne({ rallyId: rally._id });

    await rallyAddReactionHandler(messageReaction, user, rally, rallyPlan);
  }
);

client.on(
  "messageReactionRemove",
  async (messageReaction: MessageReaction, user: User): Promise<void> => {
    const msg = await messageReaction.message.fetch();

    if (msg.author.username !== RALLY_USERNAME) return;

    const { message } = messageReaction;

    const rally = await Rally.findOne({ messageId: message.id });

    if (!rally) {
      console.error("Rally not found");
      return;
    }

    const rallyPlan = await RallyPlan.findOne({ rallyId: rally._id });

    await rallyRemoveReactionHandler(messageReaction, user, rally, rallyPlan);
  }
);

const parseMessage = (message: Message) => {
  const commandBody = message.content.slice(COMMAND_PREFIX.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase();

  return { commandBody, args, command };
};

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("Rally service is running.");
});

app.listen(port, () => {
  console.log(`Rally is listening at http://localhost:${port}`);
});

app.use("/api/rally", rally);
