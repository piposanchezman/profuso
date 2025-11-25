// Script para poblar la base de datos con información de contacto y redes sociales iniciales
// Ejecutar con: node --loader ts-node/esm src/scripts/seedContactData.ts

import { getDatabase } from "../lib/db";
import { COLLECTIONS } from "../lib/models";

async function seedContactData() {
  try {
    const db = await getDatabase();

    // Datos de información de contacto
    const contactInfo = [
      {
        icon: "mdi:phone",
        title: "Teléfono",
        content: "320 855 4400",
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        icon: "mdi:email-outline",
        title: "Correo electrónico",
        content: "gerencia@profuso.co",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        icon: "mdi:map-marker",
        title: "Cobertura",
        content: "A nivel nacional",
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        icon: "mdi:web",
        title: "Sitio web",
        content: "www.profuso.co",
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Datos de redes sociales
    const socialLinks = [
      {
        name: "Facebook",
        icon: "mdi:facebook",
        url: "https://facebook.com/profuso",
        color: "hover:bg-blue-600",
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Instagram",
        icon: "mdi:instagram",
        url: "https://instagram.com/profuso",
        color: "hover:bg-pink-600",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Verificar si ya existen datos
    const existingContact = await db.collection(COLLECTIONS.CONTACT_INFO).countDocuments();
    const existingSocial = await db.collection(COLLECTIONS.SOCIAL_LINKS).countDocuments();

    if (existingContact === 0) {
      await db.collection(COLLECTIONS.CONTACT_INFO).insertMany(contactInfo);
      console.log(`✅ Se insertaron ${contactInfo.length} registros de información de contacto`);
    } else {
      console.log(`ℹ️  Ya existen ${existingContact} registros de información de contacto`);
    }

    if (existingSocial === 0) {
      await db.collection(COLLECTIONS.SOCIAL_LINKS).insertMany(socialLinks);
      console.log(`✅ Se insertaron ${socialLinks.length} registros de redes sociales`);
    } else {
      console.log(`ℹ️  Ya existen ${existingSocial} registros de redes sociales`);
    }

    console.log("\n✅ Proceso completado exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al poblar los datos:", error);
    process.exit(1);
  }
}

seedContactData();
