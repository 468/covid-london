<template>
  <header id="header">
    <h1>Coronavirus Cases</h1>
    <h2>By London Borough, Over Time</h2>
    <transition name="fade">
        <div v-if="showPrompt">
            <p>-</p>
            <p>Click a borough to explore</p>
        </div>
    </transition>
  </header>
</template>

<script>
export default {
  name: 'Header',
  props: {
    showPrompt: Boolean,
  },
};
</script>

<style lang="scss" scoped>
  #header {
    position: absolute;
    z-index: 3;
    color: #ffffff;
    text-align: left;
    padding: 50px;
    margin: 0;
    top: 0;
    left: 0;

    h1 {
        padding-bottom: 0;
        margin-bottom: 0;
    }

    h2 {
        padding-top: 0;
        margin-top: 0;
    }

  }
</style>
