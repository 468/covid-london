<template>
  <div
    id="case-breakdown"
  >
    <button
      @click="close"
      class='close'
    >
      ✕
    </button>
    <p>Borough: {{ selectedBoroughData.area_name }}</p>
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
      padding: 15px;
      height: auto;
      color: #ffffff;
      text-align: left;
      border: 1px solid #ffffff;
      display: flex;
      flex-direction: column;

      .close {
        align-self: flex-end;
        width: 25px;
        background: none;
        border: none;
        color: #ffffff;
      }

      p {
        font-size: 0.8em;
        margin: 0;
        padding: 0;
        font-weight: bold;
      }
  }
</style>
