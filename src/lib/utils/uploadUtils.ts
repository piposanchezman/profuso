export async function uploadBlob(blob: Blob, context: string, name: string) {
  const fd = new FormData();
  fd.append("file", blob);
  fd.append("context", context);
  fd.append("name", name);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Error al subir imagen");
  const { url } = await res.json();
  return url as string;
}

export async function deleteRemoteImage(url: string) {
  // Solo proteger assets estáticos del proyecto
  if (/^\/(assets|src)\//.test(url)) return;
  await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}
