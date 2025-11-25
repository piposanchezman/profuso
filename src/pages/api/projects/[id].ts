import type { APIRoute } from "astro";
import { ObjectId } from "mongodb";
import {
  getProjectById,
  updateProjectById,
  deleteProjectById
} from "@lib/repositories/projectRepository";
import { projectSchema } from "@lib/models";

// GET /api/projects/:id → obtener proyecto
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }

    const project = await getProjectById(id);
    if (!project) {
      return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), { status: 404 });
    }

    return new Response(JSON.stringify(project), { status: 200 });
  } catch (error) {
    console.error("GET /api/projects/:id error:", error);
    return new Response(JSON.stringify({ error: "Error al obtener proyecto" }), { status: 500 });
  }
};

// PUT /api/projects/:id → actualizar proyecto
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }

    const json = await request.json();

    // Validación de los datos entrantes
    const parsed = projectSchema.partial().parse(json);

    const success = await updateProjectById(id, parsed);

    if (!success) {
      return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/projects/:id error:", error);

    if (error.name === "ZodError") {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Error al actualizar proyecto" }), { status: 500 });
  }
};

// DELETE /api/projects/:id → eliminar proyecto
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }

    const success = await deleteProjectById(id);

    if (!success) {
      return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("DELETE /api/projects/:id error:", error);
    return new Response(JSON.stringify({ error: "Error al eliminar proyecto" }), { status: 500 });
  }
};
