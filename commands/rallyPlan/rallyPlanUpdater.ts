import { TextChannel } from "discord.js";
import { client } from "../../bot";
import { Rally } from "../../entities/Rally/Rally";
import { RallyPlan } from "../../entities/RallyPlan/RallyPlan";
import { dmRallyReadyToUsers, generateRallyMessage } from "../rallyCommand/rallyCommandHelper";

const rallyPlanUpdater = async () => {
  const rallyPlans = await RallyPlan.find();

  for (const rallyPlan of rallyPlans) {
    Rally.findOne({ _id: rallyPlan.rallyId }).then(async (rally) => {

      const channel = await client.channels.fetch(rally.channelId) as TextChannel;

      const message = await channel.messages.fetch(rally.messageId)

      message.edit(generateRallyMessage(rally, rallyPlan));

      if (rallyPlan && rallyPlan.scheduledEpoch <= Date.now()) {
        if (rally.hasFilled) {
          dmRallyReadyToUsers(rally)
        }

        console.info(`deleting ${rallyPlan._id}`);
        rallyPlan.deleteOne();
      }
    });
  }

  setTimeout(() => {
    rallyPlanUpdater()
  }, 15000);
};

export default rallyPlanUpdater;
