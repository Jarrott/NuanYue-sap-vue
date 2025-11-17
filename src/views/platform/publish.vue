<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { NButton } from 'naive-ui';

const quillContainerRef = ref<HTMLDivElement | null>(null);
const quillToolbarRef = ref<HTMLDivElement | null>(null);
const quillInstance = ref<any>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

function loadCss(href: string) {
  return new Promise<void>(resolve => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    document.head.appendChild(link);
  });
}

function loadScript(src: string) {
  return new Promise<void>(resolve => {
    if ((window as any).Quill) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}

async function initQuill() {
  // 使用 CDN 方式加载 Quill（无需安装依赖）
  await loadCss('https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css');
  await loadScript('https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js');
  const Quill = (window as any).Quill;

  // 自定义图片上传（base64）
  function imageHandler(this: any) {
    if (!fileInputRef.value) return;
    fileInputRef.value.click();
  }

  quillInstance.value = new Quill(quillContainerRef.value, {
    theme: 'snow',
    placeholder: '在此编写内容…',
    modules: {
      toolbar: {
        container: quillToolbarRef.value,
        handlers: {
          image: imageHandler
        }
      },
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true
      }
    }
  });
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    const quill = quillInstance.value;
    const range = quill.getSelection(true);
    quill.insertEmbed(range ? range.index : 0, 'image', base64, 'user');
    quill.setSelection((range ? range.index : 0) + 1, 0);
    input.value = '';
  };
  reader.readAsDataURL(file);
}

function handlePublish() {
  const html = quillInstance.value?.root?.innerHTML || '';
  // TODO: 调用后端发布接口，例如：request.post('/platform/publish', { content: html })
  console.log('publish content:', html);
  window.$message?.success('已发布（示例）');
}

onMounted(() => {
  initQuill();
});

onBeforeUnmount(() => {
  quillInstance.value = null;
});
</script>

<template>
  <div class="p-16px">
    <NCard :bordered="false" class="rd-12px shadow-sm">
      <template #header>
        <div class="flex-y-center justify-between w-full">
          <h3 class="text-18px text-primary font-medium">发布内容</h3>
          <NButton size="small" type="primary" @click="handlePublish">发布</NButton>
        </div>
      </template>
      <div ref="quillToolbarRef" class="quill-toolbar">
        <span class="ql-formats">
          <select class="ql-header">
            <option selected></option>
            <option value="1"></option>
            <option value="2"></option>
          </select>
          <select class="ql-font"></select>
        </span>
        <span class="ql-formats">
          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
          <button class="ql-underline"></button>
          <button class="ql-strike"></button>
        </span>
        <span class="ql-formats">
          <select class="ql-color"></select>
          <select class="ql-background"></select>
        </span>
        <span class="ql-formats">
          <button class="ql-list" value="ordered"></button>
          <button class="ql-list" value="bullet"></button>
          <button class="ql-blockquote"></button>
          <button class="ql-code-block"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-link"></button>
          <button class="ql-image"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-clean"></button>
        </span>
      </div>
      <div ref="quillContainerRef" class="editor"></div>
      <input ref="fileInputRef" type="file" accept="image/*" hidden @change="handleFileChange" />
    </NCard>
  </div>
</template>

<style scoped>
.editor {
  min-height: 420px;
  background: #fff;
}
.quill-toolbar {
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}
.editor :deep(.ql-container.ql-snow) {
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
}
</style>


