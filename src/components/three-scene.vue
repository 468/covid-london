<template>
  <div id="three-scene">
    <div class="three-container" ref="threeScene"></div>
    <Tooltip
      :hoveredBorough="hoveredBorough"
      :mouseX="mouseX"
      :mouseY="mouseY"
    />
  </div>
</template>

<script>
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
// eslint-disable-next-line no-unused-vars
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Tooltip from './tooltip.vue';

// set globals used by Three
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const raycaster = new THREE.Raycaster();
const sceneObjects = [];
const mouse = new THREE.Vector2();
const controls = new OrbitControls(camera, renderer.domElement);
const gltfLoader = new GLTFLoader();
let mapMesh;

export default {
  name: 'ThreeScene',
  components: {
    Tooltip,
  },
  data() {
    return {
      hoveredBorough: null,
      mouseX: 0,
      mouseY: 0,
    };
  },
  mounted() {
    this.initThreeScene();
    this.loadMapModel();
    this.addLighting();
    this.bindEvents();
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
    bindEvents() {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('touchmove', this.onTouchMove);
      window.addEventListener('resize', this.onWindowResize, false);
    },
    onMouseMove(e) {
      e.preventDefault();
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateMousePosition();
    },
    onTouchMove(e) {
      this.mouseX = e.changedTouches[0].pageX;
      this.mouseY = e.changedTouches[0].pageY;
      this.updateMousePosition();
    },
    onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    updateMousePosition() {
      // might not need to use rect here.
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((this.mouseX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((this.mouseY - rect.top) / rect.height) * 2 + 1;
      // mouse.x = (x / window.innerWidth) * 2 - 1;
      // mouse.y = -(y / window.innerHeight) * 2 - 1;
      if (sceneObjects.length > 0) {
        this.raycast();
      }
    },
    initThreeScene() {
      // camera.lookAt(0, 0, 0);
      // controls.autoRotate = true;
      camera.position.set(0, 0, 100);
      // camera.up.set(-1, 0, 0).normalize();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
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
        scene.updateMatrixWorld();
        const mapMaterial = new THREE.MeshBasicMaterial();
        mapMesh.traverse((child) => {
          const c = child;
          // console.log(c);
          c.material = mapMaterial.clone();
          if (c.isMesh) {
            const color = this.getRandomColour();
            c.material.color = color;
            sceneObjects.push(c);
          }
        });
      });
    },
    raycast() {
      // console.log(scene.children);
      raycaster.setFromCamera(mouse, camera);
      const intersection = raycaster.intersectObjects(sceneObjects, true);
      if (intersection.length > 0) {
        const { name } = intersection[0].object;
        this.hoveredBorough = name;
      } else {
        this.hoveredBorough = null;
      }
    },
    updateDepths() {
      this.selectedData.forEach((borough) => {
        if (mapMesh) {
          mapMesh.traverse((child) => {
            if (child.name === borough.area_code) {
              child.scale.set(
                child.scale.x,
                child.scale.y,
                1 + (0.0025 * borough.total_cases),
              );
              // potentiall remove easing
              /*
              new TWEEN.Tween(child.scale).to({
                z: 1 + (0.0025 * borough.total_cases),
              }, 1000)
                .easing(TWEEN.Easing.Quartic.InOut)
                .start();
              */
              console.log('match found');
            }
          });
        }
      });
    },
    animate() {
      const render = () => {
        TWEEN.update();
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
  #three-container {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
