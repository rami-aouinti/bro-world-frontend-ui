<template>
  <div class="auth-layout d-flex align-center justify-center">
    <span class="mask bg-gradient-default opacity-6" />
    <div class="auth-layout__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  position: relative;
  padding: clamp(1.5rem, 3vw, 3rem);
  background-image: url("https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1950&q=80");
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.auth-layout__content {
  position: relative;
  z-index: 1;
  width: min(100%, 560px);
}
</style>
