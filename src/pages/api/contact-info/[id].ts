import type { APIRoute } from "astro";
import { ObjectId } from "mongodb";
import {
  getContactInfoById,
  updateContactInfo,
  deleteContactInfo,
} from "@lib/repositories/contactRepository";
import { contactInfoSchema } from "@lib/models";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contactInfo = await getContactInfoById(id);
    if (!contactInfo) {
      return new Response(JSON.stringify({ error: "No encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(contactInfo), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return new Response(JSON.stringify({ error: "Error del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const validated = contactInfoSchema.partial().parse(body);
    const updated = await updateContactInfo(id, validated);

    if (!updated) {
      return new Response(JSON.stringify({ error: "No se pudo actualizar" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error updating contact info:", error);
    if (error.name === "ZodError") {
      return new Response(JSON.stringify({ error: "Datos inválidos", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Error del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const deleted = await deleteContactInfo(id);
    if (!deleted) {
      return new Response(JSON.stringify({ error: "No encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting contact info:", error);
    return new Response(JSON.stringify({ error: "Error del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
