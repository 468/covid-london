export default {
  vertexShader: `
    attribute float alpha;
        varying float vAlpha;

        void main() {
        vAlpha = alpha;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = 10.0;
        gl_Position = projectionMatrix * mvPosition;
        }
    `,
  fragmentShader: `
    uniform vec3 color;
        uniform float u_time;

        void main() {
        gl_FragColor = vec4(sin(u_time),0.1,0.1,1.0);
        }
    `,
};
