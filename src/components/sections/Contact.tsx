import { useState } from "react";
import { Icon } from "@iconify/react";
import { useFetchData } from "@lib/hooks/useFetchData";
import SectionHeader from "@components/ui/SectionHeader";
import type { Service, ContactInfo as ContactInfoType, SocialLink as SocialLinkType } from "@lib/models";

export default function Contact() {
  const { data: services, loading: servicesLoading } = useFetchData<Service>("/api/services");
  const { data: contactInfo } = useFetchData<ContactInfoType>("/api/contact-info");
  const { data: socialLinks } = useFetchData<SocialLinkType>("/api/social-links");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
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
      formDataToSend.append("service", formData.service);
      formDataToSend.append("message", formData.message);

      const res = await fetch("/api/contact", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await res.json();

      if (result.success) {
        showNotification(result.message, "success");
        setFormData({ name: "", email: "", service: "", message: "" });
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification(
        "Error al enviar el mensaje. Por favor intenta nuevamente.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen flex items-center py-16 sm:py-20 md:py-24 lg:py-32 bg-linear-to-b from-gray-900/30 via-gray-800/30 to-gray-900/30"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 space-y-12">
        <SectionHeader title="CONTÁCTANOS" />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Información */}
          <div data-animate="fade-right" className="space-y-8">
            <h3 className="text-2xl font-bold mb-6">
              ¿Listo para comenzar tu proyecto?
            </h3>
            <p className="text-gray-300 mb-8">
              Ofrecemos soluciones integrales para proyectos industriales, urbanos y
              rurales. Contáctanos para discutir cómo podemos ayudarte.
            </p>

            <div className="space-y-6">
              {contactInfo.map((item) => {
                const id = item._id ? item._id.toString() : Math.random().toString();
                return (
                  <div
                    key={id}
                    data-animate="fade-up"
                    className="flex items-center gap-4 hover:translate-x-1 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
                      <Icon icon={item.icon} className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{item.title}</p>
                      <p className="text-lg font-medium">{item.content}</p>
                    </div>
                  </div>
                );
              })}

              {/* Redes sociales */}
              {socialLinks.length > 0 && (
                <div
                  data-animate="fade-up"
                  className="mt-8 pt-6 border-t border-gray-700/50"
                >
                  <h4 className="text-lg font-semibold mb-4 text-center">
                    Síguenos en redes sociales
                  </h4>
                  <div className="flex justify-center gap-4">
                    {socialLinks.map((social) => {
                      const id = social._id ? social._id.toString() : Math.random().toString();
                      return (
                        <a
                          key={id}
                          data-animate="zoom-in"
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center text-white text-xl transition-all ${social.color} hover:scale-110`}
                          title={social.name}
                          aria-label={social.name}
                        >
                          <Icon icon={social.icon} className="w-8 h-8" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          <form
            data-animate="fade-left"
            onSubmit={handleSubmit}
            className="bg-linear-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-xl space-y-6"
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

            <div data-animate="fade-up">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div
              data-animate="fade-up"
              style={{ transitionDelay: "100ms" }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Correo electrónico <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                required
              />
            </div>

            <div
              data-animate="fade-up"
              style={{ transitionDelay: "200ms" }}
            >
              <label
                htmlFor="service"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Servicio de interés
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white"
                disabled={servicesLoading}
              >
                <option value="">
                  {servicesLoading ? "Cargando servicios..." : "Selecciona un servicio"}
                </option>
                {services.map((service, index) => (
                  <option key={index} value={service.title}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>

            <div
              data-animate="fade-up"
              style={{ transitionDelay: "300ms" }}
            >
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Mensaje <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Cuéntanos sobre tu proyecto"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500 resize-none"
                required
                minLength={10}
                maxLength={1000}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                {formData.message.length}/1000 caracteres
              </p>
            </div>

            <button
              data-animate="zoom-in"
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
                    Enviando...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:send" className="w-5 h-5" />
                    Enviar mensaje
                  </>
                )}
              </span>
              {!submitting && (
                <span className="absolute inset-0 bg-linear-to-r from-blue-700 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
