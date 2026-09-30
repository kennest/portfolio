/* ============================================================
   hero3d.js — Fond 3D du hero (Three.js)
   Particules dégradé violet/cyan + objets wireframe flottants,
   parallax souris. Chargé en type="module" (Three.js via CDN).
   Graceful degradation : rien ne casse si WebGL indisponible
   ou si prefers-reduced-motion est actif.
   ============================================================ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

function initHero3D() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    return; // WebGL indisponible : le dégradé CSS du hero reste visible
  }

  const isMobile = window.innerWidth < 768;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 18);

  /* ---------- Particules ---------- */
  const PARTICLE_COUNT = isMobile ? 500 : 1300;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const drift = new Float32Array(PARTICLE_COUNT);

  const violet = new THREE.Color('#8b5cf6');
  const cyan = new THREE.Color('#22d3ee');
  const tmpColor = new THREE.Color();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    tmpColor.copy(violet).lerp(cyan, Math.random());
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
    drift[i] = 0.004 + Math.random() * 0.012;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: isMobile ? 0.09 : 0.07,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ---------- Objets wireframe flottants ---------- */
  const shapes = [];
  const defs = [
    { geo: new THREE.IcosahedronGeometry(2.2, 0), pos: [-9, 2.5, -4], color: '#8b5cf6' },
    { geo: new THREE.TorusGeometry(1.6, 0.5, 8, 24), pos: [9, -2.5, -3], color: '#22d3ee' },
    { geo: new THREE.OctahedronGeometry(1.5, 0), pos: [7, 3.5, -6], color: '#a78bfa' },
    { geo: new THREE.TetrahedronGeometry(1.3, 0), pos: [-7, -3.5, -5], color: '#67e8f9' },
  ];

  defs.forEach(({ geo, pos, color }) => {
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: isMobile ? 0.18 : 0.3,
      })
    );
    mesh.position.set(...pos);
    scene.add(mesh);
    shapes.push(mesh);
  });

  /* ---------- Parallax souris ---------- */
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ---------- Pause quand le hero n'est pas visible ---------- */
  let isVisible = true;
  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
    },
    { threshold: 0.02 }
  );
  observer.observe(canvas.parentElement || canvas);

  /* ---------- Redimensionnement ---------- */
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  /* ---------- Boucle d'animation ---------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    // Dérive lente des particules vers le haut, avec réenroulement
    const pos = particleGeo.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let y = pos.getY(i) + drift[i];
      if (y > 12) y = -12;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;

    // Rotation lente des objets flottants + respiration verticale
    shapes.forEach((mesh, i) => {
      mesh.rotation.x = t * 0.15 + i;
      mesh.rotation.y = t * 0.2 + i;
      mesh.position.y += Math.sin(t * 0.6 + i * 1.7) * 0.0035;
    });

    // Parallax caméra (lissage)
    mouseX += (targetX - mouseX) * 0.04;
    mouseY += (targetY - mouseY) * 0.04;
    camera.position.x = mouseX * 2.2;
    camera.position.y = -mouseY * 1.4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHero3D);
} else {
  initHero3D();
}
