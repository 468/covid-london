<template>
  <div id="date-picker">
    <vue-slider
        v-model="dateIndex"
        :data="dateArray"
        @change="onUpdate"
        :tooltip="'always'"
        v-bind="options"
        ref="vueSlider"
    ></vue-slider>
     <button
      @click="toggleState"
      class="toggler"
    >
      {{ toggleText }}
    </button>
  </div>
</template>

<script>
// dont forget can add :lazy=true to slider if overloaded
import moment from 'moment';
import CASE_DATA from '@/data/london-cases.json';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css';

export default {
  name: 'DatePicker',
  components: {
    VueSlider,
  },
  props: {
    animating: {
      default: true,
      type: Boolean,
    },
  },
  data() {
    return {
      dateIndex: 0,
      dateArray: [],
      options: {
        dotSize: 0,
        height: 8,
      },
    };
  },
  watch: {
    animating() {
      if (this.animating) {
        this.restartIfNeeded();
        this.animate();
      }
    },
  },
  beforeMount() {
    this.fillDateArray();
  },
  mounted() {
    // console.log(this.dateArray);
    const startDate = moment(CASE_DATA[0].date);
    this.$emit('setDate', startDate.format('YYYY-MM-DD'));
    this.animate();
  },
  computed: {
    // might not use.
    toggleText() {
      return this.animating ? 'Pause' : 'Play';
    },
    formattedDate() {
      return this.dateArray[this.dateIndex];
    },
  },
  methods: {
    animate() {
      if (this.animating) {
        const index = this.$refs.vueSlider.getIndex();
        if (index + 1 >= this.dateArray.length) {
          this.toggleState();
        }
        this.$refs.vueSlider.setIndex(index + 1);
        setTimeout(() => { this.animate(); }, 100);
      }
    },
    onUpdate(value) {
      this.$emit('setDate', value);
    },
    toggleState() {
      this.$emit('pickerClicked', !this.animating);
    },
    restartIfNeeded() {
      if (this.animating && this.$refs.vueSlider.getIndex() + 1 >= this.dateArray.length) {
        console.log('here');
        this.$refs.vueSlider.setIndex(0);
      }
    },
    fillDateArray() {
      // use moment to generate array of dates between start
      // and end of file, so new dateranges can be uploaded with ease.
      let startDate = moment(CASE_DATA[0].date);
      const lastDate = moment(CASE_DATA[CASE_DATA.length - 1].date);
      this.dateArray.push(startDate.format('YYYY-MM-DD'));
      while (!startDate.isSame(lastDate)) {
        startDate = startDate.add(1, 'days');
        this.dateArray.push(startDate.format('YYYY-MM-DD'));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  #date-picker {
    position: relative;
    z-index: 3;
    bottom: 100px;
    height: 100px;
    width: 50%;
    margin: 0 auto;

    .toggler {
      position: fixed;
      margin: 0 auto;
      bottom: 40px;
      border: 1px solid #ffffff;
      background: none;
      color: #ffffff;
      padding: 5px;
    }

    .selected-date {
        color: #ffffff;
    }
  }
</style>
