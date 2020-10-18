<template>
  <div
    id="case-breakdown"
  >
    <button
      @click="close"
      id='close'
    >
      x
    </button>
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
    close() {
      this.$emit('close');
    },
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
      margin: 25px;
      padding: 5px;
      background-color: #333333;
      height: auto;
      color: #ffffff;
      text-align: left;

      h1 {
        font-size: 1em;
        margin: 0;
        padding: 0;
      }
  }
</style>
