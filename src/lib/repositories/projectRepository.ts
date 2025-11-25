import { ObjectId } from "mongodb";
import { getDatabase } from "../db";
import {
  COLLECTIONS,
  type Project,
  projectSchema,
  withTimestamps,
  updateTimestamp,
} from "../models";

// Obtener todos los proyectos
export async function getAllProjects(): Promise<Project[]> {
  const db = await getDatabase();
  return db
    .collection<Project>(COLLECTIONS.PROJECTS)
    .find({})
    .sort({ createdAt: 1 })
    .toArray();
}

// Obtener proyecto por ID
export async function getProjectById(id: string): Promise<Project | null> {
  const db = await getDatabase();
  return db
    .collection<Project>(COLLECTIONS.PROJECTS)
    .findOne({ _id: new ObjectId(id) });
}

// Crear proyecto
export async function createProject(data: unknown): Promise<Project> {
  const parsed = projectSchema.parse(data); 
  const project = withTimestamps(parsed);
  const db = await getDatabase();
  const result = await db.collection<Project>(COLLECTIONS.PROJECTS).insertOne(project);
  return { ...project, _id: result.insertedId };
}

// Actualizar proyecto
export async function updateProjectById(
  id: string,
  data: unknown
): Promise<boolean> {
  const parsed = projectSchema.partial().parse(data);
  const updateData = updateTimestamp(parsed);
  const db = await getDatabase();
  const result = await db.collection<Project>(COLLECTIONS.PROJECTS).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  return result.modifiedCount > 0;
}

// Eliminar proyecto
export async function deleteProjectById(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db
    .collection<Project>(COLLECTIONS.PROJECTS)
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
