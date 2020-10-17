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
let mapMesh;

export default {
  name: 'ThreeScene',
  mounted() {
    this.initThreeScene();
    this.loadMapModel();
    this.addLighting();
  },
  props: {
    selectedData: Array,
  },
  watch: {
    selectedData() {
      this.updateDepths();
    },
  },
  methods: {
    initThreeScene() {
      controls.autoRotate = true;
      camera.position.set(0, 0, 100);
      // camera.up.set(-1, 0, 0).normalize();
      renderer.setSize(windowWidth, windowHeight);
      scene.add(camera);
      this.$refs.threeScene.appendChild(renderer.domElement);
      this.animate();
    },
    addLighting() {
      const light = new THREE.AmbientLight(0xffffff, 100);
      scene.add(light);
    },
    getRandomColour() {
      return new THREE.Color(Math.random() * 0xffffff);
    },
    loadMapModel() {
      gltfLoader.load('./assets/glb/london-map.glb', (asset) => {
        const { scenes } = asset;
        const [model] = scenes;
        mapMesh = model;
        scene.add(mapMesh);
        mapMesh.rotation.x = Math.PI / 2;
        const mapMaterial = new THREE.MeshBasicMaterial();
        mapMesh.traverse((child) => {
          const c = child;
          // console.log(c);
          c.material = mapMaterial.clone();
          if (c.isMesh) {
            const color = this.getRandomColour();
            c.material.color = color;
          }
        });
      });
    },
    updateDepths() {
      this.selectedData.forEach((borough) => {
        // console.log(borough.area_code);
        if (mapMesh) {
          mapMesh.traverse((child) => {
            if (child.name === borough.area_code) {
              console.log(child);
              child.scale.set(
                child.scale.x,
                child.scale.y,
                1 + (0.0025 * borough.total_cases),
              );
              console.log('match found');
            }
          });
        }
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
<style lang="scss" scoped>
</style>
