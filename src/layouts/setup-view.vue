<script lang="ts">
import day from "~/assets/soracraft-day.jpg";
import night from "~/assets/soracraft-night.jpg";

export default defineComponent({
  setup() {
    const loaded = ref(false);
    const date = new Date();
    const hour = date.getHours();
    const bg = hour <= 6 ? night : hour >= 18 ? night : day;
    onMounted(() => {
      const $$ = new Image();
      $$.src = bg || "";
      $$.addEventListener("load", (e) => {
        loaded.value = true;
      });
    });

    return {
      bg,
      loaded
    };
  }
});
</script>

<template>
  <div
    class="login-page"
    :style="{
      height: '100vh',
      backgroundImage: `url(${bg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      transition: 'background-image 1s cubic-bezier(0.5,1,0.1,1)',
      opacity: loaded ? 1 : 0.4
    }"
  >
    <router-view />
  </div>
</template>

<style scoped lang="postcss">
.login-page {
  @apply w-full flex flex-col center bg-base-100;
}
</style>
