<template>
  <div id="app">
    <Header
      :showPrompt="showPrompt"
    />
    <transition name="fade">
      <div v-if="!hasLoaded">
        <Spinner />
      </div>
    </transition>
    <ThreeScene
      :selectedData="selectedData"
      :selectedBoroughData="selectedBoroughData"
      @setBorough="showBoroughData"
      @introFinished="showHeaderPrompt"
      @loaded="loaded"
    />
    <DatePicker
      @setDate="setDataToDate"
      @pickerClicked="toggleAnimation"
      :animating="animateDepths"
    />
    <transition name="fade">
      <div v-if="boroughCode">
        <CaseBreakdown
          :selectedBoroughData="selectedBoroughData"
          @close="hideBoroughData"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import CASE_DATA from '@/data/london-cases.json';
import ThreeScene from './components/three-scene.vue';
import DatePicker from './components/date-picker.vue';
import CaseBreakdown from './components/case-breakdown.vue';
import Header from './components/header.vue';
// eslint-disable-next-line import/no-unresolved
import Spinner from './components/spinner.vue';

export default {
  name: 'App',
  components: {
    ThreeScene,
    DatePicker,
    CaseBreakdown,
    Header,
    Spinner,
  },
  data() {
    return {
      CASE_DATA,
      selectedData: [],
      selectedBoroughData: {},
      boroughCode: null,
      animateDepths: true,
      introFinished: false,
      showPrompt: false,
      hasLoaded: false,
    };
  },
  methods: {
    setDataToDate(date) {
      this.selectedData = this.CASE_DATA.filter(
        (data) => data.date === date,
      );
      if (this.boroughCode) {
        this.showBoroughData();
      }
    },
    showHeaderPrompt() {
      if (!this.boroughCode) {
        this.showPrompt = true;
      }
    },
    showBoroughData(borough = this.boroughCode) {
      this.animateDepths = false;
      this.showPrompt = false;
      if (borough !== this.boroughCode) { this.boroughCode = borough; }
      this.selectedBoroughData = this.selectedData.find(
        (data) => data.area_code === this.boroughCode,
      );
    },
    toggleAnimation(bool) {
      this.animateDepths = bool;
      if (bool) { this.hideBoroughData(); }
    },
    hideBoroughData() {
      this.boroughCode = null;
      this.selectedBoroughData = {};
    },
    loaded() {
      this.hasLoaded = true;
    },
  },
};
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@600&display=swap');

  #app {
    font-family: 'IBM Plex Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 0;
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(#111111, #222222);

    .fade-enter-active, .fade-leave-active {
      transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to {
      opacity: 0;
    }
  }
</style>
