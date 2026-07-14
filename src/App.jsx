import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';

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

  // Resetea el porcentaje de scroll a cero al cambiar de sección
  useEffect(() => {
    setScrollPercent(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Auto-scroll para mantener la terminal siempre enfocada en el último comando impreso
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  // Función de navegación segura que cierra el menú lateral en móviles
  const navigateTo = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Cierra el menú en responsive
  };

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
        newHistory.push({ type: 'output', text: 'Proyectos destacados:\n  1. PORTAFOLIO_OS - Web SPA Reactiva con Firebase (Este sistema)\n  2. AUTOMATIZACIÓN SQL & PYTHON - Procesamiento y migración de datos limpia\n  3. PANEL CONTROL L1 - Mejora en la gestión de escalamiento técnico' });
        break;
      case 'skills':
        newHistory.push({ type: 'output', text: 'Habilidades Técnicas:\n  - FRONT-END: React JS, JavaScript, HTML5, CSS3 / Tailwind\n  - BACK-END/CLOUD: Firebase (Firestore, Auth, Hosting), cPanel, Servidores Linux\n  - BASES DE DATOS: SQL (PostgreSQL/MySQL), Python, Excel Avanzado' });
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

  // Base de datos de proyectos mockeados
  const projectsData = [
    {
      id: 1,
      title: 'Portafolio_OS',
      tag: 'React + Firebase',
      desc: 'Sitio interactivo estilo sistema operativo que simula ventanas flotantes, consola real y monitores de carga.',
      longDesc: 'Construido como una SPA en React, utiliza Firebase Firestore para gestionar contenidos del portafolio dinámicamente y Firebase Hosting para asegurar tiempos de respuesta por debajo de los 1.5 segundos a nivel global. El proyecto utiliza Tailwind CSS para simular perfectamente un entorno de escritorio retro-futurista.',
      icon: 'fa-window-restore',
      color: 'text-cyber-cyan',
      github: 'https://github.com/FerSierra87/portafolio_os'
    },
    {
      id: 2,
      title: 'Automatización SQL & Python',
      tag: 'Data Pipeline',
      desc: 'Scripts robustos en Python para carga, normalización y migración automática de credenciales de seguridad.',
      longDesc: 'Desarrollo de un script automatizado para procesar grandes flujos de datos estructurados (XLSX, CSV) y migrarlos de forma limpia hacia bases de datos relacionales PostgreSQL/MySQL. Ideal para optimizar tareas repetitivas en administraciones medianas o PyMEs.',
      icon: 'fa-database',
      color: 'text-cyber-emerald',
      github: '#'
    },
    {
      id: 3,
      title: 'Panel Control L1',
      tag: 'Infraestructura',
      desc: 'Estructuración lógica y panel de control para optimizar la gestión y categorización de incidencias críticas.',
      longDesc: 'Inspirado en la trinchera del soporte técnico masivo. Diseñé un modelo lógico para catalogar errores de hardware, redes y accesos de usuarios, ayudando a reducir los tiempos de escalado del soporte de Nivel 1 a Nivel 2.',
      icon: 'fa-headset',
      color: 'text-cyber-purple',
      github: '#'
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
      {/* SECCIÓN SEO CON HELMET */}
      <Helmet>
        <title>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} | Portafolio_OS</title>
        <meta name="description" content={`Portafolio_OS de Fernando. Sección: ${activeTab}. Desarrollador Full-Stack, Consultor de Datos y Soporte TI.`} />
      </Helmet>
      
      {/* BARRA DE TÍTULO SUPERIOR */}
      <div className="h-12 bg-cyber-dark border-b border-cyber-border px-4 md:px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-slate-300 hover:text-cyber-cyan p-1.5 focus:outline-none transition-colors"
            title="Menú del Sistema"
          >
            <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
          </button>
          <i className="fa-solid fa-microchip text-cyber-cyan animate-pulse text-sm hidden sm:inline-block"></i>
          <span className="font-mono text-[11px] sm:text-xs tracking-wider sm:tracking-widest text-slate-400 truncate max-w-[200px] sm:max-w-none">
            PORTAFOLIO_OS.EXE // SISTEMA
          </span>
        </div>
        
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

        {/* MENU LATERAL */}
        <div className={`
          fixed md:relative top-0 bottom-0 left-0 z-30 md:z-10
          w-72 md:w-80 bg-cyber-dark/95 md:bg-cyber-dark/60 
          border-r border-cyber-border flex flex-col p-4 justify-between select-none shrink-0 
          h-full overflow-y-auto transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 block px-3 mb-1">MENÚ PRINCIPAL</span>
            
            <button 
              onClick={() => navigateTo('inicio')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${activeTab === 'inicio' ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-terminal text-xs"></i> 01_INICIO
            </button>

            <button 
              onClick={() => navigateTo('proyectos')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${activeTab === 'proyectos' ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-code-branch text-xs"></i> 02_PROYECTOS
            </button>

            <button 
              onClick={() => navigateTo('terminal')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${activeTab === 'terminal' ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-keyboard text-xs"></i> 03_CONSOLA
            </button>

            <button 
              onClick={() => navigateTo('soporte')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${activeTab === 'soporte' ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-headset text-xs"></i> 04_SOPORTE_L1
            </button>
          </div>

          {/* RASTREO DE SCROLL Y MASCOTA */}
          <div className="border-t border-cyber-border pt-4 flex flex-col gap-3 relative mt-4">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 block px-3">MASCOT_TRACKER.SYS</span>
            <div className="bg-cyber-panel/95 border border-cyber-purple/40 rounded-xl p-3 text-xs leading-relaxed text-cyber-cyan font-mono relative shadow-lg">
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyber-panel border-r border-b border-cyber-purple/40 rotate-45"></div>
              {getMascotMessage()}
            </div>
            <div className="h-40 bg-cyber-dark/80 rounded-xl border border-cyber-border relative overflow-hidden flex items-center justify-center shadow-inner shrink-0">
              <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyber-purple via-cyber-cyan to-cyber-emerald transform -translate-x-1/2"></div>
              <div className="absolute right-4 text-[9px] font-mono text-slate-600 flex flex-col justify-between h-full py-4">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <div 
                style={{ 
                  position: 'absolute',
                  left: '50%',
                  top: `calc(${scrollPercent}% * (100% - 56px) / 100)`,
                  transform: 'translateX(-50%)'
                }}
                className="transition-all duration-300 ease-out flex flex-col items-center z-10"
              >
                <div className="bg-slate-900 border-2 border-cyber-cyan rounded-full p-2 shadow-lg flex items-center justify-center text-cyber-cyan w-12 h-12 glow-active">
                  <i className={`fa-solid ${scrollPercent > 80 ? 'fa-face-laugh-beam' : scrollPercent > 40 ? 'fa-robot' : 'fa-laptop-code'} text-xl`}></i>
                </div>
                <span className="text-[9px] font-mono text-cyber-cyan mt-1 px-1 bg-cyber-panel border border-cyber-border rounded shadow font-bold">{scrollPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL PRINCIPAL */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-cyber-panel/40 relative w-full h-full"
        >
          {activeTab === 'inicio' && (
  <div className="p-4 sm:p-6 md:p-10 space-y-10 md:space-y-16 max-w-5xl">
    {/* contenido de la sección inicio */}
  </div>
)}

{activeTab === 'proyectos' && (
  <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10 max-w-5xl">
    <div className="space-y-2">
      <h1 className="text-3xl sm:text-4xl font-bold">Consola de Proyectos</h1>
      <p className="text-xs sm:text-sm text-slate-400">Exploración interactiva de las soluciones de datos y desarrollo.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      {projectsData.map((project) => (
        <div key={project.id} onClick={() => setSelectedProject(project)} className="bg-cyber-dark/40 border border-cyber-border hover:border-cyber-cyan rounded-xl p-5 cursor-pointer">
          <h3 className="text-lg font-bold text-cyber-cyan">{project.title}</h3>
          <p className="text-xs text-slate-400">{project.desc}</p>
        </div>
      ))}
    </div>
  </div>
)}
{activeTab === 'terminal' && (
  <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between font-mono text-xs sm:text-sm">
    <div className="space-y-2 overflow-y-auto pr-2 flex-1">
      {terminalHistory.map((item, index) => (
        <div key={index} className="text-cyber-cyan">{item.text}</div>
      ))}
    </div>
    <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 mt-4">
      <span className="text-cyber-emerald">$</span>
      <input type="text" value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} className="bg-transparent border-none outline-none text-white w-full" />
    </form>
  </div>
)}
{activeTab === 'soporte' && (
  <div className="p-4 sm:p-6 md:p-10 max-w-3xl">
    <h1 className="text-3xl font-bold mb-4">Soporte Técnico L1</h1>
    <form onSubmit={submitTicket} className="space-y-4">
      <input type="text" placeholder="Nombre" onChange={(e) => setTicket({...ticket, name: e.target.value})} className="w-full bg-cyber-dark p-2 text-white" />
      <button type="submit" className="bg-cyber-purple text-white p-2">Enviar Ticket</button>
    </form>
  </div>
)}
        </div>
      </div>
    </div>
  );
}