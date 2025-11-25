import type { APIRoute } from "astro";
import { createService, getAllServices } from "@lib/repositories/serviceRepository";
import { serviceSchema } from "@lib/models";

// GET /api/services → listar servicios
export const GET: APIRoute = async () => {
  try {
    const services = await getAllServices();
    return new Response(JSON.stringify(services), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return new Response(JSON.stringify({ error: "Error al obtener servicios" }), {
      status: 500,
    });
  }
};

// POST /api/services → crear servicio
export const POST: APIRoute = async ({ request }) => {
  try {
    const json = await request.json();

    // Validación con Zod
    const parsed = serviceSchema.parse(json);

    // Crear servicio
    const service = await createService(parsed);

    return new Response(JSON.stringify(service), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("POST /api/services error:", error);

    // Errores de validación
    if (error.name === "ZodError") {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ error: "Error al crear servicio" }), {
      status: 500,
    });
  }
};
