import express from "express";
import {Rally} from "../entities/Rally/Rally";
import Discord from "discord.js";
import {client} from "../bot";

const router = express.Router();

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  const rally = await Rally.findOne({ _id: id });
  const user  = await client.users.fetch(rally.authorId)
  console.log(user);
  res.send(rally);
})

export default router;