<template>
  <div class="apce-wrap glass-card">
    <div class="apce-header">
      <h3>Редактировать контент проекта</h3>
      <button class="apce-add-btn" @click="showAdd = true">+ добавить раздел</button>
    </div>
    <div v-if="sections.length === 0" class="apce-empty">Нет разделов — добавьте первый!</div>
    <div v-for="(sect, i) in sections" :key="sect.id" class="apce-section">
      <component :is="getSectionComponent(sect.type)" :section="sect" @update="updateSection(i, $event)" />
      <div class="apce-section-actions">
        <button @click="removeSection(i)">Удалить</button>
        <button v-if="i > 0" @click="moveSection(i, i-1)">↑</button>
        <button v-if="i < sections.length-1" @click="moveSection(i, i+1)">↓</button>
      </div>
    </div>
    <div v-if="showAdd" class="apce-modal-backdrop" @click.self="showAdd = false">
      <div class="apce-modal">
        <h4>Добавить раздел</h4>
        <div class="apce-templates">
          <button v-for="tpl in templates" :key="tpl.type" @click="addSection(tpl.type)">{{ tpl.label }}</button>
        </div>
        <button @click="showAdd = false">Отмена</button>
      </div>
    </div>
    <div class="apce-save-row">
      <button class="apce-save-btn" @click="save" :disabled="saving">{{ saving ? '...' : 'Сохранить' }}</button>
      <span v-if="error" class="apce-error">{{ error }}</span>
      <span v-if="success" class="apce-success">Сохранено!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
const props = defineProps<{ slug: string; page: string }>()

type ProjectContentSection = {
  id: number
  type: string
  data: Record<string, any>
}

const sections = ref<ProjectContentSection[]>([])
const showAdd = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref(false)

function setSectionField(section: ProjectContentSection, key: string, value: any) {
  section.data ||= {}
  section.data[key] = value
}

const TextSection = defineComponent({
  name: 'TextSection',
  props: {
    section: { type: Object as () => ProjectContentSection, required: true },
  },
  emits: ['update'],
  setup(props, { emit }) {
    return () => h('div', { class: 'apce-sect apce-sect--text' }, [
      h('input', {
        type: 'text',
        value: props.section.data?.title ?? '',
        placeholder: 'Заголовок',
        onInput: (e: Event) => {
          const v = (e.target as HTMLInputElement).value
          setSectionField(props.section, 'title', v)
          emit('update', props.section.data)
        },
      }),
      h('textarea', {
        value: props.section.data?.text ?? '',
        placeholder: 'Текст',
        onInput: (e: Event) => {
          const v = (e.target as HTMLTextAreaElement).value
          setSectionField(props.section, 'text', v)
          emit('update', props.section.data)
        },
      }),
    ])
  },
})

const PhotoSection = defineComponent({
  name: 'PhotoSection',
  props: {
    section: { type: Object as () => ProjectContentSection, required: true },
  },
  emits: ['update'],
  setup(props, { emit }) {
    return () => h('div', { class: 'apce-sect apce-sect--photo' }, [
      h('input', {
        type: 'file',
        onChange: () => {
          emit('update', props.section.data)
        },
      }),
      h('input', {
        type: 'text',
        value: props.section.data?.caption ?? '',
        placeholder: 'Подпись',
        onInput: (e: Event) => {
          const v = (e.target as HTMLInputElement).value
          setSectionField(props.section, 'caption', v)
          emit('update', props.section.data)
        },
      }),
    ])
  },
})

const GallerySection = defineComponent({
  name: 'GallerySection',
  props: {
    section: { type: Object as () => ProjectContentSection, required: true },
  },
  emits: ['update'],
  setup() {
    return () => h('div', { class: 'apce-sect apce-sect--gallery' }, 'Галерея (реализовать загрузку нескольких фото)')
  },
})

const QuoteSection = defineComponent({
  name: 'QuoteSection',
  props: {
    section: { type: Object as () => ProjectContentSection, required: true },
  },
  emits: ['update'],
  setup(props, { emit }) {
    return () => h('div', { class: 'apce-sect apce-sect--quote' }, [
      h('textarea', {
        value: props.section.data?.quote ?? '',
        placeholder: 'Цитата',
        onInput: (e: Event) => {
          const v = (e.target as HTMLTextAreaElement).value
          setSectionField(props.section, 'quote', v)
          emit('update', props.section.data)
        },
      }),
    ])
  },
})

const LongPhotoSection = defineComponent({
  name: 'LongPhotoSection',
  props: {
    section: { type: Object as () => ProjectContentSection, required: true },
  },
  emits: ['update'],
  setup(props, { emit }) {
    return () => h('div', { class: 'apce-sect apce-sect--longphoto' }, [
      h('input', {
        type: 'file',
        onChange: () => {
          emit('update', props.section.data)
        },
      }),
      h('input', {
        type: 'text',
        value: props.section.data?.caption ?? '',
        placeholder: 'Подпись',
        onInput: (e: Event) => {
          const v = (e.target as HTMLInputElement).value
          setSectionField(props.section, 'caption', v)
          emit('update', props.section.data)
        },
      }),
    ])
  },
})

const templates = [
  { type: 'text', label: 'Текстовый блок' },
  { type: 'photo', label: 'Фото' },
  { type: 'gallery', label: 'Галерея' },
  { type: 'quote', label: 'Цитата' },
  { type: 'longphoto', label: 'Длинное фото' }
]

function getSectionComponent(type: string) {
  return {
    text: TextSection,
    photo: PhotoSection,
    gallery: GallerySection,
    quote: QuoteSection,
    longphoto: LongPhotoSection
  }[type] || TextSection
}

function addSection(type: string) {
  sections.value.push({ id: Date.now() + Math.random(), type, data: {} })
  showAdd.value = false
}
function removeSection(i: number) { sections.value.splice(i, 1) }
function moveSection(i: number, j: number) {
  const arr = sections.value
  if (i < 0 || j < 0 || i >= arr.length || j >= arr.length) return
  const [moved] = arr.splice(i, 1)
  if (!moved) return
  arr.splice(j, 0, moved)
}
function updateSection(i: number, data: any) {
  const section = sections.value[i]
  if (!section) return
  section.data = data
}

async function save() {
  saving.value = true; error.value = ''; success.value = false
  try {
    await $fetch(`/api/projects/${props.slug}/page-content`, {
      method: 'PUT',
      body: { pageSlug: props.page, content: { sections: sections.value } }
    })
    success.value = true
    setTimeout(() => success.value = false, 2000)
  } catch (e: any) {
    error.value = e?.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.apce-wrap { padding:32px; max-width:700px; margin:auto; }
.apce-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.apce-add-btn { font-size:1rem; padding:6px 16px; }
.apce-empty { color:#aaa; margin-bottom:24px; }
.apce-section { background:#f7f7f7; border-radius:10px; padding:18px; margin-bottom:18px; }
.apce-section-actions { display:flex; gap:8px; margin-top:10px; }
.apce-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.18); display:flex; align-items:center; justify-content:center; z-index:100; }
.apce-modal { background:#fff; padding:32px; border-radius:12px; min-width:320px; }
.apce-templates { display:flex; flex-direction:column; gap:12px; margin-bottom:18px; }
.apce-save-row { display:flex; gap:16px; align-items:center; margin-top:32px; }
.apce-save-btn { font-size:1rem; padding:8px 24px; }
.apce-error { color:#c00; }
.apce-success { color:#2a8f2a; }
</style>
