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
      github: 'https://github.com/FerSierra87/portafolio-os'
    },
    {
      id: 2,
      title: 'Automatización SQL & Python',
      tag: 'Data Pipeline',
      desc: 'Scripts robustos en Python para carga, normalización y migración automática de credenciales de seguridad.',
      longDesc: 'Desarrollo de un script automatizado para procesar grandes flujos de datos estructurados (XLSX, CSV) y migrarlos de forma limpia hacia bases de datos relacionales PostgreSQL/MySQL. Ideal para optimizar tareas repetitivas en administraciones medianas o PyMEs.',
      icon: 'fa-database',
      color: 'text-cyber-emerald',
      github: 'https://github.com/FerSierra87/sql-python-data-migration'
    },
    {
      id: 3,
      title: 'Panel Control L1',
      tag: 'Infraestructura',
      desc: 'Estructuración lógica y panel de control para optimizar la gestión y categorización de incidencias críticas.',
      longDesc: 'Inspirado en la trinchera del soporte técnico masivo. Diseñé un modelo lógico para catalogar errores de hardware, redes y accesos de usuarios, ayudando a reducir los tiempos de escalado del soporte de Nivel 1 a Nivel 2.',
      icon: 'fa-headset',
      color: 'text-cyber-purple',
      github: 'https://github.com/FerSierra87/panel-control-l1'
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

          <i className="fa-solid fa-microchip text-cyber-cyan animate-pulse text-sm hidden sm:inline-block"></i>
          <span className="font-mono text-[11px] sm:text-xs tracking-wider sm:tracking-widest text-slate-400 truncate max-w-[200px] sm:max-w-none">
            PORTAFOLIO_OS.EXE // SISTEMA
          </span>
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
            <span className="text-[10px] font-mono tracking-widest text-slate-500 block px-3 mb-1">MENÚ PRINCIPAL</span>
            
            <button 
              onClick={() => navigateTo('inicio')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${activeTab === 'inicio' ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-terminal text-xs"></i>
              <span>01_INICIO</span>
            </button>

            <button 
              onClick={() => navigateTo('proyectos')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${activeTab === 'proyectos' ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-code-branch text-xs"></i>
              <span>02_PROYECTOS</span>
            </button>

            <button 
              onClick={() => navigateTo('terminal')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${activeTab === 'terminal' ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-keyboard text-xs"></i>
              <span>03_CONSOLA</span>
            </button>

            <button 
              onClick={() => navigateTo('soporte')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${activeTab === 'soporte' ? 'bg-cyber-purple/20 text-cyber-cyan border-l-2 border-cyber-cyan' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-headset text-xs"></i>
              <span>04_SOPORTE_L1</span>
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
              <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyber-purple via-cyber-cyan to-cyber-emerald transform -translate-x-1/2"></div>
              
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
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-full text-[10px] sm:text-xs font-mono text-cyber-cyan max-w-full">
                  <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-ping shrink-0"></span>
                  <span className="truncate">DISPONIBLE PARA PROYECTOS / EMPRENDIMIENTO</span>
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-none bg-gradient-to-r from-violet-400 via-cyber-cyan to-cyber-emerald bg-clip-text text-transparent">
                  Full-Stack Developer &amp; Data Consultant
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
                  Especializado en diseñar arquitecturas web robustas con <span className="text-cyber-cyan font-mono">React</span> y <span className="text-cyber-cyan font-mono">Firebase</span>, combinando la precisión analítica de datos <span className="text-cyber-emerald font-mono">(SQL / Python)</span> con la agilidad técnica de un <span className="text-cyber-purple">Soporte de Sistemas L1</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button onClick={() => navigateTo('proyectos')} className="bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyber-purple/20 text-sm">
                    <i className="fa-solid fa-terminal text-xs"></i> Explorar Proyectos
                  </button>
                  <button onClick={() => navigateTo('soporte')} className="border border-cyber-border hover:bg-slate-800/40 text-slate-300 font-mono px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm">
                    <i className="fa-solid fa-headset text-xs"></i> Levantar Ticket L1
                  </button>
                </div>
              </div>

              {/* SECCIÓN DE DATOS Y METRICAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-cyber-dark/40 border border-cyber-border rounded-xl p-5 sm:p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-cyber-cyan/20 text-3xl sm:text-4xl font-mono"><i className="fa-solid fa-graduation-cap"></i></div>
                  <span className="text-[10px] sm:text-xs font-mono text-slate-400 block mb-1">EDUCACIÓN UTEC</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-cyber-cyan mb-2">4° Semestre</h3>
                  <p className="text-xs sm:text-sm text-slate-400">Licenciatura en Tecnologías de la Información. Próximo a titularse como Tecnólogo en TI.</p>
                </div>
                <div className="bg-cyber-dark/40 border border-cyber-border rounded-xl p-5 sm:p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-cyber-emerald/20 text-3xl sm:text-4xl font-mono"><i className="fa-solid fa-shield"></i></div>
                  <span className="text-[10px] sm:text-xs font-mono text-slate-400 block mb-1">ENTORNO REAL L1</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-cyber-emerald mb-2">Ministerio del Int.</h3>
                  <p className="text-xs sm:text-sm text-slate-400">Resolución rápida de incidentes, administración de accesos, redes y soporte técnico bajo presión.</p>
                </div>
                <div className="bg-cyber-dark/40 border border-cyber-border rounded-xl p-5 sm:p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-cyber-purple/20 text-3xl sm:text-4xl font-mono"><i className="fa-solid fa-server"></i></div>
                  <span className="text-[10px] sm:text-xs font-mono text-slate-400 block mb-1">MERCADO CLOUD</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-cyber-purple mb-2">Soluciones TI</h3>
                  <p className="text-xs sm:text-sm text-slate-400">Servicios empaquetados para PyMEs: bases de datos optimizadas, automatizaciones y portales rápidos.</p>
                </div>
              </div>

              {/* FILOSOFÍA TÉCNICA */}
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold border-b border-cyber-border pb-2 flex items-center gap-3">
                  <span className="text-cyber-cyan font-mono">&gt;</span> Mi Filosofía Técnica
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-slate-300">
                  <div className="space-y-2">
                    <h4 className="text-base sm:text-lg font-semibold text-cyber-cyan flex items-center gap-2">
                      <i className="fa-solid fa-database text-xs"></i> El valor de los datos
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      Un negocio moderno no puede crecer a ciegas. Utilizo mis habilidades en SQL, Python y estructuración para limpiar planillas desordenadas, centralizarlas en bases de datos eficientes y dar visibilidad total a la gestión del cliente.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base sm:text-lg font-semibold text-cyber-purple flex items-center gap-2">
                      <i className="fa-solid fa-network-wired text-xs"></i> Solidez de Infraestructura
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      Mi experiencia en Soporte L1 me enseñó a crear cosas que no se rompan fácilmente y a dar soluciones claras. Sé configurar entornos, optimizar hosting (cPanel), securizar flujos y brindar asistencia con una empatía real hacia el usuario final.
                    </p>
                  </div>
                </div>
              </div>
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

          {/* PESTAÑA: TERMINAL INTERACTIVA */}
          {activeTab === 'terminal' && (
            <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between font-mono text-xs sm:text-sm">
              <div className="space-y-2 overflow-y-auto pr-2 flex-1 max-h-[80%]">
                {terminalHistory.map((item, index) => (
                  <div 
                    key={index}
                    className={`whitespace-pre-wrap leading-relaxed ${
                      item.type === 'input' ? 'text-slate-200 font-bold' :
                      item.type === 'error' ? 'text-red-400' :
                      item.type === 'success' ? 'text-cyber-emerald' : 'text-cyber-cyan/90'
                    }`}
                  >
                    {item.text}
                  </div>
                ))}
                <div ref={terminalEndRef}></div>
              </div>

              <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 sm:gap-3 border-t border-cyber-border pt-4 bg-cyber-dark/20 p-2 sm:p-3 rounded-lg shrink-0 mt-4">
                <span className="text-cyber-emerald font-bold">$</span>
                <input 
                  type="text" 
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Escribí 'help'..."
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-100 placeholder-slate-600 font-mono text-xs sm:text-sm"
                  autoFocus
                />
                <button type="submit" className="bg-cyber-purple/40 border border-cyber-purple/60 hover:bg-cyber-purple px-4 py-1.5 sm:py-2 rounded text-xs text-white cursor-pointer font-bold transition-all">
                  RUN
                </button>
              </form>
            </div>
          )}

          {/* PESTAÑA: SOPORTE L1 */}
          {activeTab === 'soporte' && (
            <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10 max-w-3xl">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold">Soporte Técnico L1</h1>
                <p className="text-xs sm:text-sm text-slate-400">Si tenés una incidencia informática, requerís estructurar una web o necesitás automatizar tus datos, creá un ticket prioritario.</p>
              </div>

              {isTicketSubmitted ? (
                <div className="bg-cyber-emerald/10 border border-cyber-emerald/30 p-6 sm:p-8 rounded-xl space-y-4 text-center">
                  <i className="fa-solid fa-circle-check text-4xl sm:text-5xl text-cyber-emerald animate-bounce"></i>
                  <h3 className="text-lg sm:text-xl font-bold text-cyber-emerald font-mono">¡TICKET REGISTRADO!</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Me pondré en contacto contigo para darte una solución en un plazo menor a 24 horas.</p>
                  <div className="text-[10px] text-slate-500 font-mono">STATUS: PENDING_CONTACT</div>
                </div>
              ) : (
                <form onSubmit={submitTicket} className="space-y-4 sm:space-y-5 bg-cyber-dark/40 border border-cyber-border p-5 sm:p-8 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-mono text-slate-400">Nombre / Empresa</label>
                      <input 
                        type="text" 
                        required
                        value={ticket.name}
                        onChange={(e) => setTicket({...ticket, name: e.target.value})}
                        placeholder="Ej: PYME Uruguay" 
                        className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyber-purple"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-mono text-slate-400">Email de Contacto</label>
                      <input 
                        type="email" 
                        required
                        value={ticket.email}
                        onChange={(e) => setTicket({...ticket, email: e.target.value})}
                        placeholder="ejemplo@correo.com" 
                        className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyber-purple"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-mono text-slate-400">¿Qué necesitás?</label>
                    <select 
                      value={ticket.tipo}
                      onChange={(e) => setTicket({...ticket, tipo: e.target.value})}
                      className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyber-purple"
                    >
                      <option value="landing">Tier 1 — Landing Page / Sitio Corporativo</option>
                      <option value="datos">Tier 2 — Estructuración de Bases de Datos SQL</option>
                      <option value="sistema">Tier 3 — Sistema Integral / Consultoría</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-mono text-slate-400">Descripción del Requisito</label>
                    <textarea 
                      rows="3"
                      required
                      value={ticket.desc}
                      onChange={(e) => setTicket({...ticket, desc: e.target.value})}
                      placeholder="Contame qué necesitas resolver..." 
                      className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyber-purple"
                    ></textarea>
                  </div>

                  <button type="submit" className="w-full bg-cyber-purple hover:bg-cyber-purple/80 text-white font-mono py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyber-purple/20 font-bold">
                    <i className="fa-solid fa-ticket"></i> REGISTRAR TICKET
                  </button>
                </form>
              )}
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
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 truncate max-w-[200px]">{selectedProject.title.toUpperCase()}</span>
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

            <div className="flex gap-3 p-4 border-t border-cyber-border bg-cyber-dark/30 shrink-0">
              <a href={selectedProject.github} target="_blank" rel="noreferrer" className="flex-1 bg-cyber-purple text-center font-mono py-2 rounded text-xs text-white hover:bg-cyber-purple/80 transition-all cursor-pointer font-bold flex items-center justify-center gap-1">
                <i className="fa-brands fa-github"></i> REPOSITORIO
              </a>
              <button onClick={() => setSelectedProject(null)} className="flex-1 border border-cyber-border font-mono py-2 rounded text-xs text-slate-300 hover:bg-slate-800 transition-all cursor-pointer">
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
