import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * Fondo ambiente del hero de Inicio: un agujero negro con disco de
 * acreción en WebGL/Three.js, puramente decorativo (aria-hidden,
 * sin controles ni texto superpuesto — el título real del hero va
 * encima, en el DOM normal).
 *
 * Decisiones deliberadas frente al snippet original:
 * - Sin OrbitControls: en el sitio real esto vive dentro de un panel
 *   con scroll (no controla la página entera), y un canvas que
 *   captura gestos de arrastre puede pelearse con el scroll táctil
 *   en mobile. La rotación es automática, no interactiva.
 * - Escala de instancias reducida (no son 5000): acá es un elemento
 *   ambiente detrás del texto, no el centro de atención — con menos
 *   partículas se ve igual de bien y pesa menos en GPUs de gama media.
 * - Respeta prefers-reduced-motion (congela en un frame estático).
 * - Si WebGL no está disponible, no renderiza nada — el fondo cyber
 *   existente de App.css queda como estaba, sin dependencia externa.
 * - Three/GSAP se instalan por npm (no CDN) para integrarse al build
 *   de Vite como el resto del proyecto.
 */

const noiseChunk = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }
`;

const STATES = [
  { morph: 0.1, compress: 1.0, intensity: 1.0, angleSpeed: 0.035, camY: 20, camDist: 78, orbit: 1.0 },
  { morph: 4.5, compress: 1.15, intensity: 1.35, angleSpeed: 0.09, camY: 34, camDist: 86, orbit: 1.8 },
  { morph: 0.8, compress: 0.4, intensity: 2.6, angleSpeed: 0.2, camY: 10, camDist: 50, orbit: 3.5 },
];

export default function BlackHoleHero({ className = "" }) {
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
      return undefined; // sin WebGL: no renderizamos nada, el fondo existente queda tal cual
    }

    const isMobile = () => window.innerWidth < 768;
    const instanceCount = isMobile() ? 1400 : 3000;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(60, 20, 60);

    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const bhGeo = new THREE.SphereGeometry(4, 48, 48);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    coreGroup.add(new THREE.Mesh(bhGeo, bhMat));

    const auraGeo = new THREE.SphereGeometry(4.25, 48, 48);
    const auraMat = new THREE.ShaderMaterial({
      uniforms: { uIntensity: { value: 1.0 } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 4.0);
          gl_FragColor = vec4(vec3(0.48, 0.36, 1.0) * rim * uIntensity * 4.0, 1.0);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    coreGroup.add(new THREE.Mesh(auraGeo, auraMat));

    const streakGeo = new THREE.CylinderGeometry(0.01, 0.12, 2.2, 3);
    streakGeo.rotateX(Math.PI / 2);

    const diskMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: STATES[0].morph },
        uCompression: { value: STATES[0].compress },
        uIntensity: { value: STATES[0].intensity },
        uOrbitScale: { value: STATES[0].orbit },
      },
      vertexShader: `
        ${noiseChunk}
        uniform float uTime;
        uniform float uMorph;
        uniform float uCompression;
        uniform float uIntensity;
        uniform float uOrbitScale;
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          vec4 instPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float rOriginal = length(instPos.xz);
          float r = rOriginal * uCompression;
          float initialAngle = atan(instPos.z, instPos.x);
          float orbitalVelocity = (1.5 / sqrt(rOriginal)) * uOrbitScale;
          float currentAngle = initialAngle + (uTime * orbitalVelocity);
          vec3 morphedWorldPos = vec3(cos(currentAngle) * r, instPos.y, sin(currentAngle) * r);
          float noise = snoise(vec3(morphedWorldPos.x * 0.08, morphedWorldPos.z * 0.08, uTime * 0.3));
          morphedWorldPos.y += noise * uMorph * 4.0;
          vec3 viewDir = normalize(cameraPosition - morphedWorldPos);
          vec3 orbitDir = normalize(vec3(-sin(currentAngle), 0.0, cos(currentAngle)));
          float doppler = dot(orbitDir, viewDir);
          vec3 hot = vec3(1.0, 0.95, 0.9);
          vec3 warm = vec3(0.48, 0.36, 1.0);
          vec3 cool = vec3(0.0, 0.9, 0.94);
          vec3 color = mix(cool, warm, smoothstep(45.0, 12.0, r));
          color = mix(color, hot, smoothstep(10.0, 4.0, r));
          vColor = color * (1.2 + doppler * 0.6) * uIntensity;
          vOpacity = (smoothstep(3.8, 5.5, r) * (1.0 - smoothstep(38.0, 48.0, r))) * 0.75;
          float deltaAngle = currentAngle - initialAngle;
          float c = cos(deltaAngle);
          float s = sin(deltaAngle);
          mat3 rotY = mat3(
            c, 0, s,
            0, 1, 0,
           -s, 0, c
          );
          vec3 localPos = (instanceMatrix * vec4(position, 0.0)).xyz;
          vec3 rotatedLocalPos = rotY * localPos;
          gl_Position = projectionMatrix * viewMatrix * vec4(morphedWorldPos + rotatedLocalPos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          gl_FragColor = vec4(vColor, vOpacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const instancedDisk = new THREE.InstancedMesh(streakGeo, diskMaterial, instanceCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < instanceCount; i += 1) {
      const r = 5 + Math.random() ** 1.3 * 40;
      const angle = Math.random() * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * (8 / r), Math.sin(angle) * r);
      dummy.lookAt(dummy.position.x + Math.sin(angle), dummy.position.y, dummy.position.z - Math.cos(angle));
      dummy.updateMatrix();
      instancedDisk.setMatrixAt(i, dummy.matrix);
    }
    scene.add(instancedDisk);
    scene.add(coreGroup);

    const camState = { distance: STATES[0].camDist, y: STATES[0].camY, angleSpeed: STATES[0].angleSpeed };
    let angle = 0.6;
    let stateIdx = 0;
    let transitionTimer;

    function transition() {
      stateIdx = (stateIdx + 1) % STATES.length;
      const s = STATES[stateIdx];
      gsap
        .timeline({ defaults: { duration: 4.5, ease: "power2.inOut" } })
        .to(diskMaterial.uniforms.uMorph, { value: s.morph }, 0)
        .to(diskMaterial.uniforms.uCompression, { value: s.compress }, 0)
        .to(diskMaterial.uniforms.uIntensity, { value: s.intensity }, 0)
        .to(diskMaterial.uniforms.uOrbitScale, { value: s.orbit }, 0)
        .to(auraMat.uniforms.uIntensity, { value: s.intensity }, 0)
        .to(camState, { distance: s.camDist, y: s.camY, angleSpeed: s.angleSpeed }, 0);
    }

    if (!prefersReducedMotion) {
      transitionTimer = setInterval(transition, 13000);
    }

    let raf;
    const startTime = performance.now();
    function animate() {
      if (!prefersReducedMotion) {
        const time = (performance.now() - startTime) / 1000;
        diskMaterial.uniforms.uTime.value = time;
        instancedDisk.rotation.y += 0.0004;
        angle += camState.angleSpeed * 0.016;
        camera.position.set(
          Math.cos(angle) * camState.distance,
          camState.y,
          Math.sin(angle) * camState.distance
        );
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
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
      clearInterval(transitionTimer);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      bhGeo.dispose();
      bhMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();
      streakGeo.dispose();
      diskMaterial.dispose();
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
