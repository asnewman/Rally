import { IRally, Rally } from "./Rally";

const getMostRecentRallyForAuthor = async (
  authorId: string
): Promise<IRally> => {
  const ralliesOwnedByAuthor = await Rally.find({
    authorId: authorId,
  });

  if (ralliesOwnedByAuthor.length < 1) {
    throw new Error("No rallies found to invite users to.");
  }

  // Order so the newest message is first
  ralliesOwnedByAuthor.sort(
    (a, b) => b._id.getTimestamp() - a._id.getTimestamp()
  );

  const mostRecentRally = ralliesOwnedByAuthor[0];

  return mostRecentRally;
};

export { getMostRecentRallyForAuthor };
