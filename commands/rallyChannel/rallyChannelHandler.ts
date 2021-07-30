import { CategoryChannel, Guild, Message, TextChannel } from "discord.js";
import { IRally } from "../../entities/Rally/Rally";
import { getMostRecentRallyForAuthor } from "../../entities/Rally/RallyService";
import { IRallyChannel, RallyChannel } from "../../entities/RallyChannel";
import { client } from "../../bot";

const rallyChannelHandler = async (message: Message) => {
  let mostRecentRallyForAuthor: IRally = null;

  try {
    mostRecentRallyForAuthor = await getMostRecentRallyForAuthor(
      message.author.id
    );
  } catch (e) {
    console.warn(e);
    message.reply("Could not find a valid Rally to create a channel for.");
  }

  if (!mostRecentRallyForAuthor) {
    return;
  }

  const mostRecentRallyChannelForAuthor = (await client.channels.fetch(
    mostRecentRallyForAuthor.channelId
  )) as TextChannel;
  const mostRecentRallyMessageForAuthor = await mostRecentRallyChannelForAuthor.messages.fetch(
    mostRecentRallyForAuthor.messageId
  );

  const rallyChannel = await createTemporaryChannel(
    mostRecentRallyMessageForAuthor.guild,
    mostRecentRallyForAuthor
  );

  await notifyUsersOfNewChannel(mostRecentRallyForAuthor, rallyChannel);
};

const createTemporaryChannel = async (
  guild: Guild,
  rally: IRally
): Promise<IRallyChannel> => {
  const rallyCategoryChannel = await createRallyCategoryChannelIfDoesntExist(
    guild
  );

  const now = new Date();

  const newChannel = await guild.channels.create(
    `${rally.gameName} - ${
      now.getMonth() + 1
    }/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
    {
      type: "voice",
    }
  );

  newChannel.setParent(rallyCategoryChannel);

  const newRallyChannel = new RallyChannel({
    channelId: newChannel.id,
    channelName: newChannel.name,
    rallyId: rally._id,
  });

  return newRallyChannel;
};

const createRallyCategoryChannelIfDoesntExist = async (
  guild: Guild
): Promise<CategoryChannel> => {
  const channels = guild.channels.cache.array();
  for (const channel of channels) {
    if (channel.name === "Rally Channels" && channel.type === "category") {
      return channel as CategoryChannel;
    }
  }

  return await guild.channels.create("Rally Channels", { type: "category" });
};

const notifyUsersOfNewChannel = async (
  rally: IRally,
  rallyChannel: IRallyChannel
) => {
  const rallyUsers = [...rally.userIds, rally.authorId];

  const readyMessage = `A new channel has been create for this Rally. Please join ${rallyChannel.channelName}`;

  for (const userId of rallyUsers) {
    const user = await client.users.fetch(userId);
    user.send(readyMessage);
  }
};

export { rallyChannelHandler };
