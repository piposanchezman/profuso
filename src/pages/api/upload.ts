import type { APIRoute } from "astro";
import { uploadImage, deleteImage } from "@lib/repositories/uploadRepository";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const file = data.get("file") as Blob | null;
    const context = (data.get("context") as string) || "misc";
    const name = (data.get("name") as string)?.trim() || "image";

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    const url = await uploadImage({ blob: file, context, name });

    return new Response(JSON.stringify({ url }), { status: 200 });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return new Response(
      JSON.stringify({ 
        error: "Upload failed", 
        details: errorMessage 
      }), 
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { url } = await request.json();
    await deleteImage(url);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("DELETE IMAGE ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Delete failed";
    return new Response(
      JSON.stringify({ 
        error: "Delete failed", 
        details: errorMessage 
      }), 
      { status: 500 }
    );
  }
};
