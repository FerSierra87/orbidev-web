import { useState, useEffect, useRef } from 'react';

export default function App() {
  // Estado para controlar la sección o pestaña activa
  const [activeTab, setActiveTab] = useState('inicio');
  
  // Estado para medir el porcentaje de desplazamiento vertical (scroll)
  const [scrollPercent, setScrollPercent] = useState(0);
  
  // Estado para la entrada de texto en la consola interactiva
  const [terminalInput, setTerminalInput] = useState('');
  
  // Estado para el menú lateral colapsable (responsive)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Historial de la consola con mensajes iniciales del sistema
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', text: 'PORTAFOLIO_OS [Versión 1.0.12]' },
    { type: 'system', text: 'Inicializando conexión de desarrollo local...' },
    { type: 'success', text: 'Entorno de Vite listo y escuchando en el puerto 5173.' },
    { type: 'system', text: 'Escribí "help" para ver los comandos disponibles en el sistema.' }
  ]);
  
  // Estado para controlar qué proyecto está abierto en el modal de detalles
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Estado para el simulador de tickets de soporte técnico de Nivel 1 (formulario)
  const [ticket, setTicket] = useState({ name: '', email: '', desc: '', tipo: 'landing' });
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);

  // Referencias para el contenedor de scroll y el final de la terminal
  const scrollContainerRef = useRef(null);
  const terminalEndRef = useRef(null);

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

  // Función de navegación segura que cierra el menú lateral en móviles
  // y resetea el scroll (se hace acá, en el evento, en vez de en un useEffect)
  const navigateTo = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Cierra el menú en responsive
    setScrollPercent(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Auto-scroll para mantener la terminal siempre enfocada en el último comando impreso
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  // Parser interactivo de comandos para la consola del programador
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newHistory = [...terminalHistory, { type: 'input', text: `$ ${terminalInput}` }];

    switch (cmd) {
      case 'help':
        newHistory.push({ type: 'output', text: 'Comandos disponibles:\n  about     - Información de mi perfil y trasfondo (UTEC / L1)\n  projects  - Listado de proyectos técnicos destacados\n  skills    - Habilidades y tecnologías dominadas\n  clear     - Limpiar la consola\n  secret    - Ejecutar módulo oculto de desarrollo' });
        break;
      case 'about':
        newHistory.push({ type: 'output', text: 'PERFIL: Consultor TI / Desarrollador Full-Stack & Datos\nESTUDIOS: Licenciatura en Tecnologías de la Información (UTEC, 4to semestre - Tecnólogo inminente)\nEXPERIENCIA: Soporte L1 en el Ministerio del Interior. Resolución de incidencias críticas, redes y seguridad.' });
        break;
      case 'projects':
        newHistory.push({ type: 'output', text: 'Proyectos destacados:\n  1. PORTAFOLIO_OS - Web SPA Reactiva con Firebase (Este sistema)\n  2. AUTOMATIZACIÓN SQL & PYTHON - Procesamiento y migración de datos limpia\n  3. PANEL CONTROL L1 - Mejora en la gestión de escalamiento técnico\n  4. HELPDESK CORE - Sistema full-stack Java + React con base de datos real' });
        break;
      case 'skills':
        newHistory.push({ type: 'output', text: 'Habilidades Técnicas:\n  - FRONT-END: React JS, JavaScript, HTML5, CSS3 / Tailwind\n  - BACK-END/CLOUD: Java, Spring Boot, Firebase (Firestore, Auth, Hosting), cPanel, Servidores Linux\n  - BASES DE DATOS: SQL (PostgreSQL/MySQL), Python, Excel Avanzado' });
        break;
      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;
      case 'secret':
        newHistory.push({ type: 'success', text: '🎉 ACCESO CONCEDIDO: ¡Gracias por explorar el código de este sistema! Estás viendo una Single Page Application (React) robusta y rápida.' });
        break;
      default:
        newHistory.push({ type: 'error', text: `Comando no reconocido: "${cmd}". Escribí "help" para ver las opciones disponibles.` });
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  // Mensajes adaptativos de la mascota según la posición del scroll de lectura
  const getMascotMessage = () => {
    if (scrollPercent === 0) return "¡Hola! Soy Mascot_v1.0. ¡Desplázate hacia abajo en el panel principal para ver mi magia!";
    if (scrollPercent < 25) return "¡Arrancando! Analizando la sección de inicio...";
    if (scrollPercent < 50) return "Interesante perfil... la formación en UTEC sumada al soporte real en el Ministerio es un gran mix para dar soluciones.";
    if (scrollPercent < 75) return "¡Aquí están mis proyectos! Todo diseñado de forma limpia y estructurada.";
    if (scrollPercent < 99) return "¡Casi al final de la página! Podés enviarme un ticket de soporte si tenés dudas.";
    return "¡Completado al 100%! ¿Hablamos de tu próximo sistema?";
  };

  // Proyectos reales, con sus repositorios y demos en vivo
  const projectsData = [
    {
      id: 1,
      title: 'Portafolio_OS',
      tag: 'React + Firebase',
      desc: 'Sitio interactivo estilo sistema operativo que simula ventanas flotantes, consola real y monitores de carga.',
      longDesc: 'Construido como una SPA en React, utiliza Firebase Firestore para gestionar contenidos del portafolio dinámicamente y Firebase Hosting para asegurar tiempos de respuesta por debajo de los 1.5 segundos a nivel global. El proyecto utiliza Tailwind CSS para simular perfectamente un entorno de escritorio retro-futurista.',
      icon: 'fa-window-restore',
      color: 'text-cyber-cyan',
      github: '#'
    },
    {
      id: 2,
      title: 'Automatización SQL & Python',
      tag: 'Data Pipeline',
      desc: 'Script en Python para limpiar y migrar archivos CSV/XLSX hacia bases de datos relacionales PostgreSQL/MySQL.',
      longDesc: 'Herramienta de línea de comandos que normaliza nombres de columnas, elimina duplicados y filas vacías, genera un reporte de estadísticas, y migra el resultado a PostgreSQL o MySQL usando SQLAlchemy. Ideal para optimizar tareas repetitivas de carga de datos en administraciones medianas o PyMEs.',
      icon: 'fa-database',
      color: 'text-cyber-emerald',
      github: 'https://github.com/FerSierra87/sql-python-data-migration'
    },
    {
      id: 3,
      title: 'Panel Control L1',
      tag: 'Infraestructura',
      desc: 'Motor de clasificación de tickets de soporte técnico: categoriza por Hardware, Redes o Accesos y sugiere si escalar a Nivel 2.',
      longDesc: 'Sistema de triage inspirado en la trinchera del soporte técnico masivo. Un motor de reglas por palabras clave categoriza cada ticket automáticamente, le asigna prioridad, y sugiere si conviene resolverlo en Nivel 1 o escalarlo a Nivel 2. Incluye un dashboard con métricas en vivo.',
      icon: 'fa-headset',
      color: 'text-cyber-purple',
      github: 'https://github.com/FerSierra87/panel-control-l1'
    },
    {
      id: 4,
      title: 'Helpdesk Core',
      tag: 'Java + Spring Boot + React',
      desc: 'Sistema full-stack de gestión de clientes, equipos y tickets, con backend en Java/Spring Boot y frontend en React.',
      longDesc: 'API REST en Java (Spring Boot) con un modelo relacional real en PostgreSQL: un Cliente tiene varios Equipos, y cada Equipo puede tener varios Tickets. El backend está desplegado con Docker en Render, y el frontend en React consume la API en vivo, desplegado en Firebase Hosting. Incluye dashboard con métricas, CRUD completo de las 3 entidades, y CORS configurado entre ambos servicios.',
      icon: 'fa-server',
      color: 'text-amber-400',
      github: 'https://github.com/FerSierra87/helpdesk-core',
      githubFrontend: 'https://github.com/FerSierra87/helpdesk-core-frontend',
      demo: 'https://helpdesk-core-one.web.app'
    }
  ];

  // Envía el formulario simulado de incidentes informáticos
  const submitTicket = (e) => {
    e.preventDefault();
    setIsTicketSubmitted(true);
    setTimeout(() => {
      setIsTicketSubmitted(false);
      setTicket({ name: '', email: '', desc: '', tipo: 'landing' });
    }, 4000);
  };

  return (
    <div className="w-full h-screen bg-cyber-panel overflow-hidden relative flex flex-col glow-active">
      
      {/* BARRA DE TÍTULO SUPERIOR (AHORA CON BOTÓN HAMBURGUESA EN MÓVIL) */}
      <div className="h-12 bg-cyber-dark border-b border-cyber-border px-4 md:px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-3">
          {/* Botón Hamburguesa visible solo en móviles */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-slate-300 hover:text-cyber-cyan p-1.5 focus:outline-none transition-colors"
            title="Menú del Sistema"
          >
            <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
          </button>

          <img
  src="/orbidev-isotipo.svg"
  alt="Isotipo de Orbidev"
  className="w-7 h-7 object-contain"
/>

<div className="flex flex-col leading-none">
  <span className="font-display text-xs sm:text-sm tracking-[0.18em] text-white">
    ORBIDEV
  </span>

  <span className="hidden sm:block mt-1 font-mono text-[8px] tracking-[0.2em] text-cyber-cyan">
    SOLUCIONES DIGITALES
  </span>
</div>
        </div>
        
        {/* CONTROLES DE LA VENTANA */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer block hover:bg-red-500"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-pointer block hover:bg-yellow-500"></span>
          <span className="w-3 h-3 rounded-full bg-green-500/80 cursor-pointer block hover:bg-green-500"></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* BACKDROP/CORTINA OSCURA EN MÓVIL AL ABRIR EL MENÚ */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-cyber-dark/85 backdrop-blur-xs z-20 md:hidden transition-all duration-300"
          />
        )}

        {/* MENU LATERAL RESPONSIVE CON MÁXIMA COMPATIBILIDAD DE ALTURAS */}
        <div className={`
          fixed md:relative top-0 bottom-0 left-0 z-30 md:z-10
          w-72 md:w-80 bg-cyber-dark/95 md:bg-cyber-dark/60 
          border-r border-cyber-border flex flex-col p-4 justify-between select-none shrink-0 
          h-full overflow-y-auto transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          {/* LISTA DE NAVEGACIÓN COMPACTA */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 block px-3 mb-1"> NAVEGACIÓN ORBIDEV</span>
            <button
  onClick={() => navigateTo('inicio')}
  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
    activeTab === 'inicio'
      ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan'
      : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
  }`}
>
  <i className="fa-solid fa-house text-xs"></i>
  <span>01_INICIO</span>
</button>

<button
  onClick={() => navigateTo('terminal')}
  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
    activeTab === 'terminal'
      ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan'
      : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
  }`}
>
  <i className="fa-solid fa-layer-group text-xs"></i>
  <span>02_SERVICIOS</span>
</button>

<button
  onClick={() => navigateTo('proyectos')}
  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
    activeTab === 'proyectos'
      ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan'
      : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
  }`}
>
  <i className="fa-solid fa-briefcase text-xs"></i>
  <span>03_PROYECTOS</span>
</button>

<button
  onClick={() => navigateTo('soporte')}
  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
    activeTab === 'soporte'
      ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan'
      : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
  }`}
>
  <i className="fa-solid fa-envelope text-xs"></i>
  <span>04_CONTACTO</span>
</button>
          </div>

          {/* RASTREO DE SCROLL Y MASCOTA GIGANTE CON ALTURA INTELIGENTE */}
          <div className="border-t border-cyber-border pt-4 flex flex-col gap-3 relative mt-4">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 block px-3">MASCOT_TRACKER.SYS</span>
            
            {/* Bocadillo de diálogo de la mascota */}
            <div className="bg-cyber-panel/95 border border-cyber-purple/40 rounded-xl p-3 text-xs leading-relaxed text-cyber-cyan font-mono relative shadow-lg">
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyber-panel border-r border-b border-cyber-purple/40 rotate-45"></div>
              {getMascotMessage()}
            </div>

            {/* Riel visual del deslizador (Altura compacta h-40 para que quepa en celulares cortos) */}
            <div className="h-40 bg-cyber-dark/80 rounded-xl border border-cyber-border relative overflow-hidden flex items-center justify-center shadow-inner shrink-0">
              <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-linear-to-b from-cyber-purple via-cyber-cyan to-cyber-emerald transform -translate-x-1/2"></div>
              
              <div className="absolute right-4 text-[9px] font-mono text-slate-600 flex flex-col justify-between h-full py-4">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>

              {/* Contenedor del avatar gigante deslizable con fórmula matemática precisa para evitar recortes */}
              <div 
                style={{ 
                  position: 'absolute',
                  left: '50%',
                  top: `calc(${scrollPercent}% * (100% - 56px) / 100)`,
                  transform: 'translateX(-50%)'
                }}
                className="transition-all duration-300 ease-out flex flex-col items-center z-10"
              >
                {/* Círculo del avatar neón violeta */}
                <div className="bg-slate-900 border-2 border-cyber-cyan rounded-full p-2 shadow-lg flex items-center justify-center text-cyber-cyan w-12 h-12 glow-active">
                  <i className={`fa-solid ${scrollPercent > 80 ? 'fa-face-laugh-beam' : scrollPercent > 40 ? 'fa-robot' : 'fa-laptop-code'} text-xl`}></i>
                </div>
                <span className="text-[9px] font-mono text-cyber-cyan mt-1 px-1 bg-cyber-panel border border-cyber-border rounded shadow font-bold">{scrollPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL PRINCIPAL DE CONTENIDO DESLIZABLE (100% ANCHO EN MÓVIL) */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-cyber-panel/40 relative w-full h-full"
        >
          
          {/* PESTAÑA: INICIO */}
          {activeTab === 'inicio' && (
            <div className="p-4 sm:p-6 md:p-10 space-y-10 md:space-y-16 max-w-5xl">
              
             {/* PRESENTACIÓN */}
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
      onClick={() => navigateTo('proyectos')}
      className="bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyber-purple/20 text-sm"
    >
      <i className="fa-solid fa-layer-group text-xs"></i>
      Ver proyectos
    </button>

    <button
      onClick={() => navigateTo('soporte')}
      className="border border-cyber-cyan/30 hover:border-cyber-cyan text-slate-200 hover:text-cyber-cyan font-mono px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
    >
      <i className="fa-regular fa-comment-dots text-xs"></i>
      Contanos tu necesidad
    </button>
  </div>
</div>

              {/* PROPUESTA DE VALOR */}
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

{/* CÓMO TRABAJAMOS */}
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

{/* LLAMADO A LA ACCIÓN */}
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

          {/* PESTAÑA: PROYECTOS */}
          {activeTab === 'proyectos' && (
            <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10 max-w-5xl">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold">Consola de Proyectos</h1>
                <p className="text-xs sm:text-sm text-slate-400">Exploración interactiva de las soluciones de datos y desarrollo que he implementado.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {projectsData.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-cyan rounded-xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group h-64 shadow-md hover:shadow-cyan-500/5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="text-[10px] sm:text-xs font-mono text-slate-500">{project.tag}</span>
                        <i className={`fa-solid ${project.icon} ${project.color} text-lg sm:text-xl group-hover:scale-110 transition-transform`}></i>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold group-hover:text-cyber-cyan transition-colors mb-2">{project.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">{project.desc}</p>
                    </div>
                    <span className="text-xs font-mono text-cyber-cyan flex items-center gap-1.5 mt-4">
                      VER DETALLE <i className="fa-solid fa-angle-right"></i>
                    </span>
                  </div>
                ))}
              </div>

              {/* PANEL DE TECNOLOGÍAS */}
              <div className="bg-cyber-dark/20 border border-cyber-border rounded-xl p-5 sm:p-8">
                <h3 className="text-xs font-mono tracking-widest text-slate-400 mb-4 sm:text-center">TECNOLOGÍAS INCORPORADAS EN MI CORE</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                  <div className="p-3 sm:p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center">
                    <i className="fa-brands fa-react text-2xl sm:text-3xl text-cyber-cyan mb-2"></i>
                    <p className="text-[10px] sm:text-xs font-mono font-bold">React JS</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center">
                    <i className="fa-solid fa-fire text-2xl sm:text-3xl text-amber-500 mb-2"></i>
                    <p className="text-[10px] sm:text-xs font-mono font-bold">Firebase</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center">
                    <i className="fa-solid fa-database text-2xl sm:text-3xl text-cyber-emerald mb-2"></i>
                    <p className="text-[10px] sm:text-xs font-mono font-bold">SQL (My/Postgre)</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-cyber-dark/40 border border-cyber-border rounded-lg flex flex-col items-center">
                    <i className="fa-brands fa-python text-2xl sm:text-3xl text-amber-300 mb-2"></i>
                    <p className="text-[10px] sm:text-xs font-mono font-bold">Python</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA: SERVICIOS */}
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
  {/* PESTAÑA: CONTACTO */}
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

      {isTicketSubmitted ? (
        <div className="bg-cyber-emerald/10 border border-cyber-emerald/30 p-6 sm:p-8 rounded-xl space-y-4 text-center flex flex-col justify-center min-h-96">
          <i className="fa-solid fa-circle-check text-5xl text-cyber-emerald"></i>

          <h2 className="text-xl sm:text-2xl font-bold text-cyber-emerald">
            Consulta registrada
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Gracias por contactar a Orbidev. Revisaremos la información y nos
            pondremos en contacto contigo.
          </p>

          <div className="text-[10px] text-slate-500 font-mono">
            STATUS: CONSULTA_RECIBIDA
          </div>
        </div>
      ) : (
        <form
          onSubmit={submitTicket}
          className="space-y-5 bg-cyber-dark/40 border border-cyber-border p-5 sm:p-8 rounded-xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="contact-name"
                className="text-xs font-mono text-slate-400"
              >
                Nombre o empresa
              </label>

              <input
                id="contact-name"
                type="text"
                required
                value={ticket.name}
                onChange={(e) =>
                  setTicket({ ...ticket, name: e.target.value })
                }
                placeholder="Ej: Comercio del Centro"
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyber-cyan"
              />
            </div>

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
                required
                value={ticket.email}
                onChange={(e) =>
                  setTicket({ ...ticket, email: e.target.value })
                }
                placeholder="nombre@empresa.com"
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyber-cyan"
              />
            </div>
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
              rows="5"
              required
              value={ticket.desc}
              onChange={(e) =>
                setTicket({ ...ticket, desc: e.target.value })
              }
              placeholder="Contanos brevemente tu necesidad, problema o idea..."
              className="w-full resize-none bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyber-cyan"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyber-purple/20 font-bold"
          >
            <i className="fa-regular fa-paper-plane"></i>
            ENVIAR CONSULTA
          </button>

          <p className="text-[10px] text-slate-500 text-center font-mono">
            Esta versión todavía simula el envío. Luego conectaremos el
            formulario con un servicio real.
          </p>
        </form>
      )}
    </div>
  </div>
)}

        </div>
      </div>

      {/* MODAL PARA DETALLE DEL PROYECTO SELECCIONADO (RESPONSIVE SEGURO) */}
      {selectedProject && (
        <div className="absolute inset-0 bg-cyber-dark/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-cyber-panel border border-cyber-border w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-cyber-dark px-4 sm:px-6 py-3 sm:py-4 border-b border-cyber-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-folder-open text-cyber-cyan text-sm"></i>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 truncate max-w-50">{selectedProject.title.toUpperCase()}</span>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-cyber-purple">
                <span className="px-2 py-0.5 bg-cyber-purple/10 border border-cyber-purple/20 rounded">STACK: {selectedProject.tag}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100">{selectedProject.title}</h3>
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

      {/* BARRA DE ESTADO INFERIOR */}
      <div className="h-8 bg-cyber-dark border-t border-cyber-border px-4 md:px-6 flex items-center justify-between z-40 text-[9px] sm:text-[10px] font-mono text-slate-500 shrink-0">
        <span className="truncate">STATUS: OPERATIONAL</span>
        <div className="flex gap-2 sm:gap-4 truncate">
          <span className="hidden xs:inline">UTEC_SEMESTER: 4/4</span>
          <span>ENV: PRODUCTION</span>
        </div>
      </div>

    </div>
  );
}
