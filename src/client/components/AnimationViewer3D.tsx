"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Params } from "@/lib/params/types";
import type { Animation } from "@/types/animation3d";

type Props = {
  animation?: Animation;
  params?: Params;
  className?: string;
  style?: React.CSSProperties;
};

const AnimationViewer3D: React.FC<Props> = ({ animation, params = {}, className, style }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.Material | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const lightRef = useRef<THREE.DirectionalLight | null>(null);
  const speedRef = useRef<number>(Number(params.speed ?? 1));

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const width = el.clientWidth || 800;
    const height = el.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materialColor = typeof params.color === "string" || typeof params.color === "number" ? params.color : 0x00bcd4;
    const material = new THREE.MeshStandardMaterial({ color: materialColor });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    meshRef.current = mesh;
    materialRef.current = material;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    lightRef.current = light;

    const ambient = new THREE.AmbientLight(0x222222);
    scene.add(ambient);

    let last = performance.now();

    const animate = (time: number) => {
      const dt = (time - last) / 1000;
      last = time;
      const speed = speedRef.current || 1;
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.3 * dt * speed;
        meshRef.current.rotation.y += 0.5 * dt * speed;
      }
      if (materialRef.current && (materialRef.current as THREE.MeshStandardMaterial).color) {
        // color handled in update effect
      }
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      const w = el.clientWidth || 800;
      const h = el.clientHeight || 600;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      try {
        el.removeChild(renderer.domElement);
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountRef.current]);

  // Update params reactively without remounting the whole scene
  useEffect(() => {
    // update speed
    speedRef.current = Number(params.speed ?? speedRef.current ?? 1);
    // update material colors
    try {
      if (materialRef.current) {
        const mat = materialRef.current as THREE.MeshStandardMaterial;
        if (typeof params.colorA === "string") mat.color.set(params.colorA);
        if (typeof params.colorB === "string") mat.emissive?.set && mat.emissive.set(params.colorB);
        if (typeof params.particleSize === "number" && meshRef.current) meshRef.current.scale.setScalar(Number(params.particleSize));
      }
    } catch (e) {}

    // update light intensity
    if (lightRef.current && params.intensity != null) {
      lightRef.current.intensity = Number(params.intensity);
    }

    // update camera
    if (cameraRef.current) {
      if (params.cameraAngle != null) {
        const a = Number(params.cameraAngle);
        // map angle to z distance for simple effect
        cameraRef.current.position.z = 3 + (a - 25) / 15;
      }
      if (params.offsetY != null) cameraRef.current.position.y = Number(params.offsetY);
    }
  }, [params]);

  return (
    <div ref={mountRef} className={className} style={style}>
      {/* three.js canvas is appended here */}
    </div>
  );
};

export default AnimationViewer3D;
