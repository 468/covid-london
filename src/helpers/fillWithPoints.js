const THREE = require('three');

// from https://discourse.threejs.org/t/how-fill-a-loaded-stl-mesh-not-simple-shapes-like-cube-etc-with-random-particles-and-animate-with-this-geometry-bound-in-three-js/4702/6

module.exports = {
  fillWithPoints: (geometry, count) => {
    const ray = new THREE.Ray();
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

      const intersect = new THREE.Vector3();

      for (let i = 0; i < faces; i += 1) {
        vA.fromBufferAttribute(pos, i * 3 + 0);
        vB.fromBufferAttribute(pos, i * 3 + 1);
        vC.fromBufferAttribute(pos, i * 3 + 2);
        if (ray.intersectTriangle(vA, vB, vC, true, intersect)) counter += 1;
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
};
