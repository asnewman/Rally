import { IRally } from "../../entities/Rally/Rally";
import { RallyPlan } from "../../entities/RallyPlan/RallyPlan";

setTimeout(() => {

}, 10000);

const updateRally = async () => {
  const rallyPlans = await RallyPlan.find();
  const now = Date.now();

  for (const rallyPlan of rallyPlans) {
    if (rallyPlan.scheduledEpoch <= now) {
      rallyPlan.deleteOne();
    }
  }
}

const updateRallyMessage = (rally: IRally, mins) => {

}

const updateRallyWithDoneMessage = (rally: IRally) => {

}