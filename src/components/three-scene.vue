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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import SHADERS from '@/assets/shaders';
import fillHelper from '@/helpers/fillWithPoints';
import Tooltip from './tooltip.vue';

// set globals used by Three
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const raycaster = new THREE.Raycaster();
const sceneObjects = [];
const allPoints = [];
const mouse = new THREE.Vector2();
const controls = new OrbitControls(camera, renderer.domElement);
const manager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(manager);
const { vertexShader, fragmentShader } = SHADERS;

let mapMesh;
let shaderMaterial;

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
      introFinished: false,
    };
  },
  mounted() {
    this.loadMapModel();
    this.addLighting();
    this.bindEvents();
  },
  props: {
    selectedData: Array,
    selectedBoroughData: Object,
  },
  watch: {
    selectedData() {
      this.updateDepths();
      this.updatePoints();
    },
    selectedBoroughData() {
      if (Object.keys(this.selectedBoroughData).length === 0) {
        this.destroyPoints();
        this.unzoom();
      } else {
        this.updatePoints();
        this.zoomToBorough();
      }
    },
  },
  methods: {
    bindEvents() {
      manager.onLoad = (() => {
        this.$emit('loaded');
        this.initThreeScene();
      });
      this.$refs.threeScene.addEventListener('mousemove', this.onMouseMove);
      this.$refs.threeScene.addEventListener('touchmove', this.onTouchMove);
      window.addEventListener('resize', this.onWindowResize, false);
      this.$refs.threeScene.addEventListener('click', this.onClick);
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
    onClick() {
      if (this.hoveredBorough && this.introFinished) {
        this.$emit('setBorough', this.hoveredBorough);
      }
    },
    updateMousePosition() {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((this.mouseX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((this.mouseY - rect.top) / rect.height) * 2 + 1;
      if (sceneObjects.length > 0) {
        this.raycast();
      }
    },
    initThreeScene() {
      controls.autoRotate = true;
      camera.position.set(0, 0, 100);
      controls.autoRotateSpeed = 1;
      controls.enableZoom = false;
      controls.enablePan = false;
      renderer.setPixelRatio(window.devicePixelRatio / 2);
      renderer.setSize(window.innerWidth, window.innerHeight);
      scene.add(camera);
      this.$refs.threeScene.appendChild(renderer.domElement);
      this.createShader();
      this.startIntro();
      this.animate();
    },
    startIntro() {
      new TWEEN.Tween(camera.position).to({
        y: 70,
        z: 70,
      }, 10000)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()
        .onComplete(() => {
          this.introFinished = true;
          this.$emit('introFinished');
        });
    },
    createShader() {
      const uniforms = {
        color: { value: new THREE.Color(0xffff00) },
        u_time: { type: 'f', value: 0 },
      };
      shaderMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: false,
      });
    },
    addEnvMap() {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const texture = new RGBELoader(manager)
        .setDataType(THREE.UnsignedByteType)
        .load('./assets/hdr/waterbuck_trail_1k.hdr', (t) => {
          pmremGenerator.compileEquirectangularShader();
          const hdrEnvMap = pmremGenerator.fromEquirectangular(t).texture;
          scene.environment = hdrEnvMap;
          texture.dispose();
          pmremGenerator.dispose();
        });
    },
    addLighting() {
      const light = new THREE.AmbientLight(0xffffff, 1);
      // const dirLight = new THREE.DirectionalLight(0xffffbb, 1);
      scene.add(light);
      // scene.add(dirLight);
      this.addEnvMap();
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
        mapMesh.castShadow = false;
        const mapMaterial = new THREE.MeshPhysicalMaterial({
          roughness: 0.01,
          metalness: 0.4,
          clearcoat: 1,
          transparent: true,
          transmission: 1,
          side: THREE.DoubleSide,
        });
        mapMesh.traverse((child) => {
          const c = child;
          c.material = mapMaterial.clone();
          if (c.isMesh) {
            const color = this.getRandomColour();
            c.material.color = color;
            sceneObjects.push(c);
          }
        });
      });
    },
    unzoom() {
      controls.autoRotate = true;
      new TWEEN.Tween(controls.target).to({
        x: 0,
        y: 0,
        z: 0,
      }, 1000)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start();
      new TWEEN.Tween(camera.position).to({
        x: 0,
        y: 70,
        z: 70,
      }, 1000)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start();
    },
    zoomToBorough() {
      if (mapMesh) {
        controls.autoRotate = false;
        mapMesh.traverse((child) => {
          if (child.name === this.selectedBoroughData.area_code) {
            const newTarget = this.getCenterOfBoundingBox(child.geometry);
            new TWEEN.Tween(controls.target).to({
              x: newTarget.x,
              y: newTarget.y,
              z: newTarget.z,
            }, 1000)
              .easing(TWEEN.Easing.Quartic.InOut)
              .start();
            new TWEEN.Tween(camera.position).to({
              x: newTarget.x + 25,
              y: 50,
              z: newTarget.z + 10,
            }, 1000)
              .easing(TWEEN.Easing.Quartic.InOut)
              .start();
          }
        });
      }
    },
    getCenterOfBoundingBox(geometry) {
      const middle = new THREE.Vector3();
      geometry.computeBoundingBox();
      middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
      middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
      middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
      return middle;
    },
    destroyPoints() {
      allPoints.forEach((point) => {
        point.geometry.dispose();
        scene.remove(point);
      });
    },
    updatePoints() {
      this.destroyPoints();
      if (mapMesh) {
        mapMesh.traverse((child) => {
          if (child.name === this.selectedBoroughData.area_code) {
            const points = fillHelper
              .fillWithPoints(child.geometry, this.selectedBoroughData.new_cases);
            this.addPointsToMesh(points, child);
          }
        });
      }
    },
    addPointsToMesh(pointLocations) {
      const vertices = [];
      pointLocations.forEach((point) => {
        vertices.push(point.x, point.y, point.z);
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const points = new THREE.Points(geometry, shaderMaterial);
      allPoints.push(points);
      scene.add(points);
    },
    raycast() {
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
                1 + (0.0025 * borough.total_cases),
                child.scale.z,
              );
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
        if (shaderMaterial.uniforms.u_time.value > 5) {
          shaderMaterial.uniforms.u_time.value = 0.01;
        } else {
          shaderMaterial.uniforms.u_time.value += 0.05;
        }
      };
      render();
    },
  },
};
</script>

<style lang="scss" scoped>
  #three-container {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
