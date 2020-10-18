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
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils';

import Tooltip from './tooltip.vue';

const vertexShader = `
  attribute float alpha;
    varying float vAlpha;

    void main() {
      vAlpha = alpha;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = 7.0;
      gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShader = `
  uniform vec3 color;
    varying float vAlpha;
    uniform float u_time;

    void main() {
      gl_FragColor = vec4(sin(u_time),0.1,0.1,0.1);
    }
`;

const uniforms = {
  color: { value: new THREE.Color(0xffff00) },
  u_time: { type: 'f', value: 0 },
};
// point cloud material
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  transparent: false,
});

// set globals used by Three
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const raycaster = new THREE.Raycaster();
const sceneObjects = [];
const allPoints = [];
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
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('touchmove', this.onTouchMove);
      window.addEventListener('resize', this.onWindowResize, false);
      window.addEventListener('click', this.onClick);
      // add mouse
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
      if (this.hoveredBorough) {
        this.$emit('setBorough', this.hoveredBorough);
      }
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
      controls.autoRotate = true;
      camera.position.set(0, 70, 70);
      controls.autoRotateSpeed = 1;
      controls.enableZoom = false;
      controls.enablePan = false;
      // camera.up.set(-1, 0, 0).normalize();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      scene.add(camera);
      this.$refs.threeScene.appendChild(renderer.domElement);
      this.animate();
    },
    addEnvMap() {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const texture = new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .load('./assets/hdr/waterbuck_trail_1k.hdr', (t) => {
          pmremGenerator.compileEquirectangularShader();
          const hdrEnvMap = pmremGenerator.fromEquirectangular(t).texture;
          scene.enviroment = hdrEnvMap;
          texture.dispose();
          pmremGenerator.dispose();
        });
    },
    addLighting() {
      const light = new THREE.AmbientLight(0xffffff, 1);
      scene.add(light);
      // this.addEnvMap();
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
        // mapMesh.rotation.x = Math.PI / 2;
        scene.updateMatrixWorld();
        const mapMaterial = new THREE.MeshPhysicalMaterial({
          roughness: 0.5,
          metalness: 0.5,
          // clearcoat: 1,
          transparent: true,
          transmission: 0.91,
          // side: THREE.DoubleSide,
          // normalMap: new THREE.TextureLoader()
          //  .load('./assets/textures/empty.jpeg'),
        });
        mapMesh.traverse((child) => {
          const c = child;
          // console.log(c);
          c.castShadow = true;
          c.material = mapMaterial.clone();
          if (c.isMesh) {
            // const points = this.fillWithPoints(c.geometry, 10);
            // const points = this.randomPointsInBufferGeometry(c.geometry, 100);
            // console.log(points);
            // this.addPointsToMesh(points, c);
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
            // controls.target = this.getCenterOfBoundingBox(child.geometry);
            const newTarget = this.getCenterOfBoundingBox(child.geometry);
            // camera.position.set(0, 35, 35);
            new TWEEN.Tween(controls.target).to({
              x: newTarget.x,
              y: newTarget.y,
              z: newTarget.z,
            }, 1000)
              .easing(TWEEN.Easing.Quartic.InOut)
              .start();
            new TWEEN.Tween(camera.position).to({
              x: newTarget.x + 5,
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
    // from https://discourse.threejs.org/t/how-fill-a-loaded-stl-mesh-not-simple-shapes-like-cube-etc-with-random-particles-and-animate-with-this-geometry-bound-in-three-js/4702/6
    fillWithPoints(geometry, count) {
      const ray = new THREE.Ray();
      // const size = new THREE.Vector3();
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox;

      const points = [];

      const dir = new THREE.Vector3(1, 1, 1).normalize();
      function isInside(v) {
        ray.set(v, dir);
        let counter = 0;

        const pos = geometry.attributes.position;
        const faces = pos.count / 3;
        const vA = new THREE.Vector3(); const vB = new THREE.Vector3(); const
          vC = new THREE.Vector3();

        for (let i = 0; i < faces; i += 1) {
          vA.fromBufferAttribute(pos, i * 3 + 0);
          vB.fromBufferAttribute(pos, i * 3 + 1);
          vC.fromBufferAttribute(pos, i * 3 + 2);
          if (ray.intersectTriangle(vA, vB, vC)) counter += 1;
        }

        return counter % 2 === 1;
      }

      function setRandomVector(min, max) {
        const v = new THREE.Vector3(
          THREE.Math.randFloat(min.x, max.x),
          THREE.Math.randFloat(min.y, max.y),
          THREE.Math.randFloat(min.z, max.z),
        );
        if (!isInside(v)) { return setRandomVector(min, max); }
        return v;
      }

      for (let i = 0; i < count; i += 1) {
        const p = setRandomVector(bbox.min, bbox.max);
        points.push(p);
      }
      return points;
    },
    // end
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
            const points = this.fillWithPoints(child.geometry, this.selectedBoroughData.new_cases);
            console.log(points);
            this.addPointsToMesh(points, child);
          }
        });
      }
    },
    addPointsToMesh(pointLocations, mesh) {
      console.log(mesh);
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
                1 + (0.0025 * borough.total_cases),
                child.scale.z,
              );
              // potentiall remove easing
              /*
              new TWEEN.Tween(child.scale).to({
                z: 1 + (0.0025 * borough.total_cases),
              }, 1000)
                .easing(TWEEN.Easing.Quartic.InOut)
                .start();
              */
              // console.log('match found');
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
          // eslint-disable-next-line no-param-reassign
          shaderMaterial.uniforms.u_time.value = 0.01;
        } else {
          // eslint-disable-next-line no-param-reassign
          shaderMaterial.uniforms.u_time.value += 0.05;
        }

        // eslint-disable-next-line no-param-reassign
        shaderMaterial.uniforms.uniformsNeedUpdate = true;
        // shaderMaterial.uniforms.u_time.value += 0.01;
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
