<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NAvatar, NTag, NButton } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchMerchantList, reviewMerchant } from '@/service/api';
import { useLoading } from '@sa/hooks';

const keyword = ref('');
const sortOrder = ref<'asc' | 'desc'>('desc');
const pagination = ref({ page: 1, size: 20, total: 0 });
const { loading, startLoading, endLoading } = useLoading();

const data = ref<Api.Merchant.MerchantItem[]>([]);

async function load() {
  startLoading();
  const { data: resp, error } = await fetchMerchantList({
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

const columns = computed<DataTableColumns<Api.Merchant.MerchantItem>>(() => [
  {
    title: 'Logo',
    key: 'logo',
    width: 72,
    align: 'center',
    render: row => h(NAvatar, { size: 36, src: row.logo || undefined }, { default: () => (row.store_name?.[0] || 'S').toUpperCase() })
  },
  { title: '商家ID', key: 'store_id', minWidth: 180 },
  { title: '商家名称', key: 'store_name', minWidth: 160 },
  { title: '邮箱', key: 'email', minWidth: 180, render: r => r.email || '-' },
  { title: '等级', key: 'level', width: 100, render: r => r.level || '-' },
  {
    title: '认证',
    key: 'verify_badge',
    width: 100,
    render: r => (r.verify_badge ? h(NTag, { type: 'success' }, { default: () => '已认证' }) : h(NTag, null, { default: () => '未认证' }))
  },
  {
    title: '状态',
    key: 'status',
    width: 110,
    render: r => {
      const st = (r.status || '').toLowerCase();
      let text = '审核中';
      let type: 'success' | 'error' | 'warning' | 'default' = 'warning';
      if (st === 'approved') {
        text = '已通过';
        type = 'success';
      } else if (st.startsWith('reject')) {
        text = '已驳回';
        type = 'error';
      }
      return h(NTag, { type }, { default: () => text });
    }
  },
  { title: '地址', key: 'address', minWidth: 180, render: r => r.address || '-' },
  {
    title: '创建时间',
    key: 'create_time',
    minWidth: 180,
    render: r => (r.create_time ? dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss') : '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render: row => {
      const isApproved = (row.status || '').toLowerCase() === 'approved';
      return h('div', { class: 'flex gap-8px' }, [
        h(
          NButton,
          { size: 'small', type: 'primary', disabled: isApproved, onClick: () => handleApprove(row) },
          { default: () => '通过' }
        ),
        h(
          NButton,
          { size: 'small', type: 'error', disabled: isApproved, onClick: () => openReject(row) },
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

const showReject = ref(false);
const rejectReason = ref('');
const currentRow = ref<Api.Merchant.MerchantItem | null>(null);

function openReject(row: Api.Merchant.MerchantItem) {
  currentRow.value = row;
  rejectReason.value = '';
  showReject.value = true;
}

async function handleApprove(row: Api.Merchant.MerchantItem) {
  await window.$dialog?.warning({
    title: '确认操作',
    content: `确认通过商家「${row.store_name}」的申请吗？`,
    positiveText: '确认',
    negativeText: '取消',
    async onPositiveClick() {
      const { error } = await reviewMerchant({
        uid: (row.uid as string) || row.store_id,
        store_id: row.store_id,
        result: 'approve'
      });
      if (!error) {
        window.$message?.success('已通过');
        await load();
      }
    }
  });
}

async function submitReject() {
  if (!currentRow.value) return;
  if (!rejectReason.value) {
    window.$message?.warning('请输入驳回原因');
    return;
  }
  const { error } = await reviewMerchant({
    uid: (currentRow.value.uid as string) || currentRow.value.store_id,
    store_id: currentRow.value.store_id,
    result: 'reject',
    reason: rejectReason.value
  });
  if (!error) {
    window.$message?.success('已驳回');
    showReject.value = false;
    await load();
  }
}
</script>

<template>
  <div class="p-16px">
    <NCard :bordered="false" class="rd-12px shadow-sm">
      <template #header>
        <div class="flex-y-center justify-between w-full">
          <h3 class="text-18px text-primary font-medium">卖家申请列表</h3>
          <div class="flex gap-12px">
            <NInput v-model:value="keyword" placeholder="搜索商家名称/邮箱" clearable style="width: 240px" />
            <NSelect v-model:value="sortOrder" :options="[{ label: '降序', value: 'desc' }, { label: '升序', value: 'asc' }]" style="width: 120px" />
            <NButton @click="() => { pagination.page = 1; load(); }">查询</NButton>
            <NButton quaternary @click="load">刷新</NButton>
          </div>
        </div>
      </template>
      <NDataTable :columns="columns" :data="data" :loading="loading" size="small" striped :bordered="false" :pagination="tablePagination" />
    </NCard>
    <NModal v-model:show="showReject" preset="dialog" title="驳回申请">
      <div class="flex flex-col gap-12px">
        <div class="text-#666">请输入驳回原因：</div>
        <NInput
          v-model:value="rejectReason"
          type="textarea"
          placeholder="请填写驳回原因"
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </div>
      <template #action>
        <NButton @click="showReject = false">取消</NButton>
        <NButton type="error" @click="submitReject">驳回</NButton>
      </template>
    </NModal>
  </div>
</template>

<style scoped></style>


