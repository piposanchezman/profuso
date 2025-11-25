import { ObjectId } from "mongodb";
import { getDatabase } from "@lib/db";
import { COLLECTIONS, type ContactInfo, withTimestamps, updateTimestamp } from "@lib/models";

export async function getAllContactInfo(): Promise<ContactInfo[]> {
  const db = await getDatabase();
  return db
    .collection<ContactInfo>(COLLECTIONS.CONTACT_INFO)
    .find()
    .sort({ order: 1 })
    .toArray();
}

export async function getContactInfoById(id: string): Promise<ContactInfo | null> {
  const db = await getDatabase();
  return db.collection<ContactInfo>(COLLECTIONS.CONTACT_INFO).findOne({ _id: new ObjectId(id) });
}

export async function createContactInfo(data: Omit<ContactInfo, "_id" | "createdAt" | "updatedAt">): Promise<ObjectId> {
  const db = await getDatabase();
  const result = await db
    .collection<ContactInfo>(COLLECTIONS.CONTACT_INFO)
    .insertOne(withTimestamps(data) as any);
  return result.insertedId;
}

export async function updateContactInfo(
  id: string,
  data: Partial<Omit<ContactInfo, "_id" | "createdAt" | "updatedAt">>
): Promise<boolean> {
  const db = await getDatabase();
  const result = await db
    .collection<ContactInfo>(COLLECTIONS.CONTACT_INFO)
    .updateOne({ _id: new ObjectId(id) }, { $set: updateTimestamp(data) });
  return result.modifiedCount > 0;
}

export async function deleteContactInfo(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db
    .collection<ContactInfo>(COLLECTIONS.CONTACT_INFO)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
