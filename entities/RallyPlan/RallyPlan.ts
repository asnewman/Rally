import mongoose, { Document } from "mongoose";

const rallyPlanSchema = new mongoose.Schema({
  rallyId: mongoose.Types.ObjectId,
  scheduledEpoch: Number,
});

interface IRallyPlan extends Document {
  rallyId: mongoose.Types.ObjectId;
  scheduledEpoch: number;
}

const RallyPlan = mongoose.model<IRallyPlan>("RallyPlan", rallyPlanSchema);

export { RallyPlan, IRallyPlan };
