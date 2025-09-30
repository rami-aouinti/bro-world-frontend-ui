<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ avatar?: string; placeholder?: string }>()
const emit = defineEmits<{ (e:'submit', text:string):void }>()
const text = ref('')

const { t } = useI18n()

const placeholderText = computed(() => props.placeholder ?? t('blog.comments.placeholder'))

function send(){
  if(!text.value.trim()) return
  emit('submit', text.value.trim())
  text.value = ''
}
</script>

<template>
  <div class="composer">
    <v-avatar size="34" class="mr-2">
      <v-img :src="avatar || 'https://i.pravatar.cc/80?img=3'" alt="" />
    </v-avatar>

    <div class="box">
      <v-textarea
          v-model="text"
          rounded
          rows="1"
          auto-grow
          variant="text"
          :placeholder="placeholderText"
          hide-details
          class="grow-input"
          @keyup.enter.exact.prevent="send"
      />
      <div class="toolbar">
        <v-btn icon variant="text" size="small"><Icon name="mdi-emoticon-happy-outline"></Icon></v-btn>
        <v-btn icon variant="text" size="small"><Icon name="mdi-image-outline"></Icon></v-btn>
        <v-btn icon variant="text" size="small"><Icon name="mdi-gif"></Icon></v-btn>
        <v-spacer />
        <v-btn icon variant="text" color="primary" size="small" @click="send">
          <Icon name="mdi-send"></Icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.composer{display:flex;align-items:flex-start;margin-top:12px}
.box{flex:1;background:rgba(var(--v-theme-on-surface),0.04);border-radius:18px;padding:4px 6px}
.grow-input :deep(textarea){padding-top:8px !important;padding-bottom:6px !important}
.toolbar{display:flex;align-items:center;padding:0 4px 4px}
</style>
