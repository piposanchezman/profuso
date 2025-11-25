import type { APIRoute } from "astro";
import { ObjectId } from "mongodb";
import {
  getSocialLinkById,
  updateSocialLink,
  deleteSocialLink,
} from "@lib/repositories/socialRepository";
import { socialLinkSchema } from "@lib/models";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "ID inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const socialLink = await getSocialLinkById(id);
    if (!socialLink) {
      return new Response(JSON.stringify({ error: "No encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(socialLink), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching social link:", error);
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
    const validated = socialLinkSchema.partial().parse(body);
    const updated = await updateSocialLink(id, validated);

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
    console.error("Error updating social link:", error);
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

    const deleted = await deleteSocialLink(id);
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
    console.error("Error deleting social link:", error);
    return new Response(JSON.stringify({ error: "Error del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
