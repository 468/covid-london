<template>
  <div class="three-container" ref="threeScene">
  </div>
</template>

<script>
import * as THREE from 'three';
// eslint-disable-next-line no-unused-vars
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// set globals used by Three
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.01, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);
const gltfLoader = new GLTFLoader();

export default {
  name: 'ThreeScene',
  mounted() {
    this.initThreeScene();
    this.loadMapModel();
    this.addLighting();
  },
  methods: {
    initThreeScene() {
      camera.position.set(0, 0, 100);
      renderer.setSize(windowWidth, windowHeight);
      scene.add(camera);
      this.$refs.threeScene.appendChild(renderer.domElement);
      this.animate();
    },
    addLighting() {
      const light = new THREE.AmbientLight(0xffffff, 10);
      scene.add(light);
    },
    loadMapModel() {
      gltfLoader.load('./assets/glb/london-map.glb', (asset) => {
        const { scenes } = asset;
        const [model] = scenes;
        scene.add(model);
      });
    },
    animate() {
      const render = () => {
        controls.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
      };
      render();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
