import express from "express";
import { Rally } from "../entities/Rally/Rally";
import Discord from "discord.js";
import { client } from "../bot";

const router = express.Router();

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const rally = await Rally.findOne({ _id: id });
  const author = await client.users.fetch(rally.authorId);
  const usersPromises = rally.userIds.map((userId) =>
    client.users.fetch(userId)
  );
  const backupUsersPromises = rally.backupUserIds.map((backupUserId) =>
    client.users.fetch(backupUserId)
  );
  const users = await Promise.all(usersPromises);
  const backupUsers = await Promise.all(backupUsersPromises);
  res.send({
    id: rally._id,
    messageId: rally.messageId,
    gameName: rally.gameName,
    userCount: rally.userCount,
    hasFilled: rally.hasFilled,
    author,
    users,
    backupUsers,
  });
});

export default router;
