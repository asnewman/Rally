import mongoose, { Document } from "mongoose";

const rallySchema = new mongoose.Schema({
  messageId: String,
  channelId: String,
  gameName: String,
  userCount: Number,
  authorId: String,
  userIds: [String],
  backupUserIds: [String],
  hasFilled: Boolean,
});

interface RallyCommandBareInfo {
  gameName: string;
  userCount: number;
}

interface RallyInfo extends RallyCommandBareInfo {
  messageId: string;
  channelId: string;
  authorId: string;
  userIds: string[];
  backupUserIds: string[];
  hasFilled: boolean;
}

interface IRally extends Document, RallyInfo {}

const Rally = mongoose.model<IRally>("Rally", rallySchema);

export { RallyInfo, Rally, IRally, RallyCommandBareInfo };
