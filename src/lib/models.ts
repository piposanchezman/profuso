import { z } from "zod";
import type { ObjectId } from "mongodb";

/* ------------------- SCHEMAS ------------------- */

const imagePath = z.string().regex(/^(\/|blob:)/);

export const serviceSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  items: z.array(z.string()).default([]),
  images: z.array(imagePath).default([]),
  fromColor: z.string(),
  toColor: z.string(),
});

export const projectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  images: z.array(imagePath).default([]),
});

export const contactInfoSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  order: z.number().default(0),
});

export const socialLinkSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
  url: z.string().url(),
  color: z.string().default("hover:bg-gray-600"),
  order: z.number().default(0),
});

/* ------------------- TYPES ------------------- */

export interface Service {
  _id?: ObjectId;
  title: string;
  description: string;
  items: string[];
  images: string[];
  fromColor: string;
  toColor: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  _id?: ObjectId;
  title: string;
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactInfo {
  _id?: ObjectId;
  icon: string;
  title: string;
  content: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SocialLink {
  _id?: ObjectId;
  name: string;
  icon: string;
  url: string;
  color: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ------------------- COLLECTION NAMES ------------------- */

export const COLLECTIONS = {
  SERVICES: "services",
  PROJECTS: "projects",
  CONTACT_INFO: "contact",
  SOCIAL_LINKS: "social",
} as const;

/* ------------------- HELPERS ------------------- */

// Normaliza datos antes de insertar o actualizar
export function withTimestamps<T>(data: T): T & { createdAt: Date; updatedAt: Date } {
  const now = new Date();
  return { ...data, createdAt: now, updatedAt: now };
}

// Actualiza solo la marca de tiempo de actualización
export function updateTimestamp<T>(data: T): T & { updatedAt: Date } {
  return { ...data, updatedAt: new Date() };
}
