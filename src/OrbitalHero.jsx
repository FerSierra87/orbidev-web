import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Visual 3D del hero de Inicio: un núcleo central con módulos en órbita,
 * conectados por haces de datos. Puramente decorativo (aria-hidden, sin
 * controles ni texto adentro — el título del hero vive en el DOM normal).
 *
 * Por qué esta figura y no otra: el nombre de la marca es ORBIDEV y el
 * producto es un core con módulos alrededor. Es la misma idea que el
 * diagrama de la sección Plataforma, así que hero y producto cuentan lo
 * mismo en vez de ser dos piezas decorativas sin relación.
 *
 * Decisiones heredadas del hero anterior, que seguían siendo correctas:
 * - Sin OrbitControls: vive dentro de un panel con scroll y capturar
 *   gestos de arrastre pelea con el scroll táctil en mobile.
 * - Respeta prefers-reduced-motion (queda en un frame estático).
 * - Sin WebGL no renderiza nada: el fondo cyber de App.css queda como está.
 * - Conteos de partículas más bajos en mobile.
 */

// Paleta: los mismos tokens que usa el resto del sitio (ver index.css).
const CYAN = 0x00e7f0;
const PURPLE = 0x7b5cff;
const BLUE = 0x2d7bff;
const EMERALD = 0x00d6a8;

// Un módulo por órbita, en el mismo orden que la suite.
const MODULES = [
  { color: PURPLE, radius: 15, inclination: 0.18, tilt: 0.0, speed: 0.42, size: 0.62 },
  { color: BLUE, radius: 20, inclination: -0.42, tilt: 0.5, speed: 0.31, size: 0.7 },
  { color: EMERALD, radius: 25.5, inclination: 0.55, tilt: -0.7, speed: 0.24, size: 0.6 },
  { color: CYAN, radius: 30.5, inclination: -0.22, tilt: 1.1, speed: 0.19, size: 0.66 },
  { color: PURPLE, radius: 35.5, inclination: 0.38, tilt: -1.4, speed: 0.15, size: 0.55 },
];

