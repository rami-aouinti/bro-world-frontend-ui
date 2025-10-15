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
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 55%),
    radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.25), transparent 50%),
    linear-gradient(135deg, #1e293b, #0f172a 55%, #1d4ed8);
  color: #fff;
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
