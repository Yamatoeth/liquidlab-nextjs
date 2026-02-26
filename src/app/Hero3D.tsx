import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function Hero3D() {

  const mountRef = useRef(null)

  useEffect(() => {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )

    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    mountRef.current.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    const light1 = new THREE.DirectionalLight(0xffffff, 1.5)
    light1.position.set(5, 5, 5)
    scene.add(light1)

    const light2 = new THREE.DirectionalLight(0xffffff, 1)
    light2.position.set(-5, -3, 5)
    scene.add(light2)

    const sphereGeometry = new THREE.SphereGeometry(1.2, 64, 64)

    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      roughness: 0,
      metalness: 0,
      thickness: 1.5,
      transparent: true
    })

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    const ringMaterial = new THREE.MeshStandardMaterial({
      metalness: 1,
      roughness: 0.2
    })

    const rings = []

    function createRing(radius, tube) {
      const geo = new THREE.TorusGeometry(radius, tube, 32, 200)
      const mesh = new THREE.Mesh(geo, ringMaterial)
      scene.add(mesh)
      rings.push(mesh)
    }

    createRing(2, 0.03)
    createRing(2.4, 0.03)
    createRing(2.8, 0.03)

    rings[0].rotation.x = Math.PI / 4
    rings[1].rotation.y = Math.PI / 3
    rings[2].rotation.z = Math.PI / 6

    let frameId

    const animate = () => {

      frameId = requestAnimationFrame(animate)

      sphere.rotation.y += 0.001

      rings[0].rotation.x += 0.002
      rings[1].rotation.y += 0.0015
      rings[2].rotation.z += 0.001

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {

  cancelAnimationFrame(frameId)
  window.removeEventListener("resize", handleResize)

  renderer.dispose()

  const canvas = renderer.domElement
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas)
  }

  }

  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "black"
      }}
    />
  )
}