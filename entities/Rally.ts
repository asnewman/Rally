import mongoose, { Schema, Document } from 'mongoose';

const rallySchema = new mongoose.Schema({
  messageId: String,
  gameName: String,
  userCount: Number,
  authorId: String,
  usersId: [String]
});

interface RallyInfo {
  messageId: string
  gameName: string
  userCount: number
  authorId: string
  usersId: string[]
}

interface IRally extends Document, RallyInfo {}

const Rally = mongoose.model<IRally>('Rally', rallySchema);


export {
  RallyInfo, Rally, IRally
};