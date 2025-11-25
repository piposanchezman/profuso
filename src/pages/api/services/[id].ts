import type { APIRoute } from "astro";
import { ObjectId } from "mongodb";
import {
  getServiceById,
  updateServiceById,
  deleteServiceById
} from "@lib/repositories/serviceRepository";
import { serviceSchema } from "@lib/models";

// GET /api/services/:id → obtener un servicio
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }

    const service = await getServiceById(id);
    if (!service) {
      return new Response(JSON.stringify({ error: "Servicio no encontrado" }), { status: 404 });
    }

    return new Response(JSON.stringify(service), { status: 200 });
  } catch (error) {
    console.error("GET /api/services/:id error:", error);
    return new Response(JSON.stringify({ error: "Error al obtener el servicio" }), { status: 500 });
  }
};

// PUT /api/services/:id → actualizar servicio
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }

    const json = await request.json();

    // Validación de los datos entrantes
    const parsed = serviceSchema.partial().parse(json);

    const success = await updateServiceById(id, parsed);

    if (!success) {
      return new Response(JSON.stringify({ error: "Servicio no encontrado" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/services/:id error:", error);

    if (error.name === "ZodError") {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Error al actualizar servicio" }), { status: 500 });
  }
};

// DELETE /api/services/:id → eliminar servicio
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), { status: 400 });
    }

    const success = await deleteServiceById(id);

    if (!success) {
      return new Response(JSON.stringify({ error: "Servicio no encontrado" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("DELETE /api/services/:id error:", error);
    return new Response(JSON.stringify({ error: "Error al eliminar servicio" }), { status: 500 });
  }
};
