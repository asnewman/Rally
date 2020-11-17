import mongoose, { Schema, Document } from "mongoose";

const rallyChannelSchema = new Schema({
  channelId: String,
  channelName: String,
  rallyId: mongoose.Types.ObjectId,
});

interface IRallyChannel extends Document {
  channelId: string;
  channelName: string;
  rallyId: mongoose.Types.ObjectId;
}

const RallyChannel = mongoose.model<IRallyChannel>(
  "RallyChannel",
  rallyChannelSchema
);

export { RallyChannel, IRallyChannel };
