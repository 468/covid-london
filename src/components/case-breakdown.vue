<template>
  <div
    id="case-breakdown"
  >
    <h1>Borough: {{ selectedBoroughData.area_name }}</h1>
    <p>Date: {{ selectedBoroughData.date}}</p>
    <p>New cases: {{ selectedBoroughData.new_cases}}</p>
    <p>Total cases: {{ selectedBoroughData.total_cases}}</p>
  </div>
</template>

<script>

export default {
  name: 'CaseBreakdown',
  data() {
    return {
    };
  },
  props: {
    selectedBoroughData: Object,
  },
  watch: {
    selectedBoroughData() {
      console.log(this.selectedBoroughData);
    },
  },
  mounted() {
    // console.log(this.selectedBoroughData);
  },
  computed: {
  },
  methods: {
  },
};
</script>

<style lang="scss" scoped>
  #case-breakdown {
      position: absolute;
      top: 0;
      z-index: 3;
      right: 0;
      width: 25%;
      background-color: #333333;
      height: 100%;
      color: #ffffff;
  }
</style>
