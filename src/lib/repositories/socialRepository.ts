import { ObjectId } from "mongodb";
import { getDatabase } from "@lib/db";
import { COLLECTIONS, type SocialLink, withTimestamps, updateTimestamp } from "@lib/models";

export async function getAllSocialLinks(): Promise<SocialLink[]> {
  const db = await getDatabase();
  return db
    .collection<SocialLink>(COLLECTIONS.SOCIAL_LINKS)
    .find()
    .sort({ order: 1 })
    .toArray();
}

export async function getSocialLinkById(id: string): Promise<SocialLink | null> {
  const db = await getDatabase();
  return db.collection<SocialLink>(COLLECTIONS.SOCIAL_LINKS).findOne({ _id: new ObjectId(id) });
}

export async function createSocialLink(data: Omit<SocialLink, "_id" | "createdAt" | "updatedAt">): Promise<ObjectId> {
  const db = await getDatabase();
  const result = await db
    .collection<SocialLink>(COLLECTIONS.SOCIAL_LINKS)
    .insertOne(withTimestamps(data) as any);
  return result.insertedId;
}

export async function updateSocialLink(
  id: string,
  data: Partial<Omit<SocialLink, "_id" | "createdAt" | "updatedAt">>
): Promise<boolean> {
  const db = await getDatabase();
  const result = await db
    .collection<SocialLink>(COLLECTIONS.SOCIAL_LINKS)
    .updateOne({ _id: new ObjectId(id) }, { $set: updateTimestamp(data) });
  return result.modifiedCount > 0;
}

export async function deleteSocialLink(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db
    .collection<SocialLink>(COLLECTIONS.SOCIAL_LINKS)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
