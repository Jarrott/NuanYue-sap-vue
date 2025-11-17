<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NImage, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchKycList, reviewKyc } from '@/service/api';
import { useLoading } from '@sa/hooks';

const keyword = ref('');
const sortOrder = ref<'asc' | 'desc'>('desc');
const pagination = ref({ page: 1, size: 20, total: 0 });
const { loading, startLoading, endLoading } = useLoading();

const data = ref<Api.Kyc.KycItem[]>([]);

async function load() {
  startLoading();
  const { data: resp, error } = await fetchKycList({
    keyword: keyword.value || undefined,
    sort: sortOrder.value,
    page: pagination.value.page,
    size: pagination.value.size
  });
  if (!error && resp) {
    data.value = resp.items || [];
    pagination.value.total = resp.total ?? data.value.length;
  }
  endLoading();
}

onMounted(load);

function normalizeStatus(s: string | number) {
  if (typeof s === 'number') {
    if (s === 1) return 'approved';
    if (s === -1) return 'rejected';
    return 'pending';
  }
  const str = (s || '').toString().toLowerCase();
  if (str.startsWith('approve')) return 'approved';
  if (str.startsWith('reject')) return 'rejected';
  return 'pending';
}

function statusText(item: Api.Kyc.KycItem) {
  const ns = normalizeStatus(item.status);
  if (ns === 'approved') return '通过';
  if (ns === 'rejected') return '驳回';
  return '审核中';
}

const columns = computed<DataTableColumns<Api.Kyc.KycItem>>(() => [
  { title: 'UID', key: 'uid', width: 100 },
  { title: '姓名', key: 'full_name', minWidth: 140 },
  { title: '证件类型', key: 'id_type', width: 120 },
  { title: '证件号', key: 'id_number', minWidth: 160 },
  { title: '国籍', key: 'nationality', width: 100, render: r => (r.nationality || '').toUpperCase() || '-' },
  {
    title: '状态',
    key: 'status',
    width: 110,
    render: r => {
      const ns = normalizeStatus(r.status);
      const type = ns === 'approved' ? 'success' : ns === 'rejected' ? 'error' : 'warning';
      return h(NTag, { type }, { default: () => statusText(r) });
    }
  },
  {
    title: '证件正面',
    key: 'id_front_url',
    width: 120,
    render: r => (r.id_front_url ? h(NImage, { width: 56, src: r.id_front_url }) : '-')
  },
  {
    title: '证件反面',
    key: 'id_back_url',
    width: 120,
    render: r => (r.id_back_url ? h(NImage, { width: 56, src: r.id_back_url }) : '-')
  },
  {
    title: '自拍照',
    key: 'selfie_url',
    width: 120,
    render: r => (r.selfie_url ? h(NImage, { width: 56, src: r.selfie_url }) : '-')
  },
  {
    title: '创建时间',
    key: 'create_time',
    minWidth: 180,
    render: r => (r.create_time ? dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss') : '-')
  },
  {
    title: '更新时间',
    key: 'update_time',
    minWidth: 180,
    render: r => (r.update_time ? dayjs(r.update_time).format('YYYY-MM-DD HH:mm:ss') : '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render: row => {
      const passed = normalizeStatus(row.status) === 'approved';
      return h('div', { class: 'flex gap-8px' }, [
        h(
          NButton,
          { size: 'small', type: 'primary', disabled: passed, onClick: () => handleApprove(row) },
          { default: () => '通过' }
        ),
        h(
          NButton,
          { size: 'small', type: 'error', disabled: passed, onClick: () => openReject(row) },
          { default: () => '驳回' }
        )
      ]);
    }
  }
]);

const tablePagination = computed(() => ({
  page: pagination.value.page,
  pageSize: pagination.value.size,
  itemCount: pagination.value.total,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  ['onUpdate:page']: (p: number) => {
    pagination.value.page = p;
    load();
  },
  ['onUpdate:pageSize']: (s: number) => {
    pagination.value.size = s;
    pagination.value.page = 1;
    load();
  }
}) as any);

async function handleApprove(row: Api.Kyc.KycItem) {
  await window.$dialog?.warning({
    title: '确认操作',
    content: `确认通过用户 ${row.uid} 的KYC吗？`,
    positiveText: '确认',
    negativeText: '取消',
    async onPositiveClick() {
      const { error } = await reviewKyc(row.uid, true);
      if (!error) {
        window.$message?.success('已通过');
        await load();
      }
    }
  });
}

async function openReject(row: Api.Kyc.KycItem) {
  await window.$dialog?.warning({
    title: '确认操作',
    content: `确认驳回用户 ${row.uid} 的KYC吗？`,
    positiveText: '驳回',
    negativeText: '取消',
    async onPositiveClick() {
      const { error } = await reviewKyc(row.uid, false);
      if (!error) {
        window.$message?.success('已驳回');
        await load();
      }
    }
  });
}
</script>

<template>
  <div class="p-16px">
    <NCard :bordered="false" class="rd-12px shadow-sm">
      <template #header>
        <div class="flex-y-center justify-between w-full">
          <h3 class="text-18px text-primary font-medium">用户KYC认证列表</h3>
          <div class="flex gap-12px">
            <NInput v-model:value="keyword" placeholder="搜索UID/姓名/证件号" clearable style="width: 240px" />
            <NSelect v-model:value="sortOrder" :options="[{ label: '降序', value: 'desc' }, { label: '升序', value: 'asc' }]" style="width: 120px" />
            <NButton @click="() => { pagination.page = 1; load(); }">查询</NButton>
            <NButton quaternary @click="load">刷新</NButton>
          </div>
        </div>
      </template>
      <NDataTable :columns="columns" :data="data" :loading="loading" size="small" striped :bordered="false" :pagination="tablePagination" />
    </NCard>

  </div>
</template>

<style scoped></style>


