import * as THREE from 'three';

// Lightweight preloader: create a hidden renderer and compile common shaders
export function ensureHero3DPreloaded() {
  if (typeof window === 'undefined') return;
  const anyWin = window as any;
  if (anyWin.__hero3dPreloaded) return;

  try {
    const canvas = document.createElement('canvas');
    // keep it offscreen but attached so GPU/shaders initialize
    Object.assign(canvas.style, {
      position: 'fixed',
      left: '-9999px',
      top: '-9999px',
      width: '1px',
      height: '1px',
      pointerEvents: 'none',
      opacity: '0',
    });
    document.body.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(1, 1, false);
    renderer.setPixelRatio(1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 0, 6);

    // lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const point = new THREE.PointLight(0xffffff, 1);
    point.position.set(10, 10, 10);
    scene.add(ambient, point);

    // compile a couple of materials/geometries similar to Hero3D
    const coneGeo = new THREE.ConeGeometry(0.42, 1.4, 32);
    const cylGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.4, 16);

    const mat1 = new THREE.MeshPhysicalMaterial({ color: 0xffb86b, metalness: 0.45, clearcoat: 0.9 });
    const mat2 = new THREE.MeshPhysicalMaterial({ color: 0xff9b55, metalness: 0.25, clearcoat: 0.5 });

    const m1 = new THREE.Mesh(coneGeo, mat1);
    const m2 = new THREE.Mesh(cylGeo, mat2);
    m2.position.set(0, -0.9, 0);
    scene.add(m1, m2);

    // force a single render to compile shaders
    renderer.render(scene, camera);

    anyWin.__hero3dPreloaded = { canvas, renderer, scene, camera };
  } catch (e) {
    // don't block on preload failures
    // eslint-disable-next-line no-console
    console.warn('Hero3D preloader failed', e);
  }
}

export function disposeHero3DPreloader() {
  const anyWin = window as any;
  const p = anyWin.__hero3dPreloaded;
  if (!p) return;
  try {
    if (p.renderer) {
      p.renderer.dispose();
    }
    if (p.canvas && p.canvas.parentNode) {
      p.canvas.parentNode.removeChild(p.canvas);
    }
  } catch (e) {
    // ignore
  }
  anyWin.__hero3dPreloaded = null;
}
