<template>
  <div
    id="tooltip-container"
    ref="tooltipContainer"
  >
    <div v-if="hoveredBorough">
        <p class="tooltip">
            {{ boroughName }}
        </p>
    </div>
  </div>
</template>

<script>
import CONFIG from '@/config/config';

const { BOROUGH_KEYS } = CONFIG;

export default {
  name: 'Tooltip',
  data() {
    return {
      BOROUGH_KEYS,
    };
  },
  props: {
    hoveredBorough: String,
    mouseX: Number,
    mouseY: Number,
  },
  watch: {
    mouseX() {
      this.moveToolTip();
    },
    mouseY() {
      this.moveToolTip();
    },
  },
  mounted() {
    console.log(BOROUGH_KEYS);
  },
  computed: {
    boroughName() {
      return BOROUGH_KEYS[this.hoveredBorough];
    },
  },
  methods: {
    moveToolTip() {
      this.$refs.tooltipContainer.style.left = `${this.mouseX + 50}px`;
      this.$refs.tooltipContainer.style.top = `${this.mouseY}px`;
    },
  },
};
</script>

<style lang="scss" scoped>
  #tooltip-container {
    position: fixed;
    z-index: 3;
    width: auto;
    height: auto;
    font-size: 0.75em;
    border: 1px solid #ffffff;
    opacity: 0.75;
    top: 0;
    left: 0;
    background-color: #000000;
    color: #ffffff;
  }
</style>
