import type { APIRoute } from "astro";
import { getAllProjects, createProject } from "@lib/repositories/projectRepository";
import { projectSchema } from "@lib/models";

// GET /api/projects → listar proyectos
export const GET: APIRoute = async () => {
  try {
    const projects = await getAllProjects();
    return new Response(JSON.stringify(projects), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return new Response(JSON.stringify({ error: "Error al obtener proyectos" }), { status: 500 });
  }
};

// POST /api/projects → crear nuevo proyecto
export const POST: APIRoute = async ({ request }) => {
  try {
    const json = await request.json();

    // Validación con Zod
    const parsed = projectSchema.parse(json);

    // Crear proyecto
    const project = await createProject(parsed);

    return new Response(JSON.stringify(project), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("POST /api/projects error:", error);

    // Errores de validación
    if (error.name === "ZodError") {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ error: "Error al crear proyecto" }), {
      status: 500,
    });
  }
};
