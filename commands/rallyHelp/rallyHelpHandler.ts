import { Message } from "discord.js";

const rallyHelpHandler = async (message: Message): Promise<void> => {
  message
    .reply(
      `
    **!rally <game name> <amount of players>** - Start a new Rally
    **!rally_recruit <user1> <user2> <userx>** - Recruit players to the Rally YOU most recently created
    `
    )
    .then(() => {
      message.delete();
    });
};

export { rallyHelpHandler };
