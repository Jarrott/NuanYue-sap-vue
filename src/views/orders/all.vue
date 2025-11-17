<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchAllOrders } from '@/service/api';
import { useLoading } from '@sa/hooks';

const keyword = ref('');
const sortOrder = ref<'asc' | 'desc'>('desc');
const pagination = ref({ page: 1, page_size: 10, total: 0 });
const { loading, startLoading, endLoading } = useLoading();

const data = ref<Api.Order.OrderItem[]>([]);

async function load() {
  startLoading();
  const { data: resp, error } = await fetchAllOrders({
    page: pagination.value.page,
    page_size: pagination.value.page_size,
    keyword: keyword.value || undefined,
    sort: sortOrder.value
  });
  if (!error && resp) {
    data.value = resp.items || [];
    pagination.value.total = resp.total ?? data.value.length;
  }
  endLoading();
}

onMounted(load);

function paymentStatus(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'need_purchase') {
    return { text: '未支付', type: 'error' as const };
  }
  if (s === 'pending') {
    return { text: '已支付', type: 'success' as const };
  }
  return { text: status, type: 'default' as const };
}

const columns = computed<DataTableColumns<Api.Order.OrderItem>>(() => [
  { title: '订单ID', key: 'order_id', minWidth: 220 },
  { title: '标题', key: 'title', minWidth: 220 },
  { title: '买家', key: 'buyer_name', width: 160 },
  { title: '地区', key: 'buyer_region', width: 160 },
  { title: '邮箱(掩码)', key: 'buyer_email_masked', width: 180 },
  { title: '数量', key: 'qty', width: 90 },
  { title: '单价', key: 'price', width: 100, render: r => r.price?.toFixed?.(2) ?? r.price },
  { title: '总价', key: 'total_price', width: 120, render: r => r.total_price?.toFixed?.(2) ?? r.total_price },
  { title: '零售价', key: 'total_retail_price', width: 120, render: r => r.total_retail_price?.toFixed?.(2) ?? r.total_retail_price },
  {
    title: '状态',
    key: 'status',
    width: 140,
    render: r => {
      const { text, type } = paymentStatus(r.status);
      return h(NTag, { type }, { default: () => text });
    }
  },
  { title: '需采购', key: 'purchase_required', width: 100, render: r => (r.purchase_required ? '是' : '否') },
  { title: '来源', key: 'source', width: 100 },
  { title: '商家ID', key: 'merchant_id', minWidth: 200 },
  { title: '用户ID', key: 'user_id', minWidth: 220 },
  { title: '地址', key: 'buyer_address', minWidth: 240 },
  { title: '创建时间', key: 'created_at', minWidth: 180, render: r => (r.created_at ? dayjs(r.created_at).format('YYYY-MM-DD HH:mm:ss') : '-') }
]);

const tablePagination = computed(() => ({
  page: pagination.value.page,
  pageSize: pagination.value.page_size,
  itemCount: pagination.value.total,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  ['onUpdate:page']: (p: number) => {
    pagination.value.page = p;
    load();
  },
  ['onUpdate:pageSize']: (s: number) => {
    pagination.value.page_size = s;
    pagination.value.page = 1;
    load();
  }
}) as any);
</script>

<template>
  <div class="p-16px">
    <NCard :bordered="false" class="rd-12px shadow-sm">
      <template #header>
        <div class="flex-y-center justify-between w-full">
          <h3 class="text-18px text-primary font-medium">所有订单</h3>
          <div class="flex gap-12px">
            <NInput v-model:value="keyword" placeholder="搜索订单ID/买家/标题" clearable style="width: 260px" />
            <NSelect v-model:value="sortOrder" :options="[{ label: '降序', value: 'desc' }, { label: '升序', value: 'asc' }]" style="width: 120px" />
            <NButton @click="() => { pagination.page = 1; load(); }">查询</NButton>
            <NButton quaternary @click="load">刷新</NButton>
          </div>
        </div>
      </template>
      <NDataTable :columns="columns" :data="data" :loading="loading" :pagination="tablePagination" size="small" striped :bordered="false" />
    </NCard>
  </div>
</template>

<style scoped></style>


