import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import ImageCard from "@components/ui/ImageCard";
import ServiceModal from "@components/modals/ServiceModal";
import ProjectModal from "@components/modals/ProjectModal";
import ContactInfoModal from "@components/modals/ContactInfoModal";
import SocialLinkModal from "@components/modals/SocialLinkModal";
import ConfirmModal from "@components/ui/ConfirmModal";
import SortableList from "@components/ui/SortableList";
import { Section } from "@components/ui/AdminComponents";
import { useEntityCrud } from "@lib/hooks/useEntityCrud";
import { useReorder } from "@lib/hooks/useReorder";
import type { Service, Project, ContactInfo, SocialLink } from "@lib/models";

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks para operaciones CRUD
  const serviceCrud = useEntityCrud<Service>("/api/services");
  const projectCrud = useEntityCrud<Project>("/api/projects");
  const contactCrud = useEntityCrud<ContactInfo>("/api/contact-info");
  const socialCrud = useEntityCrud<SocialLink>("/api/social-links");

  // Hooks para reordenamiento
  const { reorderItems: reorderContacts } = useReorder(setContactInfo, "/api/contact-info");
  const { reorderItems: reorderSocials } = useReorder(setSocialLinks, "/api/social-links");

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null);

  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<SocialLink | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [servicesRes, projectsRes, contactRes, socialRes] = await Promise.all([
        fetch("/api/services").then((r) => r.json()),
        fetch("/api/projects").then((r) => r.json()),
        fetch("/api/contact-info").then((r) => r.json()),
        fetch("/api/social-links").then((r) => r.json()),
      ]);

      setServices(servicesRes);
      setProjects(projectsRes);
      // Ordenar por campo order
      setContactInfo(contactRes.sort((a: ContactInfo, b: ContactInfo) => a.order - b.order));
      setSocialLinks(socialRes.sort((a: SocialLink, b: SocialLink) => a.order - b.order));
    } catch (err) {
      setError("Error cargando datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function refresh() {
    await loadData();
    setSelectedService(null);
    setSelectedProject(null);
    setSelectedContact(null);
    setSelectedSocial(null);
    setServiceModalOpen(false);
    setProjectModalOpen(false);
    setContactModalOpen(false);
    setSocialModalOpen(false);
  }

  async function openService(id: string) {
    const data = await serviceCrud.fetchEntity(id);
    if (data) {
      setSelectedService(data);
      setServiceModalOpen(true);
    } else {
      alert("Error cargando servicio");
    }
  }

  async function handleDelete(deleteFn: (id: string) => Promise<boolean>, id: string, entityName: string) {
    const success = await deleteFn(id);
    if (success) {
      await refresh();
    } else {
      alert(`No se pudo eliminar ${entityName}`);
    }
  }

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setConfirmOpen(true);
  };

  // Renderizado condicional basado en el estado de carga y error
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-300 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md p-6 bg-red-900/20 border border-red-500/50 rounded-lg">
          <svg className="w-16 h-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-semibold text-red-400">Error al cargar</h3>
          <p className="text-red-300">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header sticky */}
      <header className="sticky top-0 z-40 bg-gray-900/95 border-b border-gray-800 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Panel de Administración</h1>
            <p className="text-gray-400 text-sm">Gestiona los servicios, proyectos e información de PROFUSO</p>
          </div>
          <button
            onClick={() => (window as any).Clerk?.signOut()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Secciones */}

      {/* Servicios */}
      <Section
        title="Servicios"
        buttonLabel="Agregar"
        onNew={() => {
          setSelectedService(null);
          setServiceModalOpen(true);
        }}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const id = service._id ? service._id.toString() : "";
            return (
              <div
                key={id}
                className="relative group p-4 rounded-lg border border-gray-700 space-y-3 cursor-pointer hover:scale-[1.02] transition transform"
                style={{
                  background: `linear-gradient(135deg, ${service.fromColor}, ${service.toColor})`,
                }}
                onClick={() => openService(id)}
              >
                {/* Botón eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showConfirm(
                      "Eliminar servicio",
                      `¿Seguro que deseas eliminar "${service.title}"?`,
                      () => handleDelete(serviceCrud.deleteEntity, id, "el servicio")
                    );
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-md px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  ✕
                </button>

                {service.images && service.images.length > 0 && (
                  <ImageCard images={service.images} alt={service.title} />
                )}
                <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                <p className="text-gray-200 line-clamp-3">{service.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Proyectos */}
      <Section
        title="Proyectos"
        buttonLabel="Agregar"
        onNew={() => {
          setSelectedProject(null);
          setProjectModalOpen(true);
        }}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project) => {
            const id = project._id ? project._id.toString() : "";
            return (
              <div
                key={id}
                className="relative group bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3 cursor-pointer hover:scale-[1.02] transition"
                onClick={() => {
                  setSelectedProject(project);
                  setProjectModalOpen(true);
                }}
              >
                {/* Botón eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showConfirm(
                      "Eliminar proyecto",
                      `¿Seguro que deseas eliminar "${project.title}"?`,
                      () => handleDelete(projectCrud.deleteEntity, id, "el proyecto")
                    );
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-md px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  ✕
                </button>

                {project.images && project.images.length > 0 && (
                  <ImageCard images={project.images} alt={project.title} />
                )}
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <p className="text-gray-400 line-clamp-3">{project.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Contacto */}
      <Section
        title="Contacto"
        buttonLabel="Agregar"
        onNew={() => {
          setSelectedContact(null);
          setContactModalOpen(true);
        }}
      >
        <SortableList
          items={contactInfo}
          onReorder={reorderContacts}
          onEdit={(info) => {
            setSelectedContact(info);
            setContactModalOpen(true);
          }}
          onDelete={(info) => {
            const id = info._id ? info._id.toString() : "";
            showConfirm(
              "Eliminar información",
              `¿Seguro que deseas eliminar "${info.title}"?`,
              () => handleDelete(contactCrud.deleteEntity, id, "la información")
            );
          }}
          renderItem={(info) => (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3 h-full hover:scale-[1.02] transition">
              <div className="flex items-center gap-3">
                <Icon icon={info.icon} className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{info.title}</h3>
                  <p className="text-gray-400">{info.content}</p>
                </div>
              </div>
            </div>
          )}
        />
      </Section>

      {/* Redes Sociales */}
      <Section
        title="Redes Sociales"
        buttonLabel="Agregar"
        onNew={() => {
          setSelectedSocial(null);
          setSocialModalOpen(true);
        }}
      >
        <SortableList
          items={socialLinks}
          onReorder={reorderSocials}
          onEdit={(social) => {
            setSelectedSocial(social);
            setSocialModalOpen(true);
          }}
          onDelete={(social) => {
            const id = social._id ? social._id.toString() : "";
            showConfirm(
              "Eliminar red social",
              `¿Seguro que deseas eliminar "${social.name}"?`,
              () => handleDelete(socialCrud.deleteEntity, id, "la red social")
            );
          }}
          renderItem={(social) => (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3 h-full hover:scale-[1.02] transition">
              <div className="flex items-center gap-3">
                <Icon icon={social.icon} className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{social.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{social.url}</p>
                </div>
              </div>
            </div>
          )}
        />
      </Section>

      {/* Modales */}
      <ServiceModal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        onSave={refresh}
        initialService={selectedService}
      />
      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={refresh}
        initialProject={selectedProject}
      />
      <ContactInfoModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSave={refresh}
        editingItem={selectedContact}
      />
      <SocialLinkModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        onSave={refresh}
        editingItem={selectedSocial}
      />
      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          confirmAction();
          setConfirmOpen(false);
        }}
        onClose={() => setConfirmOpen(false)}
      />
      </div>
    </div>
  );
}
