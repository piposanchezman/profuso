import { useState } from "react";
import { Icon } from "@iconify/react";
import SectionHeader from "@components/ui/SectionHeader";

const PQR_TYPES = [
  { value: "peticion", label: "Petición", icon: "mdi:message-question", color: "blue" },
  { value: "queja", label: "Queja", icon: "mdi:alert-circle", color: "orange" },
  { value: "reclamo", label: "Reclamo", icon: "mdi:alert-octagon", color: "red" },
  { value: "sugerencia", label: "Sugerencia", icon: "mdi:lightbulb", color: "yellow" },
  { value: "felicitacion", label: "Felicitación", icon: "mdi:star", color: "green" },
];

export default function PQRs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("subject", formData.subject);
      formDataToSend.append("message", formData.message);

      const res = await fetch("/api/pqrs", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await res.json();

      if (result.success) {
        showNotification(result.message, "success");
        setFormData({ name: "", email: "", phone: "", type: "", subject: "", message: "" });
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification(
        "Error al enviar la solicitud. Por favor intenta nuevamente.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = PQR_TYPES.find(t => t.value === formData.type);

  return (
    <section
      id="pqrs"
      className="relative min-h-screen flex items-center py-16 sm:py-20 md:py-24 lg:py-32 bg-linear-to-b from-gray-800/30 via-gray-900/30 to-gray-800/30"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 space-y-12">
        <SectionHeader title="PQRs - ATENCIÓN AL CLIENTE" />

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Información sobre PQRs */}
          <div data-animate="fade-right" className="space-y-8">
            <div className="bg-linear-to-br from-blue-900/20 to-teal-900/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-700/30">
              <h3 className="text-2xl font-bold mb-4 text-blue-400">
                ¿Qué es una PQR?
              </h3>
              <p className="text-gray-300 mb-6">
                Las PQRs (Peticiones, Quejas y Reclamos) son un canal oficial para que nuestros 
                clientes y usuarios puedan comunicarse con nosotros de manera formal.
              </p>
              
              <div className="space-y-4">
                {PQR_TYPES.map((type) => (
                  <div
                    key={type.value}
                    data-animate="fade-up"
                    className="flex items-start gap-4 p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${type.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                      <Icon icon={type.icon} className={`w-6 h-6 text-${type.color}-400`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-${type.color}-400 mb-1`}>
                        {type.label}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {type.value === "peticion" && "Solicitud de información, documentos o trámites."}
                        {type.value === "queja" && "Manifestación de inconformidad sobre un servicio o atención."}
                        {type.value === "reclamo" && "Exigencia sobre el cumplimiento de un derecho o servicio."}
                        {type.value === "sugerencia" && "Propuesta para mejorar nuestros servicios."}
                        {type.value === "felicitacion" && "Reconocimiento positivo sobre nuestro servicio."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-900/10 border border-yellow-600/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Icon icon="mdi:information" className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">
                    Tiempo de respuesta
                  </h4>
                  <p className="text-sm text-gray-300">
                    Nos comprometemos a responder tu solicitud en un plazo máximo de <strong>15 días hábiles</strong>.
                    Recibirás una confirmación inmediata por correo electrónico con tu número de radicado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form
            data-animate="fade-left"
            onSubmit={handleSubmit}
            className="bg-linear-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-xl space-y-6 sticky top-24"
          >
            {/* Notificación */}
            {notification.show && (
              <div
                className={`p-4 rounded-lg border ${
                  notification.type === "success"
                    ? "bg-green-500/10 border-green-500/50 text-green-400"
                    : "bg-red-500/10 border-red-500/50 text-red-400"
                } animate-in`}
              >
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="pqr-type"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Tipo de solicitud <span className="text-red-400">*</span>
              </label>
              <select
                id="pqr-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white"
                required
              >
                <option value="">Selecciona el tipo de solicitud</option>
                {PQR_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {selectedType && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <Icon icon={selectedType.icon} className={`w-4 h-4 text-${selectedType.color}-400`} />
                  {selectedType.label} seleccionada
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pqr-name"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Nombre completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="pqr-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pqr-email"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Correo electrónico <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="pqr-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="pqr-phone"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="pqr-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="320 123 4567"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                  maxLength={15}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="pqr-subject"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Asunto <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="pqr-subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Breve descripción del asunto"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                required
                minLength={5}
                maxLength={150}
              />
            </div>

            <div>
              <label
                htmlFor="pqr-message"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Descripción detallada <span className="text-red-400">*</span>
              </label>
              <textarea
                id="pqr-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Describe tu solicitud de manera detallada..."
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500 resize-none"
                required
                minLength={20}
                maxLength={2000}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                {formData.message.length}/2000 caracteres
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full px-8 py-4 bg-linear-to-r from-blue-600 to-teal-500 rounded-lg font-medium text-white relative overflow-hidden group transition-all ${
                submitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando solicitud...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:file-document-edit" className="w-5 h-5" />
                    Enviar solicitud
                  </>
                )}
              </span>
              {!submitting && (
                <span className="absolute inset-0 bg-linear-to-r from-blue-700 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Al enviar esta solicitud, aceptas que PROFUSO procese tus datos personales 
              de acuerdo con nuestra política de privacidad.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
