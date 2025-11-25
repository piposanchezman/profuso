import type { APIRoute } from "astro";
import { getAllSocialLinks, createSocialLink } from "@lib/repositories/socialRepository";
import { socialLinkSchema } from "@lib/models";

export const GET: APIRoute = async () => {
  try {
    const socialLinks = await getAllSocialLinks();
    return new Response(JSON.stringify(socialLinks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching social links:", error);
    return new Response(JSON.stringify({ error: "Error al obtener redes sociales" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = socialLinkSchema.parse(body);
    const id = await createSocialLink(validated);

    return new Response(JSON.stringify({ _id: id, ...validated }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating social link:", error);
    if (error.name === "ZodError") {
      return new Response(JSON.stringify({ error: "Datos inválidos", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Error al crear red social" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
