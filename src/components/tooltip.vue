<template>
  <div
    id="tooltip-container"
    ref="tooltipContainer"
  >
    <transition name="fade">
      <div v-if="hoveredBorough">
          <p class="tooltip">
              {{ boroughName }}
          </p>
      </div>
    </transition>
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
  computed: {
    boroughName() {
      return BOROUGH_KEYS[this.hoveredBorough];
    },
  },
  methods: {
    moveToolTip() {
      if (this.hoveredBorough) {
        this.$refs.tooltipContainer.style.left = `${this.mouseX + 50}px`;
        this.$refs.tooltipContainer.style.top = `${this.mouseY}px`;
      }
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
    opacity: 0.75;
    top: 0;
    left: 0;

      .tooltip {
        border: 1px solid #ffffff;
        background-color: #000000;
        color: #ffffff;
        padding: 10px 15px;
        font-size: 0.75em;
      }
  }
</style>
