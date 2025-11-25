import { ObjectId } from "mongodb";
import { getDatabase } from "../db";
import {
  COLLECTIONS,
  type Service,
  serviceSchema,
  withTimestamps,
  updateTimestamp,
} from "../models";

// Obtener todos los servicios
export async function getAllServices(): Promise<Service[]> {
  const db = await getDatabase();
  return db
    .collection<Service>(COLLECTIONS.SERVICES)
    .find({})
    .sort({ createdAt: 1 })
    .toArray();
}

// Obtener servicio por ID
export async function getServiceById(id: string): Promise<Service | null> {
  const db = await getDatabase();
  return db
    .collection<Service>(COLLECTIONS.SERVICES)
    .findOne({ _id: new ObjectId(id) });
}

// Crear servicio
export async function createService(data: unknown): Promise<Service> {
  const parsed = serviceSchema.parse(data); 
  const service = withTimestamps(parsed);  
  const db = await getDatabase();
  const result = await db.collection<Service>(COLLECTIONS.SERVICES).insertOne(service);
  return { ...service, _id: result.insertedId };
}

// Actualizar servicio
export async function updateServiceById(
  id: string,
  data: unknown
): Promise<boolean> {
  const parsed = serviceSchema.partial().parse(data);
  const updateData = updateTimestamp(parsed);
  const db = await getDatabase();
  const result = await db.collection<Service>(COLLECTIONS.SERVICES).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  return result.modifiedCount > 0;
}

// Eliminar servicio
export async function deleteServiceById(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db
    .collection<Service>(COLLECTIONS.SERVICES)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
