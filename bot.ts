import Discord from "discord.js";

const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION", "USER"],
});
client.login(process.env.BOT_TOKEN);

export { client };
