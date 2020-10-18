<template>
  <div id="app">
    <ThreeScene
      :selectedData="selectedData"
    />
    <DatePicker
      @setDate="setDataToDate"
    />
  </div>
</template>

<script>
import CASE_DATA from '@/data/london-cases.json';
import ThreeScene from './components/three-scene.vue';
import DatePicker from './components/date-picker.vue';

export default {
  name: 'App',
  components: {
    ThreeScene,
    DatePicker,
  },
  data() {
    return {
      CASE_DATA,
      selectedData: [],
    };
  },
  mounted() {
    console.log('here');
    console.log(this.selectedData);
  },
  methods: {
    setDataToDate(date) {
      this.selectedData = this.CASE_DATA.filter(
        (data) => data.date === date,
      );
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
