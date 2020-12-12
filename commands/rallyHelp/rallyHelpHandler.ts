import { Message } from "discord.js";

const rallyHelpHandler = async (message: Message): Promise<void> => {
  message
    .reply(
      `
    **!rally <game name> <amount of players>** - Start a new Rally
    **!rally_plan <minutes until Rally> <game name> <player count>** - Schedule a Rally for the future
    **!rally_recruit <user1> <user2> <userx>** - Recruit players to the Rally YOU most recently created
    **!rally_channel** - Create a temporary channel for a Rally
    `
    )
    .then(() => {
      message.delete();
    });
};

export { rallyHelpHandler };
