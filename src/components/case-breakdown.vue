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
    <ul class="details">
      <li><p>Borough: {{ selectedBoroughData.area_name }}</p></li>
      <li><p>Date: {{ selectedBoroughData.date}}</p></li>
      <li><p>New cases: {{ selectedBoroughData.new_cases}}</p></li>
      <li><p>Total cases: {{ selectedBoroughData.total_cases}}</p></li>
    </ul>
  </div>
</template>

<script>

export default {
  name: 'CaseBreakdown',
  props: {
    selectedBoroughData: Object,
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

      ul {
        list-style-type: none;
        padding-left: 5px;

        li:first-child p {
          text-decoration: underline
        }
      }

      p {
        font-size: 0.9em;
        margin: 0;
        padding: 0;
      }
  }
</style>
