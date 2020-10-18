<template>
  <div id="app">
    <ThreeScene
      :selectedData="selectedData"
      :selectedBoroughData="selectedBoroughData"
      @setBorough="showBoroughData"
    />
    <DatePicker
      @setDate="setDataToDate"
      @pickerClicked="toggleAnimation"
      :animating="animateDepths"
    />
    <div v-if="boroughCode">
      <CaseBreakdown
        :selectedBoroughData="selectedBoroughData"
        @close="hideBoroughData"
      />
    </div>
  </div>
</template>

<script>
import CASE_DATA from '@/data/london-cases.json';
import ThreeScene from './components/three-scene.vue';
import DatePicker from './components/date-picker.vue';
import CaseBreakdown from './components/case-breakdown.vue';

export default {
  name: 'App',
  components: {
    ThreeScene,
    DatePicker,
    CaseBreakdown,
  },
  data() {
    return {
      CASE_DATA,
      selectedData: [],
      selectedBoroughData: {},
      boroughCode: null,
      animateDepths: true,
    };
  },
  methods: {
    setDataToDate(date) {
      this.selectedData = this.CASE_DATA.filter(
        (data) => data.date === date,
      );
      if (this.boroughCode) {
        this.hideBoroughData();
      }
      // works fine, but laggy.
      // if (this.boroughCode) {
      //   this.showBoroughData();
      // }
    },
    showBoroughData(borough = this.boroughCode) {
      this.animateDepths = false;
      if (borough !== this.boroughCode) { this.boroughCode = borough; }
      this.selectedBoroughData = this.selectedData.find(
        (data) => data.area_code === this.boroughCode,
      );
    },
    toggleAnimation(bool) {
      this.animateDepths = bool;
    },
    hideBoroughData() {
      this.animateDepths = true;
      this.boroughCode = null;
      this.selectedBoroughData = {};
    },
  },
};
</script>

<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
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
  }
</style>