export default function OrbitalHero({ className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return undefined; // sin WebGL no dibujamos nada
    }

    const isMobile = () => window.innerWidth < 768;
    const starCount = isMobile() ? 900 : 2200;
    const dustCount = isMobile() ? 700 : 1600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      500
    );

    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Todo lo que gira colgado de un mismo grupo, para inclinar la escena
    // entera sin recalcular cada órbita.
    const world = new THREE.Group();
    world.rotation.x = 0.34;
    scene.add(world);

    const disposables = [];
    const track = (obj) => {
      disposables.push(obj);
      return obj;
    };

    // ---- Núcleo -------------------------------------------------------
    // Esfera oscura con borde luminoso (fresnel) que respira despacio.
    const coreGeo = track(new THREE.IcosahedronGeometry(4.6, 5));
    const coreMat = track(
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float facing = max(dot(vNormal, vView), 0.0);
            float fres = pow(1.0 - facing, 3.0);
            float pulse = 0.82 + 0.18 * sin(uTime * 1.1);
            // Borde luminoso + cuerpo encendido: si el centro queda oscuro
            // la esfera lee como un agujero, que es justo lo contrario de
            // lo que queremos comunicar.
            vec3 rim = vec3(0.0, 0.906, 0.941) * fres * 2.2 * pulse;
            vec3 body = mix(
              vec3(0.03, 0.32, 0.42),
              vec3(0.10, 0.55, 0.68),
              pow(facing, 1.6)
            ) * (0.85 + 0.15 * pulse);
            gl_FragColor = vec4(body + rim, 1.0);
          }
        `,
      })
    );
    world.add(new THREE.Mesh(coreGeo, coreMat));

    // Halo exterior: da volumen sin tapar el núcleo.
    const haloGeo = track(new THREE.SphereGeometry(6.4, 32, 32));
    const haloMat = track(
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.5);
            float pulse = 0.75 + 0.25 * sin(uTime * 0.9);
            vec3 col = mix(vec3(0.0, 0.906, 0.941), vec3(0.482, 0.361, 1.0), 0.45);
            gl_FragColor = vec4(col * rim * 1.5 * pulse, rim);
          }
        `,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    world.add(new THREE.Mesh(haloGeo, haloMat));

    // Jaula de aristas girando en sentido opuesto: lee como "técnico"
    // más que como "astronómico".
    const cageGeo = track(new THREE.IcosahedronGeometry(7.6, 1));
    const cageMat = track(
      new THREE.MeshBasicMaterial({
        color: PURPLE,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const cage = new THREE.Mesh(cageGeo, cageMat);
    world.add(cage);

    // ---- Órbitas y módulos --------------------------------------------
    const ringMatCache = [];
    const nodes = [];

    MODULES.forEach((m) => {
      const group = new THREE.Group();
      group.rotation.x = m.inclination;
      group.rotation.z = m.tilt;
      world.add(group);

      // Trazo de la órbita.
      const pts = [];
      const segs = 128;
      for (let i = 0; i <= segs; i += 1) {
        const a = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * m.radius, 0, Math.sin(a) * m.radius));
      }
      const ringGeo = track(new THREE.BufferGeometry().setFromPoints(pts));
      const ringMat = track(
        new THREE.LineBasicMaterial({
          color: m.color,
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      ringMatCache.push(ringMat);
      group.add(new THREE.LineLoop(ringGeo, ringMat));

      // Módulo: punto sólido + resplandor alrededor.
      const nodeGroup = new THREE.Group();
      group.add(nodeGroup);

      const dotGeo = track(new THREE.SphereGeometry(m.size, 16, 16));
      const dotMat = track(new THREE.MeshBasicMaterial({ color: m.color }));
      nodeGroup.add(new THREE.Mesh(dotGeo, dotMat));

      const glowGeo = track(new THREE.SphereGeometry(m.size * 2.3, 20, 20));
      const glowMat = track(
        new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color(m.color) } },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vView = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }
          `,
          fragmentShader: `
            uniform vec3 uColor;
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.2);
              gl_FragColor = vec4(uColor * rim * 2.2, rim * 0.8);
            }
          `,
          side: THREE.BackSide,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      nodeGroup.add(new THREE.Mesh(glowGeo, glowMat));

      nodes.push({
        group: nodeGroup,
        radius: m.radius,
        speed: m.speed,
        phase: Math.random() * Math.PI * 2,
        color: m.color,
      });
    });

    // ---- Haces de datos núcleo <-> módulo ------------------------------
    // Dos vértices por módulo; se reescriben cada frame siguiendo al nodo.
    const beamPositions = new Float32Array(nodes.length * 2 * 3);
    const beamColors = new Float32Array(nodes.length * 2 * 3);
    nodes.forEach((n, i) => {
      const c = new THREE.Color(n.color);
      // Arranca apagado en el núcleo y llega saturado al módulo.
      beamColors.set([c.r * 0.15, c.g * 0.15, c.b * 0.15], i * 6);
      beamColors.set([c.r, c.g, c.b], i * 6 + 3);
    });
    const beamGeo = track(new THREE.BufferGeometry());
    beamGeo.setAttribute("position", new THREE.BufferAttribute(beamPositions, 3));
    beamGeo.setAttribute("color", new THREE.BufferAttribute(beamColors, 3));
    const beamMat = track(
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    world.add(new THREE.LineSegments(beamGeo, beamMat));

    // Paquetes viajando del núcleo hacia cada módulo.
    const PACKETS_PER_BEAM = 3;
    const packetCount = nodes.length * PACKETS_PER_BEAM;
    const packetPositions = new Float32Array(packetCount * 3);
    const packetColors = new Float32Array(packetCount * 3);
    const packetOffsets = [];
    nodes.forEach((n, i) => {
      const c = new THREE.Color(n.color);
      for (let p = 0; p < PACKETS_PER_BEAM; p += 1) {
        const idx = i * PACKETS_PER_BEAM + p;
        packetColors.set([c.r, c.g, c.b], idx * 3);
        packetOffsets.push(p / PACKETS_PER_BEAM + Math.random() * 0.1);
      }
    });
    const packetGeo = track(new THREE.BufferGeometry());
    packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPositions, 3));
    packetGeo.setAttribute("color", new THREE.BufferAttribute(packetColors, 3));
    const packetMat = track(
      new THREE.PointsMaterial({
        size: 0.9,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    world.add(new THREE.Points(packetGeo, packetMat));

    // ---- Polvo en el plano orbital -------------------------------------
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const dustSeed = [];
    const cCyan = new THREE.Color(CYAN);
    const cPurple = new THREE.Color(PURPLE);
    for (let i = 0; i < dustCount; i += 1) {
      const r = 9 + Math.random() ** 0.7 * 32;
      const a = Math.random() * Math.PI * 2;
      dustSeed.push({ r, a, speed: 0.35 / Math.sqrt(r) });
      dustPos[i * 3] = Math.cos(a) * r;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 3.2;
      dustPos[i * 3 + 2] = Math.sin(a) * r;
      const mixv = Math.random();
      const c = cCyan.clone().lerp(cPurple, mixv);
      const fade = 0.25 + Math.random() * 0.55;
      dustColors.set([c.r * fade, c.g * fade, c.b * fade], i * 3);
    }
    const dustGeo = track(new THREE.BufferGeometry());
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
    const dustMat = track(
      new THREE.PointsMaterial({
        size: 0.28,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    world.add(new THREE.Points(dustGeo, dustMat));

    // ---- Estrellas de fondo (fuera del grupo que gira) ------------------
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      // Distribución en cáscara esférica lejana.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 110 + Math.random() * 70;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = track(
      new THREE.PointsMaterial({
        size: 0.55,
        color: 0x9fd8ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
    );
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---- Animación ------------------------------------------------------
    const CAM_DIST = 74;
    let camAngle = 0.5;
    const nodeLocal = new THREE.Vector3();

    function layout(time) {
      // Módulos sobre su órbita. Cada uno cuelga de un grupo inclinado,
      // así que su posición hay que traerla al espacio de `world`, que es
      // donde viven los haces y los paquetes.
      nodes.forEach((n) => {
        const a = n.phase + time * n.speed;
        n.group.position.set(Math.cos(a) * n.radius, 0, Math.sin(a) * n.radius);
      });
      world.updateMatrixWorld(true);

      nodes.forEach((n, i) => {
        n.group.getWorldPosition(nodeLocal);
        world.worldToLocal(nodeLocal);

        // El haz arranca por fuera del núcleo para no atravesarlo.
        const len = nodeLocal.length() || 1;
        const k = 6.6 / len;
        beamPositions[i * 6] = nodeLocal.x * k;
        beamPositions[i * 6 + 1] = nodeLocal.y * k;
        beamPositions[i * 6 + 2] = nodeLocal.z * k;
        beamPositions[i * 6 + 3] = nodeLocal.x;
        beamPositions[i * 6 + 4] = nodeLocal.y;
        beamPositions[i * 6 + 5] = nodeLocal.z;
      });
      beamGeo.attributes.position.needsUpdate = true;

      // Paquetes recorriendo cada haz.
      nodes.forEach((n, i) => {
        const ox = beamPositions[i * 6];
        const oy = beamPositions[i * 6 + 1];
        const oz = beamPositions[i * 6 + 2];
        const tx = beamPositions[i * 6 + 3];
        const ty = beamPositions[i * 6 + 4];
        const tz = beamPositions[i * 6 + 5];
        for (let p = 0; p < PACKETS_PER_BEAM; p += 1) {
          const idx = i * PACKETS_PER_BEAM + p;
          const t = (time * 0.35 + packetOffsets[idx]) % 1;
          packetPositions[idx * 3] = ox + (tx - ox) * t;
          packetPositions[idx * 3 + 1] = oy + (ty - oy) * t;
          packetPositions[idx * 3 + 2] = oz + (tz - oz) * t;
        }
      });
      packetGeo.attributes.position.needsUpdate = true;

      // Polvo orbitando.
      for (let i = 0; i < dustCount; i += 1) {
        const d = dustSeed[i];
        const a = d.a + time * d.speed;
        dustPos[i * 3] = Math.cos(a) * d.r;
        dustPos[i * 3 + 2] = Math.sin(a) * d.r;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    let raf;
    const startTime = performance.now();

    function animate() {
      const time = prefersReducedMotion ? 0 : (performance.now() - startTime) / 1000;

      layout(time);

      if (!prefersReducedMotion) {
        coreMat.uniforms.uTime.value = time;
        haloMat.uniforms.uTime.value = time;
        cage.rotation.y -= 0.0015;
        cage.rotation.x += 0.0008;
        stars.rotation.y += 0.00012;

        camAngle += 0.0012;
        camera.position.set(
          Math.cos(camAngle) * CAM_DIST,
          16 + Math.sin(time * 0.18) * 5,
          Math.sin(camAngle) * CAM_DIST
        );
      } else {
        camera.position.set(Math.cos(0.5) * CAM_DIST, 16, Math.sin(0.5) * CAM_DIST);
      }
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);

      // En reduced-motion alcanza con un frame: no seguimos pidiendo más.
      if (!prefersReducedMotion) raf = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      if (!mount.isConnected) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    />
  );
}
