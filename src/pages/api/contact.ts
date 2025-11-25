import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

// Función helper para crear el HTML del email
function createEmailTemplate(content: string, isAdmin: boolean = false): string {
  const currentYear = new Date().getFullYear();
  const baseUrl = import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321";
  
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isAdmin ? 'Nuevo Contacto' : 'Gracias por Contactarnos'} - PROFUSO</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            padding: 40px 20px;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #111827;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          }
          .email-header {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            padding: 30px;
            text-align: center;
            border-bottom: 2px solid #374151;
          }
          .email-header img {
            max-width: 200px;
            height: auto;
            filter: brightness(1.2) contrast(1.1);
          }
          .email-body {
            padding: 40px 30px;
            background: #1f2937;
            color: #e5e7eb;
          }
          .email-body h2 {
            color: #60a5fa;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 700;
          }
          .email-body p {
            color: #d1d5db;
            font-size: 16px;
            margin-bottom: 15px;
          }
          .info-block {
            background: #111827;
            border-left: 4px solid #3b82f6;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .info-label {
            color: #60a5fa;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            display: block;
          }
          .info-value {
            color: #f3f4f6;
            font-size: 16px;
            word-wrap: break-word;
          }
          .message-box {
            background: #111827;
            border: 1px solid #374151;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .message-box p {
            color: #e5e7eb;
            white-space: pre-wrap;
            margin: 0;
          }
          .email-footer {
            background: #111827;
            padding: 30px;
            text-align: center;
            border-top: 2px solid #374151;
          }
          .email-footer img {
            max-width: 150px;
            height: auto;
            margin-bottom: 15px;
          }
          .email-footer p {
            color: #9ca3af;
            font-size: 14px;
            margin: 5px 0;
          }
          .divider {
            height: 2px;
            background: linear-gradient(to right, #3b82f6, #06b6d4);
            margin: 30px 0;
            border-radius: 2px;
          }
          @media only screen and (max-width: 600px) {
            .email-body { padding: 30px 20px; }
            .email-header { padding: 20px; }
            .email-footer { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="${baseUrl}/profuso-text.webp" alt="PROFUSO" />
          </div>
          <div class="email-body">
            ${content}
          </div>
          <div class="email-footer">
            <div class="divider"></div>
            <img src="${baseUrl}/sociedades-bic.webp" alt="Sociedades BIC" />
            <p>&copy; ${currentYear} PROFUSO - Todos los derechos reservados</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
              Sociedad de Beneficio e Interés Colectivo
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const service = formData.get("service")?.toString().trim();
    const message = formData.get("message")?.toString().trim();

    // Validación de campos requeridos
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Por favor completa todos los campos obligatorios." 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validación del nombre
    if (name.length < 2 || name.length > 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "El nombre debe tener entre 2 y 100 caracteres." 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validación del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Por favor ingresa un correo electrónico válido." 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validación del mensaje
    if (message.length < 10 || message.length > 1000) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "El mensaje debe tener entre 10 y 1000 caracteres." 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validación de variables de entorno
    const smtpUser = process.env.SMTP_USER || import.meta.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS || import.meta.env.SMTP_PASS;
    
    if (!smtpUser || !smtpPass) {
      console.error("Faltan credenciales SMTP en las variables de entorno");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Error de configuración del servidor. Por favor contacta al administrador." 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verificar conexión
    await transporter.verify();

    // Contenido del email para el administrador
    const adminContent = `
      <h2>📩 Nuevo Mensaje de Contacto</h2>
      <p>Has recibido un nuevo mensaje desde el formulario de contacto de la página web.</p>
      
      <div class="info-block">
        <span class="info-label">Nombre</span>
        <div class="info-value">${name}</div>
      </div>
      
      <div class="info-block">
        <span class="info-label">Email</span>
        <div class="info-value">${email}</div>
      </div>
      
      ${service ? `
        <div class="info-block">
          <span class="info-label">Servicio de Interés</span>
          <div class="info-value">${service}</div>
        </div>
      ` : ''}
      
      <div class="message-box">
        <span class="info-label">Mensaje</span>
        <p>${message}</p>
      </div>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151; color: #9ca3af; font-size: 14px;">
        Recibido el ${new Date().toLocaleString('es-ES', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })}
      </p>
    `;

    // Contenido del email para el cliente
    const clientContent = `
      <h2>✅ ¡Gracias por contactarnos, ${name}!</h2>
      <p>Hemos recibido tu mensaje correctamente y nuestro equipo lo revisará a la brevedad posible.</p>
      
      <div class="divider" style="margin: 25px 0;"></div>
      
      <h3 style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">Resumen de tu mensaje:</h3>
      
      ${service ? `
        <div class="info-block">
          <span class="info-label">Servicio de Interés</span>
          <div class="info-value">${service}</div>
        </div>
      ` : ''}
      
      <div class="message-box">
        <span class="info-label">Tu Mensaje</span>
        <p>${message}</p>
      </div>
      
      <p style="margin-top: 25px; color: #d1d5db;">
        Nos pondremos en contacto contigo pronto a través de <strong style="color: #60a5fa;">${email}</strong>
      </p>
      
      <p style="margin-top: 20px; padding: 15px; background: #111827; border-radius: 8px; border-left: 4px solid #10b981; color: #d1d5db;">
        💡 <strong>Nota:</strong> Si no recibes respuesta en 48 horas hábiles, por favor revisa tu carpeta de spam o contacta directamente a través de nuestras redes sociales.
      </p>
    `;

    // Enviar correo al administrador
    await transporter.sendMail({
      from: `"Formulario Web PROFUSO" <${smtpUser}>`,
      to: process.env.ADMIN_EMAIL || import.meta.env.ADMIN_EMAIL || "piposanchezman@gmail.com",
      replyTo: email,
      subject: `🔔 Nuevo Contacto Web${service ? ` - ${service}` : ''}`,
      html: createEmailTemplate(adminContent, true),
    });

    // Enviar correo de confirmación al cliente
    await transporter.sendMail({
      from: `"PROFUSO" <${smtpUser}>`,
      to: email,
      subject: "Gracias por contactar a PROFUSO",
      html: createEmailTemplate(clientContent, false),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "¡Mensaje enviado correctamente! Pronto nos pondremos en contacto contigo." 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error al enviar correo:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Lo sentimos, hubo un error al enviar tu mensaje. Por favor intenta nuevamente o contáctanos directamente." 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
