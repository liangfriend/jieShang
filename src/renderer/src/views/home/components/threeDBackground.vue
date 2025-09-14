<template>
  <div class="three-container">
    <div ref="canvas" class="three-canvas"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// 资源路径
import background from '@renderer/assets/glb/background1.glb'

const canvas: Ref<HTMLDivElement | null> = ref(null)

onMounted(() => {
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)

  if (canvas.value) {
    canvas.value.appendChild(renderer.domElement)
  }

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(100, 100, 500)
  // 轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.target.set(0, 0, 0)
  // ✅ 添加灯光
  const ambient = new THREE.AmbientLight(0xffffff, 5)
  scene.add(ambient)

  const directional = new THREE.DirectionalLight(0xffffff, 1)
  directional.position.set(10, 10, 10)
  directional.castShadow = true
  scene.add(directional)

  const pointLight = new THREE.PointLight(0xffffff, 0.5)
  pointLight.position.set(-10, 10, -10)
  scene.add(pointLight)
  // 加载 glb 模型
  const loader = new GLTFLoader()
  loader.load(background, (gltf) => {
    scene.add(gltf.scene)

    // 如果 glb 自带相机
    if (gltf.cameras && gltf.cameras.length > 0) {
      const glbCamera = gltf.cameras[0] as THREE.PerspectiveCamera
      camera.copy(glbCamera)
      camera.updateProjectionMatrix()
    }

    // 如果 glb 自带灯光
    gltf.scene.traverse((child) => {
      if ((child as THREE.Light).isLight) {
        scene.add(child)
      }
    })

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera)
    })
  })
})
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.three-canvas {
  width: 100%;
  height: 100%;
}
</style>
