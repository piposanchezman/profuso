import type { APIRoute } from "astro";
import { getAllContactInfo, createContactInfo } from "@lib/repositories/contactRepository";
import { contactInfoSchema } from "@lib/models";

export const GET: APIRoute = async () => {
  try {
    const contactInfo = await getAllContactInfo();
    return new Response(JSON.stringify(contactInfo), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return new Response(JSON.stringify({ error: "Error al obtener información de contacto" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = contactInfoSchema.parse(body);
    const id = await createContactInfo(validated);

    return new Response(JSON.stringify({ _id: id, ...validated }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating contact info:", error);
    if (error.name === "ZodError") {
      return new Response(JSON.stringify({ error: "Datos inválidos", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Error al crear información de contacto" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
