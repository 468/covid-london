<template>
  <div id="date-picker">
    <p class="selected-date">
        {{ formattedDate }}
    </p>
    <vue-slider
        v-model="dateIndex"
        :data="dateArray"
        @change="onUpdate"
    ></vue-slider>
  </div>
</template>

<script>
// dont forget can add :lazy=true to slider if overloaded
import moment from 'moment';
import CASE_DATA from '@/data/london-cases.json';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

export default {
  name: 'DatePicker',
  components: {
    VueSlider,
  },
  data() {
    return {
      dateIndex: 0,
      dateArray: [],
    };
  },
  beforeMount() {
    this.fillDateArray();
  },
  mounted() {
    // console.log(this.dateArray);
    const startDate = moment(CASE_DATA[0].date);
    this.$emit('setDate', startDate.format('YYYY-MM-DD'));
  },
  computed: {
    // might not use.
    formattedDate() {
      return this.dateArray[this.dateIndex];
    },
  },
  methods: {
    onUpdate(value) {
      this.$emit('setDate', value);
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
    z-index: 2;
    bottom: 100px;
    width: 50%;
    margin: 25px;

    .selected-date {
        color: #ffffff;
    }
  }
</style>