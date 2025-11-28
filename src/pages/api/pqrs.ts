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
        <title>${isAdmin ? 'Nueva PQR Recibida' : 'Confirmación de PQR'} - PROFUSO</title>
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
          .radicado-box {
            background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 25px 0;
          }
          .radicado-box .label {
            color: #dbeafe;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .radicado-box .number {
            color: #ffffff;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
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
          .type-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .type-peticion { background: #3b82f6; color: #fff; }
          .type-queja { background: #f97316; color: #fff; }
          .type-reclamo { background: #ef4444; color: #fff; }
          .type-sugerencia { background: #eab308; color: #000; }
          .type-felicitacion { background: #22c55e; color: #fff; }
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
          .timeline {
            background: #111827;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .timeline-title {
            color: #60a5fa;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 15px;
          }
          .timeline-item {
            display: flex;
            align-items: start;
            margin-bottom: 12px;
            padding-left: 10px;
            border-left: 2px solid #374151;
          }
          .timeline-item:last-child {
            margin-bottom: 0;
          }
          .timeline-icon {
            background: #3b82f6;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-left: -16px;
            margin-right: 12px;
            margin-top: 6px;
            flex-shrink: 0;
          }
          .timeline-text {
            color: #d1d5db;
            font-size: 14px;
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
          .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .alert-box p {
            color: #78350f;
            font-size: 14px;
            margin: 0;
          }
          @media only screen and (max-width: 600px) {
            .email-body { padding: 30px 20px; }
            .email-header { padding: 20px; }
            .email-footer { padding: 20px; }
            .radicado-box .number { font-size: 24px; }
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

// Función para generar número de radicado único
function generateRadicado(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PQR-${year}${month}${day}-${random}`;
}

// Función para obtener el nombre del tipo de PQR
function getPQRTypeName(type: string): string {
  const types: { [key: string]: string } = {
    'peticion': 'Petición',
    'queja': 'Queja',
    'reclamo': 'Reclamo',
    'sugerencia': 'Sugerencia',
    'felicitacion': 'Felicitación',
  };
  return types[type] || type;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim() || "No proporcionado";
    const type = formData.get("type")?.toString().trim();
    const subject = formData.get("subject")?.toString().trim();
    const message = formData.get("message")?.toString().trim();

    // Validación de campos requeridos
    if (!name || !email || !type || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Por favor completa todos los campos obligatorios." 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validación del nombre
    if (name.length < 3 || name.length > 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "El nombre debe tener entre 3 y 100 caracteres." 
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

    // Validación del tipo
    const validTypes = ['peticion', 'queja', 'reclamo', 'sugerencia', 'felicitacion'];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "El tipo de solicitud no es válido." 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validación del asunto
    if (subject.length < 5 || subject.length > 150) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "El asunto debe tener entre 5 y 150 caracteres." 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validación del mensaje
    if (message.length < 20 || message.length > 2000) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "La descripción debe tener entre 20 y 2000 caracteres." 
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

    // Generar número de radicado
    const radicado = generateRadicado();
    const typeName = getPQRTypeName(type);
    const receivedDate = new Date().toLocaleString('es-ES', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    });

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
      <h2>📋 Nueva PQR Recibida</h2>
      <p>Se ha recibido una nueva solicitud de ${typeName} a través del sistema de PQRs.</p>
      
      <div class="radicado-box">
        <div class="label">Número de Radicado</div>
        <div class="number">${radicado}</div>
      </div>
      
      <div class="info-block">
        <span class="info-label">Tipo de Solicitud</span>
        <div class="info-value">
          <span class="type-badge type-${type}">${typeName}</span>
        </div>
      </div>
      
      <div class="info-block">
        <span class="info-label">Nombre del Solicitante</span>
        <div class="info-value">${name}</div>
      </div>
      
      <div class="info-block">
        <span class="info-label">Email</span>
        <div class="info-value">${email}</div>
      </div>
      
      <div class="info-block">
        <span class="info-label">Teléfono</span>
        <div class="info-value">${phone}</div>
      </div>
      
      <div class="info-block">
        <span class="info-label">Asunto</span>
        <div class="info-value">${subject}</div>
      </div>
      
      <div class="message-box">
        <span class="info-label">Descripción Detallada</span>
        <p>${message}</p>
      </div>
      
      <div class="alert-box">
        <p><strong>⏰ Recordatorio:</strong> Esta solicitud debe ser respondida en un plazo máximo de 15 días hábiles según lo establecido en la normativa.</p>
      </div>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151; color: #9ca3af; font-size: 14px;">
        Recibido el ${receivedDate}
      </p>
    `;

    // Contenido del email para el cliente
    const clientContent = `
      <h2>✅ PQR Recibida Exitosamente</h2>
      <p>Estimado/a ${name},</p>
      <p>Hemos recibido tu ${typeName.toLowerCase()} y ha sido registrada en nuestro sistema con el siguiente número de radicado:</p>
      
      <div class="radicado-box">
        <div class="label">Tu Número de Radicado</div>
        <div class="number">${radicado}</div>
      </div>
      
      <p style="text-align: center; color: #9ca3af; font-size: 14px; margin-top: -10px;">
        Por favor conserva este número para hacer seguimiento a tu solicitud
      </p>
      
      <div class="divider" style="margin: 25px 0;"></div>
      
      <h3 style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">Resumen de tu solicitud:</h3>
      
      <div class="info-block">
        <span class="info-label">Tipo</span>
        <div class="info-value">
          <span class="type-badge type-${type}">${typeName}</span>
        </div>
      </div>
      
      <div class="info-block">
        <span class="info-label">Asunto</span>
        <div class="info-value">${subject}</div>
      </div>
      
      <div class="message-box">
        <span class="info-label">Descripción</span>
        <p>${message}</p>
      </div>
      
      <div class="timeline">
        <div class="timeline-title">📅 Próximos pasos:</div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-text"><strong>Hoy:</strong> Recepción y radicación de la solicitud</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-text"><strong>Próximos días:</strong> Revisión y análisis por nuestro equipo</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-text"><strong>Máximo 15 días hábiles:</strong> Respuesta oficial a tu correo ${email}</div>
        </div>
      </div>
      
      <div class="alert-box">
        <p><strong>📧 Importante:</strong> Recibirás nuestra respuesta a la dirección de correo electrónico registrada. Por favor revisa tu bandeja de spam si no ves nuestro correo.</p>
      </div>
      
      <p style="margin-top: 25px; color: #d1d5db;">
        Si necesitas información adicional sobre tu solicitud, por favor menciona el número de radicado <strong style="color: #60a5fa;">${radicado}</strong> en tu comunicación.
      </p>
      
      <p style="margin-top: 20px; color: #d1d5db;">
        Gracias por confiar en PROFUSO.
      </p>
    `;

    // Enviar correo al administrador
    await transporter.sendMail({
      from: `"Sistema PQRs PROFUSO" <${smtpUser}>`,
      to: process.env.ADMIN_EMAIL || import.meta.env.ADMIN_EMAIL || "piposanchezman@gmail.com",
      replyTo: email,
      subject: `🔔 Nueva PQR [${radicado}] - ${typeName}: ${subject}`,
      html: createEmailTemplate(adminContent, true),
    });

    // Enviar correo de confirmación al cliente
    await transporter.sendMail({
      from: `"PROFUSO - Sistema PQRs" <${smtpUser}>`,
      to: email,
      subject: `Confirmación de PQR [${radicado}] - ${typeName}`,
      html: createEmailTemplate(clientContent, false),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `¡Tu ${typeName.toLowerCase()} ha sido registrada con éxito! Número de radicado: ${radicado}. Recibirás una confirmación en tu correo electrónico.`,
        radicado: radicado
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error al procesar PQR:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Lo sentimos, hubo un error al procesar tu solicitud. Por favor intenta nuevamente o contáctanos directamente." 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
