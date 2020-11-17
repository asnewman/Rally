import mongoose, { Schema, Document } from "mongoose";

const rallySchema = new mongoose.Schema({
  messageId: String,
  channelId: String,
  gameName: String,
  userCount: Number,
  authorId: String,
  usersId: [String],
  hasStarted: Boolean,
});

interface RallyInfo {
  messageId: string;
  channelId: string;
  gameName: string;
  userCount: number;
  authorId: string;
  usersId: string[];
  hasStarted: boolean;
}

interface IRally extends Document, RallyInfo {}

const Rally = mongoose.model<IRally>("Rally", rallySchema);

export { RallyInfo, Rally, IRally };
