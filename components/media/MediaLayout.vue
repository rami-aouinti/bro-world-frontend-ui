<template>
  <VContainer fluid class="media-layout pa-0">
    <VRow class="g-0 flex-nowrap h-100" no-gutters>
      <VCol
        cols="12"
        md="3"
        lg="2"
        class="media-layout__sidebar d-flex flex-column"
        data-testid="media-tree"
      >
        <slot name="tree" />
      </VCol>
      <VCol cols="12" md="9" lg="10" class="media-layout__content">
        <div class="media-layout__toolbar" data-testid="media-toolbar">
          <slot name="toolbar" />
        </div>
        <div class="media-layout__breadcrumbs" data-testid="media-breadcrumbs">
          <slot name="breadcrumbs" />
        </div>
        <div class="media-layout__body" data-testid="media-body">
          <slot />
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
.media-layout {
  min-height: calc(100vh - 64px);
  background-color: rgb(var(--v-theme-surface));
}

.media-layout__sidebar {
  border-inline-end: 1px solid rgb(var(--v-theme-outline-variant));
  max-width: 320px;
}

.media-layout__content {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: inherit;
}

.media-layout__toolbar,
.media-layout__breadcrumbs {
  padding: 1rem;
}

.media-layout__body {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}
</style>
