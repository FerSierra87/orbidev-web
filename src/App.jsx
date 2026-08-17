// ============================================================
// DEPENDENCIAS
// ============================================================

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  getStoredAnalyticsConsent,
  isAnalyticsConfigured,
  loadGoogleAnalytics,
  saveAnalyticsConsent,
  trackPageView,
} from './analytics.js';

// Carga diferida: Three.js/GSAP pesan ~260kB gzip, no deben bloquear el
// render inicial de la página. Se baja en segundo plano después del
// primer paint; hasta entonces el fondo cyber existente queda tal cual.
const BlackHoleHero = lazy(() => import('./BlackHoleHero.jsx'));

const initialTicket = {
  name: '',
  company: '',
  email: '',
  desc: '',
  tipo: 'landing',
};

// URL pública de ORBIDEV Inbox. Sin secreto involucrado: el endpoint
// /api/v1/public/contact no requiere autenticación (ver
// orbidev-inbox/backend), así que es seguro llamarlo directo desde acá.
const INBOX_API_URL =
  import.meta.env.VITE_INBOX_API_URL ?? 'https://orbidev-inbox-api-production.up.railway.app';

export default function App() {
  // ============================================================
  // NAVEGACIÓN Y RUTAS
  // Relaciona cada URL pública con la sección interna existente.
  // Se conservan los ids "terminal" y "soporte" para mantener
  // compatibilidad con la estructura original de la aplicación.
  // ============================================================

  const location = useLocation();
  const navigate = useNavigate();

  const routeToTab = {
    '/': 'inicio',
    '/servicios': 'terminal',
    '/proyectos': 'proyectos',
    '/contacto': 'soporte',
  };

  const activeTab = routeToTab[location.pathname] || 'inicio';

  // ============================================================
  // CONFIGURACIÓN SEO POR RUTA
  // Títulos, descripciones y canonical se actualizan según la URL.
  // ============================================================

  const seoData = {
  '/': {
    title: 'Orbidev | Soluciones digitales',
    description:
      'Desarrollamos sitios web, sistemas a medida, automatizaciones y soluciones digitales para pequeñas y medianas empresas.',
  },
  '/servicios': {
    title: 'Servicios | Orbidev',
    description:
      'Conocé los servicios de Orbidev: desarrollo web, sistemas a medida, automatización de procesos, tiendas online y consultoría tecnológica.',
  },
  '/proyectos': {
    title: 'Proyectos | Orbidev',
    description:
      'Conocé ORBIDEV Reserva y proyectos técnicos de desarrollo web, automatización, datos y sistemas de gestión.',
  },
  '/contacto': {
    title: 'Contacto | Orbidev',
    description:
      'Contactá a Orbidev para conversar sobre tu próximo sitio web, sistema, automatización o solución digital para tu empresa.',
  },
};

  const currentSeo = seoData[location.pathname] || seoData['/'];

  // ============================================================
  // ESTADO DE LA INTERFAZ
  // ============================================================

  // Porcentaje de desplazamiento vertical del panel principal.
  const [scrollPercent, setScrollPercent] = useState(0);
  
  // Estado para el menú lateral colapsable (responsive)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estado para controlar qué proyecto está abierto en el modal de detalles
  const [selectedProject, setSelectedProject] = useState(null);

  // Estado para la pregunta frecuente abierta (acordeón, solo una a la vez)
  const [openFaq, setOpenFaq] = useState(null);

  const [analyticsConsent, setAnalyticsConsent] = useState(
    getStoredAnalyticsConsent,
  );
  const [showAnalyticsConsent, setShowAnalyticsConsent] = useState(
    isAnalyticsConfigured && !getStoredAnalyticsConsent(),
  );
  
  // Datos del formulario de contacto.
  const [ticket, setTicket] = useState(initialTicket);

  // Formspree procesa y envía las consultas recibidas desde el sitio.
  const [formState, handleFormSubmit, resetForm] = useForm('xojgkepz');

  // ============================================================
  // REFERENCIAS DE INTERFAZ
  // ============================================================

  // Referencia para el contenedor principal con scroll.
  const scrollContainerRef = useRef(null);

  // Calcula el porcentaje de scroll del panel de contenido de forma segura
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll > 0) {
        const percent = (scrollTop / totalScroll) * 100;
        setScrollPercent(Math.round(percent));
      } else {
        setScrollPercent(0);
      }
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================
  // FUNCIONES DE NAVEGACIÓN
  // ============================================================

  // Navega a una ruta, cierra el menú móvil y reinicia el scroll.
  const navigateTo = (tabId) => {
    const tabToRoute = {
    inicio: '/',
    terminal: '/servicios',
    proyectos: '/proyectos',
    soporte: '/contacto',
    };

    navigate(tabToRoute[tabId] || '/');

    setIsSidebarOpen(false);
    setScrollPercent(0);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const resetContactForm = () => {
    resetForm();
    setTicket(initialTicket);
    scrollToTop();
  };

  const handleAnalyticsChoice = (consent) => {
    saveAnalyticsConsent(consent);
    setAnalyticsConsent(consent);
    setShowAnalyticsConsent(false);
  };

  useEffect(() => {
    if (analyticsConsent === 'granted') loadGoogleAnalytics();
  }, [analyticsConsent]);

  useEffect(() => {
    if (analyticsConsent === 'granted') {
      trackPageView(location.pathname, currentSeo.title);
    }
  }, [analyticsConsent, currentSeo.title, location.pathname]);

  useEffect(() => {
    if (!selectedProject) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedProject]);

  // ============================================================
  // ASISTENTE ORBIT
  // Mensajes adaptativos según el avance de lectura en Inicio.
  // ============================================================

  const getMascotMessage = () => {
  if (scrollPercent < 25) {
    return 'Primero entendemos qué necesita realmente tu empresa.';
  }

  if (scrollPercent < 50) {
    return 'Podemos comenzar con una solución pequeña y ampliarla cuando sea necesario.';
  }

  if (scrollPercent < 75) {
    return 'Diseñamos sitios, sistemas y automatizaciones para simplificar procesos.';
  }

  if (scrollPercent < 99) {
    return 'Ya conocés cómo trabajamos. El siguiente paso es contarnos tu necesidad.';
  }

    return '¡Recorrido completado! ¿Hablamos de tu próximo proyecto?';
  };

  // ============================================================
  // DATOS DE PROYECTOS
  // Información usada por las tarjetas y el modal de detalle.
  // ============================================================

  const projectsData = [
  {
    id: 1,
    title: 'Sitio corporativo Orbidev',
    tag: 'React 19 · Vite 8 · Tailwind CSS 4 · Firebase Hosting',
    desc: 'Sitio corporativo responsive con navegación por rutas, SEO por sección y contacto integrado.',
    longDesc:
      'Sitio corporativo construido con React 19, Vite 8 y Tailwind CSS 4. Usa React Router para sus rutas, React Helmet Async para metadatos y Formspree para el formulario de contacto. La aplicación se compila como sitio estático y se despliega mediante Firebase Hosting.',
    icon: 'fa-window-maximize',
    color: 'text-cyber-cyan',
    github: 'https://github.com/FerSierra87/orbidev-web',
  },
  {
    id: 2,
    title: 'Migración y limpieza de datos',
    tag: 'Python · pandas · SQLAlchemy · PostgreSQL/MySQL',
    desc: 'Herramienta de línea de comandos para limpiar CSV/XLSX y cargar sus datos en bases SQL.',
    longDesc:
      'Script en Python que lee archivos CSV y Excel con pandas, normaliza nombres de columnas, elimina filas vacías y duplicados, genera un reporte y migra el resultado con SQLAlchemy. Incluye control dry-run y conectores para PostgreSQL y MySQL.',
    icon: 'fa-database',
    color: 'text-cyber-emerald',
    github: 'https://github.com/FerSierra87/sql-python-data-migration',
  },
  {
    id: 3,
    title: 'Panel Control L1',
    tag: 'React 18 · Vite 5 · Tailwind CSS 4 · localStorage',
    desc: 'Panel de triage que clasifica tickets por reglas y sugiere prioridad y escalamiento.',
    longDesc:
      'Aplicación frontend construida con React 18, Vite 5 y Tailwind CSS 4. Un motor local de reglas por palabras clave clasifica cada ticket, asigna prioridad y sugiere si debe escalarse a L2. El dashboard, los filtros y la persistencia funcionan en el navegador mediante localStorage; no utiliza backend ni inteligencia artificial.',
    icon: 'fa-list-check',
    color: 'text-cyber-purple',
    github: 'https://github.com/FerSierra87/panel-control-l1',
    demo: 'https://panel-control-l1-orbidev.web.app',
  },
  {
  id: 4,
  title: 'Helpdesk Core',
  tag: 'Java 21 · Spring Boot 3.5 · PostgreSQL · React 18',
  desc: 'Sistema full-stack para gestionar clientes, equipos y tickets relacionados.',
  longDesc:
    'Solución con API REST en Java 21 y Spring Boot 3.5, persistencia JPA sobre PostgreSQL alojado en Supabase y despliegue Docker en Render. El frontend independiente usa React 18, Vite 5 y Tailwind CSS 4, consume la API con fetch y se publica en Firebase Hosting.',
  icon: 'fa-server',
  color: 'text-cyber-blue',
  github: 'https://github.com/FerSierra87/helpdesk-core',
  githubFrontend:
    'https://github.com/FerSierra87/helpdesk-core-frontend',
  demo: 'https://helpdesk-core-one.web.app',
},
  ];

  // ============================================================
  // CONTACTO POR WHATSAPP
  // Construye un mensaje con los datos actuales del formulario.
  // ============================================================

  const serviceLabels = {
    reserva: 'ORBIDEV Reserva — piloto',
    landing: 'Sitio web o landing page',
    sistema: 'Sistema a medida',
    automatizacion: 'Automatización de procesos',
    ecommerce: 'Tienda online',
    datos: 'Datos e integraciones',
    otro: 'Otra consulta',
  };

  // ============================================================
  // PREGUNTAS FRECUENTES
  // ============================================================

  const faqData = [
    {
      question: '¿Qué es Orbidev y qué hace?',
      answer:
        'Somos un estudio de desarrollo que diseña y construye soluciones digitales para empresas: sitios web, tiendas online, sistemas a medida y automatizaciones. Nos encargamos de todo el proceso, desde entender el problema hasta dejar la solución funcionando.',
    },
    {
      question: '¿Para qué tipo de empresas es esto?',
      answer:
        'Trabajamos principalmente con pequeñas y medianas empresas, comercios y emprendimientos que necesitan una presencia digital profesional o quieren automatizar procesos que hoy hacen a mano o con planillas.',
    },
    {
      question: '¿Cómo es el proceso de trabajo?',
      answer:
        'Primero entendemos qué necesita tu empresa en una conversación inicial. Después proponemos una solución concreta, con alcance y tiempos claros, y avanzamos por etapas para que puedas ver resultados desde el principio.',
    },
    {
      question: '¿Cuánto tiempo tarda un proyecto?',
      answer:
        'Depende del alcance: un sitio web puede estar listo en pocas semanas, mientras que un sistema a medida con varias funcionalidades lleva más tiempo. En la primera conversación te damos una estimación realista.',
    },
    {
      question: '¿Qué pasa después de que el sitio o sistema esté funcionando?',
      answer:
        'Ofrecemos acompañamiento y mantenimiento posterior al lanzamiento: correcciones, mejoras y soporte técnico para que la solución siga funcionando bien a medida que tu empresa crece.',
    },
    {
      question: '¿Necesito saber de tecnología para trabajar con ustedes?',
      answer:
        'No. Explicamos cada propuesta en términos simples, sin tecnicismos innecesarios, y te acompañamos en cada paso para que entiendas qué estás recibiendo.',
    },
    {
      question: '¿Cuánto cuesta?',
      answer:
        'Varía según el proyecto: no es lo mismo una landing page que un sistema completo. Preferimos conversar primero para entender qué necesitás y así darte un presupuesto ajustado a tu realidad, no un número genérico.',
    },
  ];

  const openWhatsApp = () => {

  const selectedService =
    serviceLabels[ticket.tipo] || 'Consulta general';

  const message = `
Hola Orbidev, quiero realizar una consulta.

Nombre: ${ticket.name || 'No especificado'}
Empresa: ${ticket.company || 'No especificada'}
Servicio: ${selectedService}
Correo: ${ticket.email || 'No especificado'}

Consulta:
${ticket.desc || 'Quiero recibir más información.'}
  `.trim();

  const whatsappUrl = `https://wa.me/59899452312?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

  // Mejor esfuerzo: nunca debe bloquear ni romper el envío real del
  // formulario (que sigue yendo por Formspree, ver handleFormSubmit). Si
  // Inbox está caído o tarda, el error se descarta en silencio.
  const notifyInboxOnContact = () => {
    const selectedService = serviceLabels[ticket.tipo] || 'Consulta general';
    fetch(`${INBOX_API_URL}/api/v1/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ticket.name || 'Sin nombre',
        email: ticket.email || undefined,
        message: `${ticket.company ? `Empresa: ${ticket.company}. ` : ''}Servicio: ${selectedService}. ${
          ticket.desc || 'Sin detalle.'
        }`,
      }),
    }).catch(() => {});
  };

  const startContact = (service = 'otro') => {
    setTicket((currentTicket) => ({ ...currentTicket, tipo: service }));
    navigateTo('soporte');
  };


  

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================

  return (
    <>
      {/* =========================================================
          SEO DINÁMICO
          Actualiza título, descripción y canonical según la ruta.
      ========================================================== */}
      <Helmet>
      <title>{currentSeo.title}</title>

      <meta
        name="description"
        content={currentSeo.description}
      />

      <meta property="og:title" content={currentSeo.title} />
      <meta property="og:description" content={currentSeo.description} />
      <meta property="og:url" content={`https://orbidev.uy${location.pathname}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={currentSeo.title} />
      <meta name="twitter:description" content={currentSeo.description} />

      <link
        rel="canonical"
        href={`https://orbidev.uy${location.pathname}`}
      />
      </Helmet>

      <div className="w-full h-screen bg-cyber-panel overflow-hidden relative flex flex-col glow-active">
      
                {/* =========================================================
              HEADER PRINCIPAL
          ========================================================== */}
      <div className="h-12 bg-cyber-dark border-b border-cyber-border px-4 md:px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-3">
          {/* Botón Hamburguesa visible solo en móviles */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-slate-300 hover:text-cyber-cyan p-1.5 focus:outline-none transition-colors"
            aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isSidebarOpen}
          >
            <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('inicio')}
            aria-label="Volver al inicio"
            className="rounded-md cursor-pointer"
          >
            <img
              src="/orbidev-logo-web.svg"
              alt="ORBIDEV - Soluciones Digitales"
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </button>
        </div>
        
        {/* CONTROLES DE LA VENTANA */}
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer block hover:bg-red-500"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-pointer block hover:bg-yellow-500"></span>
          <span className="w-3 h-3 rounded-full bg-green-500/80 cursor-pointer block hover:bg-green-500"></span>
        </div>
      </div>

      {scrollPercent > 12 && !showAnalyticsConsent && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className="fixed right-4 md:right-6 bottom-12 z-40 h-11 px-3 sm:px-4 rounded-full border border-cyber-cyan/50 bg-cyber-dark/95 text-cyber-cyan shadow-lg shadow-cyber-cyan/10 backdrop-blur-md flex items-center gap-2 font-mono text-xs hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-arrow-up"></i>
          <span className="hidden sm:inline">VOLVER ARRIBA</span>
        </button>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        
                  {/* Fondo oscuro que aparece detrás del menú en móviles. */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-cyber-dark/85 backdrop-blur-xs z-20 md:hidden transition-all duration-300"
          />
        )}

                  {/* =========================================================
              MENÚ LATERAL / NAVEGACIÓN PRINCIPAL
          ========================================================== */}
        <div className={`
          fixed md:relative top-0 bottom-0 left-0 z-30 md:z-10
          w-[85vw] max-w-72 md:w-80 md:max-w-none bg-cyber-dark/95 md:bg-cyber-dark/60 
          border-r border-cyber-border flex flex-col p-4 justify-between select-none shrink-0 
          h-full overflow-y-auto transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          {/* Enlaces principales */}
          <div className="space-y-2 pt-3">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 block px-3 mb-2"> NAVEGACIÓN ORBIDEV</span>
            <NavLink
  to="/"
  onClick={() => setIsSidebarOpen(false)}
  className={({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
      isActive
        ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan'
        : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
    }`
  }
>
  <i className="fa-solid fa-house text-xs"></i>
  <span>01_INICIO</span>
</NavLink>

<NavLink
  to="/servicios"
  onClick={() => setIsSidebarOpen(false)}
  className={({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
      isActive
        ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan'
        : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
    }`
  }
>
  <i className="fa-solid fa-layer-group text-xs"></i>
  <span>02_SERVICIOS</span>
</NavLink>

<NavLink
  to="/proyectos"
  onClick={() => setIsSidebarOpen(false)}
  className={({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
      isActive
        ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan'
        : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
    }`
  }
>
  <i className="fa-solid fa-briefcase text-xs"></i>
  <span>03_PROYECTOS</span>
</NavLink>

<NavLink
  to="/contacto"
  onClick={() => setIsSidebarOpen(false)}
  className={({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
      isActive
        ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan'
        : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
    }`
  }
>
  <i className="fa-solid fa-envelope text-xs"></i>
  <span>04_CONTACTO</span>
</NavLink>

          </div>

          {/* Redes sociales */}
          <div className="space-y-2 pb-1">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 block px-3 mb-2">SEGUINOS</span>
            <div className="flex items-center gap-2 px-3">
              <a
                href="https://instagram.com/orbidev.uy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Orbidev en Instagram"
                className="w-9 h-9 rounded-lg bg-slate-800/40 border border-cyber-border hover:border-cyber-purple/60 hover:text-cyber-purple text-slate-400 flex items-center justify-center transition-all"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61592589158058"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Orbidev en Facebook"
                className="w-9 h-9 rounded-lg bg-slate-800/40 border border-cyber-border hover:border-cyber-blue/60 hover:text-cyber-blue text-slate-400 flex items-center justify-center transition-all"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            </div>
          </div>
        </div>

                  {/* =========================================================
              CONTENIDO PRINCIPAL
          ========================================================== */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-cyber-panel/40 relative w-full h-full"
        >
          
                    {/* =========================================================
              SECCIÓN: INICIO
          ========================================================== */}
          {activeTab === 'inicio' && (
            <div className="p-4 sm:p-6 md:p-10 xl:pr-76 space-y-10 md:space-y-16 max-w-7xl">
              
             {/* Presentación / Hero */}
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyber-emerald/10 border border-cyber-emerald/20 rounded-full text-[10px] sm:text-xs font-mono text-cyber-emerald max-w-full">
             <span className="w-1.5 h-1.5 bg-cyber-emerald rounded-full animate-pulse shrink-0"></span>

    <span className="truncate">
      DISPONIBLE PARA NUEVOS PROYECTOS
    </span>
  </div>

  <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight bg-linear-to-r from-cyber-purple via-cyber-blue to-cyber-cyan bg-clip-text text-transparent">
    Soluciones digitales para empresas
  </h1>

  <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
    En Orbidev desarrollamos{' '}
    <span className="text-cyber-cyan font-medium">
      sitios web
    </span>
    ,{' '}
    <span className="text-cyber-cyan font-medium">
      tiendas online
    </span>
    ,{' '}
    <span className="text-cyber-purple font-medium">
      sistemas a medida
    </span>{' '}
    y{' '}
    <span className="text-cyber-emerald font-medium">
      automatizaciones
    </span>{' '}
    que ayudan a pequeñas y medianas empresas a organizar sus procesos,
    ahorrar tiempo y crecer.
  </p>

  <div className="flex flex-col sm:flex-row gap-3 pt-2">
    <button
      onClick={() => startContact('reserva')}
      className="bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyber-purple/20 text-sm"
    >
      <i className="fa-regular fa-calendar-check text-xs"></i>
      Conocé ORBIDEV Reserva
    </button>

    <button
      onClick={() => navigateTo('proyectos')}
      className="border border-cyber-cyan/30 hover:border-cyber-cyan text-slate-200 hover:text-cyber-cyan font-mono px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
    >
      <i className="fa-solid fa-layer-group text-xs"></i>
      Ver proyectos
    </button>
  </div>

  {/* Visual del hero: panel contenido en su propio bloque, después
      del título y los botones - no se superpone al texto. */}
  <div className="relative isolate overflow-hidden rounded-2xl border border-cyber-border h-56 sm:h-72 md:h-[420px] mt-2">
    <Suspense fallback={null}>
      <BlackHoleHero />
    </Suspense>
  </div>
</div>

              {/* Propuesta de valor */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
  <article className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-cyan/50 rounded-xl p-5 sm:p-6 relative overflow-hidden transition-all group">
    <div className="absolute top-4 right-4 text-cyber-cyan/15 text-4xl">
      <i className="fa-solid fa-puzzle-piece"></i>
    </div>

    <span className="text-[10px] sm:text-xs font-mono text-cyber-cyan block mb-2">
      01 / ADAPTABLE
    </span>

    <h2 className="text-xl font-bold mb-3 group-hover:text-cyber-cyan transition-colors">
      Soluciones a medida
    </h2>

    <p className="text-sm text-slate-400 leading-relaxed">
      Analizamos cómo trabaja tu empresa y construimos una solución ajustada
      a sus necesidades reales, sin agregar funciones innecesarias.
    </p>
  </article>

  <article className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-purple/50 rounded-xl p-5 sm:p-6 relative overflow-hidden transition-all group">
    <div className="absolute top-4 right-4 text-cyber-purple/15 text-4xl">
      <i className="fa-solid fa-arrow-trend-up"></i>
    </div>

    <span className="text-[10px] sm:text-xs font-mono text-cyber-purple block mb-2">
      02 / ESCALABLE
    </span>

    <h2 className="text-xl font-bold mb-3 group-hover:text-cyber-purple transition-colors">
      Empezar simple y crecer
    </h2>

    <p className="text-sm text-slate-400 leading-relaxed">
      Podemos comenzar con una primera versión pequeña y agregar nuevas
      funcionalidades a medida que tu negocio las necesite.
    </p>
  </article>

  <article className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-emerald/50 rounded-xl p-5 sm:p-6 relative overflow-hidden transition-all group">
    <div className="absolute top-4 right-4 text-cyber-emerald/15 text-4xl">
      <i className="fa-solid fa-user-check"></i>
    </div>

    <span className="text-[10px] sm:text-xs font-mono text-cyber-emerald block mb-2">
      03 / CERCANO
    </span>

    <h2 className="text-xl font-bold mb-3 group-hover:text-cyber-emerald transition-colors">
      Acompañamiento directo
    </h2>

    <p className="text-sm text-slate-400 leading-relaxed">
      Mantenemos una comunicación clara durante todo el proyecto y explicamos
      cada decisión de forma sencilla y transparente.
    </p>
  </article>
</div>

{/* Proceso de trabajo */}
<section className="space-y-6">
  <div className="space-y-2">
    <span className="text-xs font-mono tracking-[0.2em] text-cyber-cyan">
      // PROCESO DE TRABAJO
    </span>

    <h2 className="text-2xl sm:text-3xl font-display font-bold">
      De una necesidad a una solución real
    </h2>

    <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
      Trabajamos en etapas concretas para reducir riesgos, ordenar prioridades
      y construir una solución que aporte valor desde su primera versión.
    </p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <article className="bg-cyber-dark/30 border border-cyber-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-2xl text-cyber-cyan">
          01
        </span>

        <i className="fa-regular fa-comments text-cyber-cyan"></i>
      </div>

      <h3 className="font-bold mb-2">
        Escuchamos
      </h3>

      <p className="text-sm text-slate-400 leading-relaxed">
        Conversamos sobre tu negocio, el problema actual y los resultados que
        esperás conseguir.
      </p>
    </article>

    <article className="bg-cyber-dark/30 border border-cyber-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-2xl text-cyber-purple">
          02
        </span>

        <i className="fa-solid fa-magnifying-glass-chart text-cyber-purple"></i>
      </div>

      <h3 className="font-bold mb-2">
        Analizamos
      </h3>

      <p className="text-sm text-slate-400 leading-relaxed">
        Identificamos las funciones esenciales y definimos una primera versión
        realista para el proyecto.
      </p>
    </article>

    <article className="bg-cyber-dark/30 border border-cyber-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-2xl text-cyber-blue">
          03
        </span>

        <i className="fa-solid fa-code text-cyber-blue"></i>
      </div>

      <h3 className="font-bold mb-2">
        Construimos
      </h3>

      <p className="text-sm text-slate-400 leading-relaxed">
        Diseñamos y desarrollamos la solución mostrando avances para validar
        que vamos por el camino correcto.
      </p>
    </article>

    <article className="bg-cyber-dark/30 border border-cyber-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-2xl text-cyber-emerald">
          04
        </span>

        <i className="fa-solid fa-rocket text-cyber-emerald"></i>
      </div>

      <h3 className="font-bold mb-2">
        Implementamos
      </h3>

      <p className="text-sm text-slate-400 leading-relaxed">
        Publicamos la solución, explicamos su funcionamiento y acompañamos sus
        primeros pasos.
      </p>
    </article>
  </div>
</section>
{/* Forma de trabajo */}
<section className="space-y-6">
  <div className="space-y-3">
    <span className="font-mono text-xs tracking-[0.2em] text-cyber-cyan">
      SOBRE ORBIDEV
    </span>

    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white">
      Tecnología con acompañamiento directo
    </h2>

    <p className="max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
      Orbidev desarrolla soluciones digitales para empresas que necesitan
      mejorar su presencia, ordenar procesos o transformar tareas manuales en
      herramientas claras y sostenibles.
    </p>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-5">
    <article className="relative overflow-hidden bg-cyber-dark/60 border border-cyber-border rounded-xl p-5 sm:p-7">
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-cyber-purple/10 rounded-full blur-3xl"></div>

      <div className="relative flex flex-col sm:flex-row items-start gap-5">
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center">
          <img
            src="/orbidev-isotipo-web.svg"
            alt="Isotipo de Orbidev"
            className="w-12 h-12 object-contain"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-display text-xl text-white">
              ORBIDEV
            </h3>

            <p className="mt-1 font-mono text-xs text-cyber-cyan">
              DESARROLLO · DATOS · SOLUCIONES DIGITALES
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Orbidev combina conocimientos técnicos con experiencia práctica en
            proyectos y soporte para transformar ideas, tareas manuales y
            necesidades empresariales en soluciones digitales funcionales.
          </p>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Cada proyecto se trabaja de forma directa y personalizada,
            priorizando la claridad, la comunicación y la posibilidad de
            comenzar con una solución pequeña que pueda evolucionar con el
            negocio.
          </p>

          <button
            type="button"
            onClick={() => navigateTo('soporte')}
            className="inline-flex items-center justify-center gap-2 border border-cyber-cyan/40 hover:border-cyber-cyan bg-cyber-cyan/5 hover:bg-cyber-cyan/10 text-cyber-cyan font-mono text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer"
          >
            <i className="fa-regular fa-comment-dots"></i>
            CONVERSEMOS SOBRE TU PROYECTO
          </button>
        </div>
      </div>
    </article>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
      <article className="bg-cyber-dark/60 border border-cyber-border hover:border-cyber-cyan/40 rounded-xl p-5 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
            <i className="fa-solid fa-code"></i>
          </div>

          <div>
            <h3 className="font-display text-sm text-white">
              Desarrollo de proyectos
            </h3>

            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Creación de sitios web, aplicaciones y sistemas orientados a
              resolver problemas concretos.
            </p>
          </div>
        </div>
      </article>

      <article className="bg-cyber-dark/60 border border-cyber-border hover:border-cyber-purple/40 rounded-xl p-5 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-cyber-purple/10 flex items-center justify-center text-cyber-purple">
            <i className="fa-solid fa-headset"></i>
          </div>

          <div>
            <h3 className="font-display text-sm text-white">
              Análisis y acompañamiento
            </h3>

            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Relevamiento de necesidades, diagnóstico y seguimiento durante la
              implementación.
            </p>
          </div>
        </div>
      </article>

      <article className="bg-cyber-dark/60 border border-cyber-border hover:border-cyber-emerald/40 rounded-xl p-5 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-cyber-emerald/10 flex items-center justify-center text-cyber-emerald">
            <i className="fa-solid fa-database"></i>
          </div>

          <div>
            <h3 className="font-display text-sm text-white">
              Tecnología y datos
            </h3>

            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Tecnologías elegidas según el alcance: web, backend, datos,
              integraciones y despliegue.
            </p>
          </div>
        </div>
      </article>

      <article className="bg-cyber-dark/60 border border-cyber-border hover:border-cyber-blue/40 rounded-xl p-5 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-cyber-blue/10 flex items-center justify-center text-cyber-blue">
            <i className="fa-solid fa-handshake"></i>
          </div>

          <div>
            <h3 className="font-display text-sm text-white">
              Atención personalizada
            </h3>

            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Comunicación directa durante todo el proceso, desde la idea
              inicial hasta la puesta en funcionamiento.
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>

{/* Llamado a la acción */}
<section className="relative overflow-hidden bg-cyber-dark/50 border border-cyber-border rounded-2xl p-6 sm:p-8">
  <div className="absolute -top-20 -right-20 w-56 h-56 bg-cyber-purple/15 rounded-full blur-3xl"></div>
  <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-cyber-cyan/10 rounded-full blur-3xl"></div>

  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
    <div className="space-y-3 max-w-2xl">
      <span className="text-xs font-mono tracking-[0.2em] text-cyber-emerald">
        IDEA → SOLUCIÓN
      </span>

      <h2 className="text-2xl sm:text-3xl font-display font-bold">
        Tu empresa puede trabajar de una forma más simple
      </h2>

      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Contanos qué tarea, proceso o necesidad querés mejorar y evaluamos una
        primera solución posible.
      </p>
    </div>

    <button
      onClick={() => navigateTo('soporte')}
      className="bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyber-purple/20 shrink-0"
    >
      <i className="fa-regular fa-comment-dots"></i>
      Hablemos de tu proyecto
    </button>
  </div>
</section>
            </div>
          )}

                    {/* =========================================================
              SECCIÓN: PROYECTOS
          ========================================================== */}
          {activeTab === 'proyectos' && (
            <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10 max-w-5xl">
              <div className="space-y-2">
                <div className="space-y-3">
            <span className="text-xs font-mono tracking-[0.2em] text-cyber-cyan">
            // PRODUCTOS Y PROYECTOS
           </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
    Productos propios y desarrollos técnicos
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
    Presentamos por separado los productos de Orbidev y los proyectos técnicos
    que demuestran capacidades concretas, con tecnologías verificadas en cada
    repositorio.
           </p>
        </div>
      </div>

              <section className="relative overflow-hidden bg-cyber-dark/50 border border-cyber-purple/40 rounded-2xl p-5 sm:p-7">
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyber-purple/15 rounded-full blur-3xl"></div>
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="space-y-3 max-w-2xl">
                    <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.18em] text-cyber-emerald">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse"></span>
                      PRODUCTO ORBIDEV · PILOTO
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold">ORBIDEV Reserva</h2>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                      Gestión de reservas pensada para comercios y profesionales que quieren ordenar su agenda y ofrecer turnos online. Estamos preparando el piloto con cupos limitados.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startContact('reserva')}
                    className="bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <i className="fa-regular fa-calendar-check"></i>
                    CONSULTAR POR EL PILOTO
                  </button>
                </div>
              </section>

              <div className="space-y-2 border-l-2 border-cyber-cyan pl-4">
                <h2 className="orbidev-section-title text-lg sm:text-xl font-display font-bold uppercase tracking-wide">
                  Proyectos técnicos
                </h2>
                <p className="text-sm text-slate-300">Implementaciones reales para explorar arquitectura, datos, automatización y soporte.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                {projectsData.map((project) => (
                  <button
                    type="button"
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    aria-label={`Ver detalles de ${project.title}`}
                    className="w-full text-left bg-cyber-dark/40 border border-cyber-border hover:border-cyber-cyan rounded-xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-64 shadow-md hover:shadow-cyan-500/5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="text-[10px] sm:text-xs font-mono text-slate-500 pr-3 leading-relaxed">{project.tag}</span>
                        <i className={`fa-solid ${project.icon} ${project.color} text-lg sm:text-xl group-hover:scale-110 transition-transform`}></i>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold group-hover:text-cyber-cyan transition-colors mb-2">{project.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">{project.desc}</p>
                    </div>
                    <span className="text-xs font-mono text-cyber-cyan flex items-center gap-1.5 mt-4">
                      VER DETALLE <i className="fa-solid fa-angle-right"></i>
                    </span>
                  </button>
                ))}
              </div>

     {/* Tecnologías utilizadas */}
<div className="bg-cyber-dark/20 border border-cyber-border rounded-xl p-5 sm:p-8">
  <h3 className="text-xs font-mono tracking-widest text-slate-400 mb-6 sm:text-center">
    TECNOLOGÍAS UTILIZADAS EN NUESTROS DESARROLLOS
  </h3>

  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
    <div className="p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center hover:border-cyber-cyan/50 transition-all">
      <i className="fa-brands fa-react text-3xl text-cyber-cyan mb-3"></i>
      <p className="text-xs font-mono font-bold">React + Vite</p>
    </div>

    <div className="p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center hover:border-orange-400/50 transition-all">
      <i className="fa-brands fa-java text-3xl text-orange-400 mb-3"></i>
      <p className="text-xs font-mono font-bold">Java 21</p>
    </div>

    <div className="p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center hover:border-cyber-emerald/50 transition-all">
      <i className="fa-solid fa-leaf text-3xl text-cyber-emerald mb-3"></i>
      <p className="text-xs font-mono font-bold">Spring Boot 3.5</p>
    </div>

    <div className="p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center hover:border-cyber-emerald/50 transition-all">
      <i className="fa-brands fa-python text-3xl text-cyber-emerald mb-3"></i>
      <p className="text-xs font-mono font-bold">Python + pandas</p>
    </div>

    <div className="p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center hover:border-cyber-purple/50 transition-all">
      <i className="fa-solid fa-gears text-3xl text-cyber-purple mb-3"></i>
      <p className="text-xs font-mono font-bold">SQLAlchemy</p>
    </div>

    <div className="p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center hover:border-cyber-blue/50 transition-all">
      <i className="fa-solid fa-database text-3xl text-cyber-blue mb-3"></i>
      <p className="text-xs font-mono font-bold">PostgreSQL</p>
    </div>

    <div className="p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center hover:border-amber-400/50 transition-all">
      <i className="fa-solid fa-fire text-3xl text-amber-400 mb-3"></i>
      <p className="text-xs font-mono font-bold">Firebase Hosting</p>
    </div>

    <div className="p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center hover:border-yellow-300/50 transition-all">
      <i className="fa-solid fa-cloud-arrow-up text-3xl text-yellow-300 mb-3"></i>
      <p className="text-xs font-mono font-bold">Render + Supabase</p>
    </div>
  </div>
</div>
            </div>
          )}

                    {/* =========================================================
              SECCIÓN: SERVICIOS
          ========================================================== */}
{activeTab === 'terminal' && (
  <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10 max-w-6xl">
    <div className="space-y-3">
      <span className="text-xs font-mono tracking-[0.2em] text-cyber-cyan">
        // NUESTROS SERVICIOS
      </span>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
        Tecnología para hacer crecer tu empresa
      </h1>

      <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
        Diseñamos soluciones digitales adaptadas a cada negocio, desde una
        presencia profesional en internet hasta sistemas que organizan y
        automatizan procesos internos.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      <article className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-cyan/60 rounded-xl p-6 transition-all group">
        <div className="w-11 h-11 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan mb-5">
          <i className="fa-solid fa-laptop-code text-xl"></i>
        </div>

        <h2 className="text-lg font-bold mb-2 group-hover:text-cyber-cyan transition-colors">
          Diseño web
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed">
          Sitios modernos, rápidos, adaptables a celulares y alineados con la
          identidad de tu empresa.
        </p>
      </article>

      <article className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-purple/60 rounded-xl p-6 transition-all group">
        <div className="w-11 h-11 rounded-lg bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center text-cyber-purple mb-5">
          <i className="fa-solid fa-cart-shopping text-xl"></i>
        </div>

        <h2 className="text-lg font-bold mb-2 group-hover:text-cyber-purple transition-colors">
          E-commerce
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed">
          Tiendas online claras, seguras y fáciles de administrar para vender
          productos o servicios.
        </p>
      </article>

      <article className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-blue/60 rounded-xl p-6 transition-all group">
        <div className="w-11 h-11 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center text-cyber-blue mb-5">
          <i className="fa-solid fa-gears text-xl"></i>
        </div>

        <h2 className="text-lg font-bold mb-2 group-hover:text-cyber-blue transition-colors">
          Sistemas a medida
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed">
          Aplicaciones personalizadas para gestionar clientes, ventas,
          inventario, agenda, tareas y otros procesos.
        </p>
      </article>

      <article className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-emerald/60 rounded-xl p-6 transition-all group">
        <div className="w-11 h-11 rounded-lg bg-cyber-emerald/10 border border-cyber-emerald/20 flex items-center justify-center text-cyber-emerald mb-5">
          <i className="fa-solid fa-bolt text-xl"></i>
        </div>

        <h2 className="text-lg font-bold mb-2 group-hover:text-cyber-emerald transition-colors">
          Automatización
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed">
          Transformamos tareas manuales, formularios y planillas en procesos
          digitales más rápidos y confiables.
        </p>
      </article>

      <article className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-cyan/60 rounded-xl p-6 transition-all group">
        <div className="w-11 h-11 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan mb-5">
          <i className="fa-solid fa-database text-xl"></i>
        </div>

        <h2 className="text-lg font-bold mb-2 group-hover:text-cyber-cyan transition-colors">
          Datos e integraciones
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed">
          Organizamos información y conectamos bases de datos, Excel, APIs y
          servicios externos.
        </p>
      </article>

      <article className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-purple/60 rounded-xl p-6 transition-all group">
        <div className="w-11 h-11 rounded-lg bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center text-cyber-purple mb-5">
          <i className="fa-solid fa-headset text-xl"></i>
        </div>

        <h2 className="text-lg font-bold mb-2 group-hover:text-cyber-purple transition-colors">
          Soporte y mantenimiento
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed">
          Acompañamiento técnico, mejoras y mantenimiento para que tu solución
          siga funcionando correctamente.
        </p>
      </article>
    </div>

            {/* =========================================================
              SECCIÓN: PREGUNTAS FRECUENTES
          ========================================================== */}
    <div className="space-y-5">
      <div className="space-y-3">
        <span className="text-xs font-mono tracking-[0.2em] text-cyber-cyan">
          // PREGUNTAS FRECUENTES
        </span>

        <h2 className="text-2xl sm:text-3xl font-display font-bold">
          ¿Qué es Orbidev y para qué sirve?
        </h2>
      </div>

      <div className="border border-cyber-border rounded-xl divide-y divide-cyber-border overflow-hidden">
        {faqData.map((item, index) => {
          const isOpen = openFaq === index;
          return (
            <div key={item.question} className="bg-cyber-dark/40">
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer hover:bg-cyber-dark/60 transition-all"
              >
                <span className="font-semibold text-sm sm:text-base">
                  {item.question}
                </span>

                <i
                  className={`fa-solid fa-chevron-down text-cyber-cyan text-xs shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>

              {isOpen && (
                <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>

    <div className="bg-linear-to-r from-cyber-purple/10 via-cyber-blue/10 to-cyber-cyan/10 border border-cyber-border rounded-xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
      <div>
        <h2 className="text-xl font-bold mb-2">
          ¿No sabés qué solución necesitás?
        </h2>

        <p className="text-sm text-slate-400">
          Contanos el problema y evaluamos juntos una opción simple y realista.
        </p>
      </div>

      <button
        onClick={() => navigateTo('soporte')}
        className="bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
      >
        <i className="fa-regular fa-comment-dots"></i>
        Iniciar una consulta
      </button>
    </div>
  </div>
)}
            {/* =========================================================
              SECCIÓN: CONTACTO
          ========================================================== */}
{activeTab === 'soporte' && (
  <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10 max-w-5xl">
    <div className="space-y-3">
      <span className="text-xs font-mono tracking-[0.2em] text-cyber-cyan">
        // CONTACTO
      </span>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
        Hablemos de tu proyecto
      </h1>

      <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
        Contanos qué necesitás mejorar, crear o automatizar. Analizamos tu idea
        y te proponemos una solución clara, escalable y adaptada a tu negocio.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
      <div className="space-y-4">
        <div className="bg-cyber-dark/40 border border-cyber-border rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan mb-4">
            <i className="fa-regular fa-clock"></i>
          </div>

          <h2 className="font-bold mb-2">
            Respuesta inicial
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Revisamos cada consulta y respondemos normalmente dentro de las
            primeras 24 horas hábiles.
          </p>
        </div>

        <div className="bg-cyber-dark/40 border border-cyber-border rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center text-cyber-purple mb-4">
            <i className="fa-solid fa-location-dot"></i>
          </div>

          <h2 className="font-bold mb-2">
            Atención desde Uruguay
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Trabajamos de forma remota con empresas, comercios y emprendimientos.
          </p>
        </div>

        <div className="bg-cyber-dark/40 border border-cyber-border rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-cyber-emerald/10 border border-cyber-emerald/20 flex items-center justify-center text-cyber-emerald mb-4">
            <i className="fa-solid fa-comments"></i>
          </div>

          <h2 className="font-bold mb-2">
            Comunicación clara
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Explicamos cada propuesta sin tecnicismos innecesarios y con pasos
            concretos.
          </p>
        </div>
      </div>

      {formState.succeeded ? (
        <div role="status" aria-live="polite" className="bg-cyber-emerald/10 border border-cyber-emerald/30 p-6 sm:p-8 rounded-xl space-y-4 text-center flex flex-col justify-center min-h-96">
          <i className="fa-solid fa-circle-check text-5xl text-cyber-emerald"></i>

          <h2 className="text-xl sm:text-2xl font-bold text-cyber-emerald">
            Consulta registrada
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Gracias por contactar a Orbidev. Revisaremos la información y nos
            pondremos en contacto contigo.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigateTo('inicio')}
              className="bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono px-5 py-3 rounded-lg text-sm transition-all cursor-pointer"
            >
              VOLVER AL INICIO
            </button>
            <button
              type="button"
              onClick={resetContactForm}
              className="border border-cyber-cyan/50 hover:border-cyber-cyan text-cyber-cyan font-mono px-5 py-3 rounded-lg text-sm transition-all cursor-pointer"
            >
              ENVIAR OTRA CONSULTA
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            STATUS: CONSULTA_RECIBIDA
          </div>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            notifyInboxOnContact();
            handleFormSubmit(event);
          }}
          className="space-y-5 bg-cyber-dark/40 border border-cyber-border p-5 sm:p-8 rounded-xl"
        >
          <input
            type="hidden"
            name="_subject"
            value={`Nueva consulta ORBIDEV · ${serviceLabels[ticket.tipo] || 'Consulta general'}`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="contact-name"
                className="text-xs font-mono text-slate-400"
              >
                Nombre
              </label>

              <input
                id="contact-name"
                name="Nombre"
                type="text"
                required
                value={ticket.name}
                onChange={(e) =>
                  setTicket({ ...ticket, name: e.target.value })
                }
                placeholder="Ej: Valentina"
                autoComplete="name"
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyber-cyan"
              />
                    <ValidationError
                        prefix="Nombre"
                        field="Nombre"
                         errors={formState.errors}
                       className="text-xs text-red-400 mt-1"
                    />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contact-company"
                className="text-xs font-mono text-slate-400"
              >
                Empresa <span className="text-slate-600">(opcional)</span>
              </label>

              <input
                id="contact-company"
                name="Empresa"
                type="text"
                value={ticket.company}
                onChange={(e) =>
                  setTicket({ ...ticket, company: e.target.value })
                }
                placeholder="Ej: Comercio del Centro"
                autoComplete="organization"
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="contact-email"
                className="text-xs font-mono text-slate-400"
              >
                Correo electrónico
              </label>

              <input
                id="contact-email"
                type="email"
                name="email"
                required
                value={ticket.email}
                autoComplete="email"
                onChange={(e) =>
                  setTicket({ ...ticket, email: e.target.value })
                }
                placeholder="nombre@empresa.com"
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyber-cyan"
              />
                      <ValidationError
                        prefix="Correo"
                        field="email"
                        errors={formState.errors}
                        className="text-xs text-red-400 mt-1"
                      />
            </div>

            <div className="space-y-1.5">
            <label
              htmlFor="contact-service"
              className="text-xs font-mono text-slate-400"
            >
              Servicio de interés
            </label>

            <select
              id="contact-service"
              value={ticket.tipo}
              onChange={(e) =>
                setTicket({ ...ticket, tipo: e.target.value })
              }
              className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyber-cyan"
            >
              <option value="reserva">
                ORBIDEV Reserva — piloto
              </option>

              <option value="landing">
                Sitio web o landing page
              </option>

              <option value="ecommerce">
                Tienda online
              </option>

              <option value="sistema">
                Sistema a medida
              </option>

              <option value="automatizacion">
                Automatización de procesos
              </option>

              <option value="datos">
                Datos e integraciones
              </option>

              <option value="otro">
                Otra consulta
              </option>
            </select>
            <input
              type="hidden"
              name="Servicio"
              value={serviceLabels[ticket.tipo] || 'Consulta general'}
            />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="contact-description"
              className="text-xs font-mono text-slate-400"
            >
              ¿Qué necesitás resolver?
            </label>

            <textarea
              id="contact-description"
              name="Mensaje"
              rows="5"
              required
              value={ticket.desc}
              onChange={(e) =>
                setTicket({ ...ticket, desc: e.target.value })
              }
              placeholder="Contanos brevemente tu necesidad, problema o idea..."
              className="w-full resize-none bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyber-cyan"
            ></textarea>
              <ValidationError
                prefix="Mensaje"
                field="Mensaje"
                errors={formState.errors}
                className="text-xs text-red-400 mt-1"
              />
          </div>

          <input type="hidden" name="Origen" value="https://orbidev.uy/contacto" />
          <input type="text" name="_gotcha" className="hidden" tabIndex="-1" autoComplete="off" />

          <ValidationError
            prefix="No pudimos enviar la consulta"
            errors={formState.errors}
            className="text-sm text-red-400"
          />

          <button
            type="submit"
            disabled={formState.submitting}
            className="w-full bg-cyber-purple hover:bg-cyber-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyber-purple/20 font-bold"
          >
            {formState.submitting ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                ENVIANDO...
              </>
            ) : (
              <>
                <i className="fa-regular fa-paper-plane"></i>
                ENVIAR CONSULTA
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-cyber-border"></div>
                <span className="text-[10px] font-mono text-slate-500">O CONTACTANOS POR</span>
                <div className="h-px flex-1 bg-cyber-border"></div>
              </div>

             
            
              <button
                type="button"
                onClick={openWhatsApp}
                className="w-full border border-cyber-emerald/50 bg-cyber-emerald/10 hover:bg-cyber-emerald/20 hover:border-cyber-emerald text-cyber-emerald font-mono py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                CONSULTAR POR WHATSAPP
              </button>

          <p className="text-[10px] text-slate-500 text-center font-mono">
            Tus datos serán utilizados únicamente para responder esta consulta.
          </p>
        </form>
      )}
    </div>
  </div>
)}

        </div>
        

                  {/* =========================================================
              ASISTENTE FLOTANTE ORBIT
          ========================================================== */}
        {activeTab === 'inicio' && scrollPercent > 8 && (
          <aside className="hidden xl:flex fixed right-6 top-24 z-30 w-64 flex-col items-center">
            <div className="relative w-full bg-cyber-dark/95 border border-cyber-purple/40 rounded-2xl p-4 shadow-2xl shadow-cyber-purple/10 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-cyber-purple/10 border-2 border-cyber-cyan flex items-center justify-center text-cyber-cyan shadow-lg shadow-cyber-cyan/10">
                  <i
                    className={`fa-solid ${
                      scrollPercent > 85
                        ? 'fa-face-laugh-beam'
                        : scrollPercent > 45
                          ? 'fa-robot'
                          : 'fa-laptop-code'
                    } text-lg`}
                  ></i>
                </div>

                <div>
                  <h2 className="font-display text-sm tracking-wider text-white">
                    ORBIT
                  </h2>

                  <span className="font-mono text-[9px] tracking-widest text-cyber-emerald">
                    ASSISTANT ONLINE
                  </span>
                </div>
              </div>

              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {getMascotMessage()}
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono text-slate-500">
                    RECORRIDO
                  </span>

                  <span className="text-[9px] font-mono text-cyber-cyan">
                    {scrollPercent}%
                  </span>
                </div>

                <div className="h-1.5 bg-cyber-panel rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-cyber-purple via-cyber-blue to-cyber-cyan transition-all duration-300"
                    style={{ width: `${scrollPercent}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('soporte')}
                className="w-full mt-4 border border-cyber-cyan/30 hover:border-cyber-cyan text-slate-300 hover:text-cyber-cyan font-mono text-[10px] py-2 rounded-lg transition-all cursor-pointer"
              >
                HABLAR CON ORBIDEV
              </button>
            </div>
          </aside>
        )}

      </div>
        
      

            {/* ============================================================
          MODAL DE DETALLE DE PROYECTO
      ============================================================= */}
      {selectedProject && (
        <div
          className="absolute inset-0 bg-cyber-dark/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedProject(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            className="bg-cyber-panel border border-cyber-border w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="bg-cyber-dark px-4 sm:px-6 py-3 sm:py-4 border-b border-cyber-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-folder-open text-cyber-cyan text-sm"></i>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 truncate max-w-50">{selectedProject.title.toUpperCase()}</span>
              </div>
              <button aria-label="Cerrar detalle" onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-cyber-purple">
                <span className="px-2 py-0.5 bg-cyber-purple/10 border border-cyber-purple/20 rounded">STACK: {selectedProject.tag}</span>
              </div>
              <h3 id="project-modal-title" className="text-xl sm:text-2xl font-bold text-slate-100">{selectedProject.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{selectedProject.longDesc}</p>
            </div>

            <div className="flex flex-wrap gap-3 p-4 border-t border-cyber-border bg-cyber-dark/30 shrink-0">
              <a href={selectedProject.github} target="_blank" rel="noreferrer" className="flex-1 min-w-30 bg-cyber-purple text-center font-mono py-2 rounded text-xs text-white hover:bg-cyber-purple/80 transition-all cursor-pointer font-bold flex items-center justify-center gap-1">
                <i className="fa-brands fa-github"></i> {selectedProject.githubFrontend ? 'BACKEND' : 'REPOSITORIO'}
              </a>
              {selectedProject.githubFrontend && (
                <a href={selectedProject.githubFrontend} target="_blank" rel="noreferrer" className="flex-1 min-w-30 bg-cyber-purple text-center font-mono py-2 rounded text-xs text-white hover:bg-cyber-purple/80 transition-all cursor-pointer font-bold flex items-center justify-center gap-1">
                  <i className="fa-brands fa-github"></i> FRONTEND
                </a>
              )}
              {selectedProject.demo && (
                <a href={selectedProject.demo} target="_blank" rel="noreferrer" className="flex-1 min-w-30 bg-cyber-emerald text-center font-mono py-2 rounded text-xs text-cyber-dark hover:bg-cyber-emerald/80 transition-all cursor-pointer font-bold flex items-center justify-center gap-1">
                  <i className="fa-solid fa-arrow-up-right-from-square"></i> DEMO
                </a>
              )}
              <button onClick={() => setSelectedProject(null)} className="flex-1 min-w-25 border border-cyber-border font-mono py-2 rounded text-xs text-slate-300 hover:bg-slate-800 transition-all cursor-pointer">
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnalyticsConsent && isAnalyticsConfigured && (
        <div
          role="dialog"
          aria-label="Preferencias de medición"
          className="fixed z-50 left-4 right-4 bottom-12 sm:left-auto sm:right-6 sm:w-110 bg-cyber-dark/98 border border-cyber-cyan/40 rounded-xl p-5 shadow-2xl shadow-cyber-cyan/10 backdrop-blur-md"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="space-y-2">
              <h2 className="font-bold text-white">Medición para mejorar Orbidev</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Podemos usar Google Analytics para entender qué secciones se visitan y mejorar el sitio. La publicidad permanece desactivada.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleAnalyticsChoice('denied')}
              className="border border-cyber-border hover:border-slate-400 text-slate-300 font-mono text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer"
            >
              AHORA NO
            </button>
            <button
              type="button"
              onClick={() => handleAnalyticsChoice('granted')}
              className="bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer"
            >
              ACEPTAR MEDICIÓN
            </button>
          </div>
        </div>
      )}

            {/* ============================================================
          BARRA DE ESTADO INFERIOR
      ============================================================= */}
      <div className="h-8 bg-cyber-dark border-t border-cyber-border px-4 md:px-6 flex items-center justify-between z-40 text-[9px] sm:text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-3 truncate">
          <span className="truncate">STATUS: OPERATIONAL</span>
          {isAnalyticsConfigured && (
            <button
              type="button"
              onClick={() => setShowAnalyticsConsent(true)}
              className="hover:text-cyber-cyan transition-colors cursor-pointer"
            >
              PRIVACIDAD
            </button>
          )}
        </div>
        <div className="flex gap-2 sm:gap-4 truncate">
          <span className="hidden xs:inline">DOMAIN: ORBIDEV.UY</span>
          <span>ENV: PRODUCTION</span>
        </div>
      </div>

      </div>
    </>
  );
}
