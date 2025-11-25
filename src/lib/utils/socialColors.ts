// Utilidad para obtener colores de redes sociales automáticamente
// basados en los colores oficiales de cada marca

export const SOCIAL_COLORS: Record<string, string> = {
  facebook: "hover:bg-[#1877F2]",
  instagram: "hover:bg-gradient-to-r hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737]",
  twitter: "hover:bg-[#1DA1F2]",
  x: "hover:bg-black",
  linkedin: "hover:bg-[#0A66C2]",
  youtube: "hover:bg-[#FF0000]",
  whatsapp: "hover:bg-[#25D366]",
  tiktok: "hover:bg-black",
  telegram: "hover:bg-[#26A5E4]",
  github: "hover:bg-[#181717]",
  pinterest: "hover:bg-[#E60023]",
  snapchat: "hover:bg-[#FFFC00]",
  reddit: "hover:bg-[#FF4500]",
  discord: "hover:bg-[#5865F2]",
  slack: "hover:bg-[#4A154B]",
  twitch: "hover:bg-[#9146FF]",
  spotify: "hover:bg-[#1DB954]",
  soundcloud: "hover:bg-[#FF5500]",
  vimeo: "hover:bg-[#1AB7EA]",
  dribbble: "hover:bg-[#EA4C89]",
  behance: "hover:bg-[#1769FF]",
  medium: "hover:bg-[#000000]",
  tumblr: "hover:bg-[#36465D]",
  flickr: "hover:bg-[#0063DC]",
  line: "hover:bg-[#00B900]",
  wechat: "hover:bg-[#09B83E]",
  weibo: "hover:bg-[#E6162D]",
  skype: "hover:bg-[#00AFF0]",
  viber: "hover:bg-[#665CAC]",
  qq: "hover:bg-[#EB1923]",
};

/**
 * Obtiene el color de una red social basándose en su nombre o icono
 */
export function getSocialColor(nameOrIcon: string): string {
  const normalized = nameOrIcon.toLowerCase();
  
  // Buscar coincidencia exacta primero
  for (const [key, color] of Object.entries(SOCIAL_COLORS)) {
    if (normalized.includes(key)) {
      return color;
    }
  }
  
  // Color por defecto
  return "hover:bg-gray-600";
}

/**
 * Obtiene el nombre de la red social desde el icono
 */
export function getSocialName(icon: string): string {
  const parts = icon.split(':');
  const name = parts[parts.length - 1];
  
  // Capitalizar primera letra
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
}

/**
 * Sugiere una URL base para una red social
 */
export function getSocialUrlPlaceholder(nameOrIcon: string): string {
  const normalized = nameOrIcon.toLowerCase();
  
  const urlPatterns: Record<string, string> = {
    facebook: "https://facebook.com/tu-pagina",
    instagram: "https://instagram.com/tu-usuario",
    twitter: "https://twitter.com/tu-usuario",
    x: "https://x.com/tu-usuario",
    linkedin: "https://linkedin.com/company/tu-empresa",
    youtube: "https://youtube.com/@tu-canal",
    whatsapp: "https://wa.me/57tunumero",
    tiktok: "https://tiktok.com/@tu-usuario",
    telegram: "https://t.me/tu-canal",
    github: "https://github.com/tu-usuario",
    pinterest: "https://pinterest.com/tu-usuario",
    reddit: "https://reddit.com/r/tu-subreddit",
    discord: "https://discord.gg/tu-invitacion",
    twitch: "https://twitch.tv/tu-canal",
  };
  
  for (const [key, url] of Object.entries(urlPatterns)) {
    if (normalized.includes(key)) {
      return url;
    }
  }
  
  return "https://";
}
