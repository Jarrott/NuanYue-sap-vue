<script setup lang="ts">
import { ref, computed, reactive, onMounted, h, watch } from 'vue';
import dayjs from 'dayjs';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NTag, NAvatar, NSwitch, NSelect, NTooltip } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { fetchUserList, createUser, updateUser, deleteUser, forceLogout, adjustUserBalance, pushMessage } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useLoading } from '@sa/hooks';

const { loading, startLoading, endLoading } = useLoading();

const users = ref<Api.User.CmsUser[]>([]);
const selectedRow = ref<Api.User.CmsUser | null>(null);
const keyword = ref('');
const sortOrder = ref<'asc' | 'desc'>('desc');
const pagination = reactive({ page: 1, size: 10, total: 0 });
const showChildren = ref(false);
const childrenLevel = ref<'L1' | 'L2' | 'L3'>('L1');

async function load() {
  startLoading();
  const { data, error } = await fetchUserList({
    keyword: keyword.value || undefined,
    sort: sortOrder.value,
    page: pagination.page,
    size: pagination.size
  });
  if (!error && data) {
    users.value = Array.isArray((data as any).items) ? (data as any).items : ((data as any) as Api.User.CmsUser[]);
    // support both paginated and array responses
    const total = (data as any).total ?? users.value.length;
    const page = (data as any).page ?? pagination.page;
    // 统一以前端选择的 size 为准，不使用后端返回的 size，避免不一致导致分页控件灰掉
    Object.assign(pagination, { total, page: Number(page) });
  }
  endLoading();
}

onMounted(load);

watch(sortOrder, () => {
  pagination.page = 1;
  load();
});

function asBool(v: unknown) {
  return v === true || v === 1 || v === '1';
}

function format2(n: unknown) {
  const num = typeof n === 'number' ? n : Number(n || 0);
  return num.toFixed(2);
}

const filtered = computed(() => users.value);

/** uuid 展示控制 */
const showUuidMap = ref<Record<string, boolean>>({});
function truncateUuid(v: string) {
  if (!v) return '-';
  const s = String(v);
  if (s.length <= 6) return s;
  // 显示前三位 + 后三位
  return `${s.slice(0, 3)}...${s.slice(-3)}`;
}

const tablePagination = computed(() => {
  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.size || 1));
  return {
    page: pagination.page,
    pageSize: pagination.size,
    itemCount: pagination.total,
    pageCount,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    ['onUpdate:page']: (p: number) => {
      pagination.page = p;
      load();
    },
    ['onUpdate:pageSize']: (s: number) => {
      pagination.size = s;
      pagination.page = 1;
      load();
    }
  } as any;
});

const columns = computed<DataTableColumns<Api.User.CmsUser>>(() => [
  {
    title: '头像',
    key: 'avatar',
    width: 72,
    align: 'center',
    render: row => {
      const online = (row as any).is_online === true;
      const ringColor = online ? '#18a058' : '#d03050'; // success / error
      const size = 36; // 头像统一尺寸，如需调整改这里
      const src = (row as any).avatar || (row as any)._avatar || '';
      const initial = row.username ? row.username[0]?.toUpperCase() : '?';

      // 外层状态环
      const wrapperStyle =
        `display:inline-flex; padding:2px; border-radius:8px; background-color:${ringColor};` +
        `box-sizing: content-box;`;

      // 内层头像容器（白底，保证首字母可见）
      const innerStyle =
        `width:${size}px; height:${size}px; border-radius:6px; overflow:hidden; background:#fff;` +
        `display:flex; align-items:center; justify-content:center; color:#333; font-weight:600;`;

      // 如果有图片就渲染图片，否则渲染首字母
      const content = src
        ? h('img', { src, style: 'width:100%; height:100%; object-fit:cover; border-radius:6px;' })
        : h('span', { style: 'font-size:14px;' }, initial);

      return h('div', { style: wrapperStyle }, [h('div', { style: innerStyle }, [content])]);
    }
  },
  { title: '用户名', key: 'username', minWidth: 160 },
  { title: 'ID', key: 'id', width: 120, render: r => String((r as any).id ?? r.extra?.id ?? '-') },
  {
    title: 'UUID',
    key: 'uuid',
    minWidth: 260,
    render: r => {
      const raw = (r as any).uuid;
      if (raw === undefined || raw === null) return '-';
      const uuidStr = String(raw);
      const key = uuidStr;
      const visible = !!showUuidMap.value[key];
      const text = visible ? uuidStr : truncateUuid(uuidStr);
      const iconName = visible ? 'mdi:eye-off-outline' : 'mdi:eye-outline';
      return h('div', { class: 'flex items-center gap-8px' }, [
        h('span', text),
        h('span',
          {
            class: 'cursor-pointer text-#666 hover:text-#333',
            onClick: () => (showUuidMap.value[key] = !visible),
            title: visible ? '隐藏' : '查看'
          },
          [h(Icon, { icon: iconName, width: 18, height: 18 })]
        )
      ]);
    }
  },
  { title: '昵称', key: 'nickname', minWidth: 120, render: r => r.nickname || '-' },
  {
    title: '邮箱',
    key: 'email',
    minWidth: 200,
    render: r => r.email || '-'
  },
  {
    title: '手机号',
    key: 'phone',
    minWidth: 150,
    render: r => r.phone || r.extra?.phone || '-'
  },
  {
    title: '积分',
    key: 'points',
    render: row => row.points ?? row.extra?.points ?? 0,
    width: 100
  },
  {
    title: '余额',
    key: 'balance',
    render: r => format2(r.balance ?? r.extra?.balance),
    width: 120
  },
  {
    title: '邀请码',
    key: 'referral.invite_code',
    minWidth: 130,
    render: r => r.referral?.invite_code || r.extra?.referral?.invite_code || '-'
  },
  {
    title: '设备锁',
    key: 'settings.device_lock',
    width: 110,
    render: r => {
      const isOn = asBool((r.settings as any)?.device_lock ?? r.extra?.settings?.device_lock);
      return h(NTag, { type: isOn ? 'warning' : 'default' }, { default: () => (isOn ? '开启' : '关闭') });
    }
  },
  {
    title: 'KYC',
    key: 'kyc_status',
    width: 100,
    render: r => {
      const passed = asBool(r.kyc_status ?? r.extra?.kyc_status);
      return h(NTag, { type: passed ? 'success' : 'default' }, { default: () => (passed ? '通过' : '未通过') });
    }
  },
  {
    title: '商家',
    key: 'is_merchant',
    width: 100,
    render: r => {
      const merchant = asBool((r as any).is_merchant ?? r.extra?.is_merchant);
      return h(NTag, { type: merchant ? 'success' : 'default' }, { default: () => (merchant ? '商户' : '非商户') });
    }
  },
  {
    title: '会员',
    key: 'vip_status',
    width: 100,
    render: row => {
      const isVip = asBool(row.vip_status ?? row.extra?.vip_status);
      return h(NTag, { type: isVip ? 'success' : 'default' }, { default: () => (isVip ? '是' : '否') });
    }
  },
  // {
  //   title: '创建时间',
  //   key: 'created_at',
  //   minWidth: 180,
  //   render: r => {
  //     const t = r.created_at ?? r.create_time;
  //     return t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '-';
  //   }
  // },
  {
    title: '操作',
    key: 'actions',
    width: 260,
    render: row =>
      h('div', { class: 'flex gap-8px' }, [
        h(NTooltip, null, {
          trigger: () =>
            h(
              NButton,
              { size: 'small', quaternary: true, circle: true, onClick: () => openEdit(row) },
              { default: () => h(Icon, { icon: 'mdi:pencil-outline', width: 18, height: 18 }) }
            ),
          default: () => '编辑'
        }),
        h(NTooltip, null, {
          trigger: () =>
            h(
              NButton,
              { size: 'small', quaternary: true, circle: true, onClick: () => openAdjustFromRow(row) },
              { default: () => h(Icon, { icon: 'mdi:cash-sync', width: 18, height: 18 }) }
            ),
          default: () => '余额变更'
        }),
        h(NTooltip, null, {
          trigger: () =>
            h(
              NButton,
              { size: 'small', quaternary: true, circle: true, onClick: () => openChildren(row) },
              { default: () => h(Icon, { icon: 'mdi:account-group-outline', width: 18, height: 18 }) }
            ),
          default: () => '下级'
        }),
        h(NTooltip, null, {
          trigger: () =>
            h(
              NButton,
              { size: 'small', quaternary: true, circle: true, onClick: () => openPush(row) },
              { default: () => h(Icon, { icon: 'mdi:message-outline', width: 18, height: 18 }) }
            ),
          default: () => '发送信息'
        }),
        h(NTooltip, null, {
          trigger: () =>
            h(
              NButton,
              { size: 'small', quaternary: true, circle: true, type: 'warning', onClick: () => handleForceLogout(row) },
              { default: () => h(Icon, { icon: 'mdi:account-cancel-outline', width: 18, height: 18 }) }
            ),
          default: () => '违规踢出'
        }),
        h(NTooltip, null, {
          trigger: () =>
            h(
              NButton,
              { size: 'small', quaternary: true, circle: true, type: 'error', onClick: () => handleDelete(row) },
              { default: () => h(Icon, { icon: 'mdi:delete-outline', width: 18, height: 18 }) }
            ),
          default: () => '删除'
        })
      ])
  }
]);

const showForm = ref(false);
const isEdit = ref(false);

interface FormModel {
  uuid?: number | string;
  username: string;
  nickname?: string | null;
  email?: string | null;
  points?: number | null;
  phone?: string | null;
  balance?: number | null;
  device_lock: boolean;
  kyc_status: boolean;
  vip_status: boolean;
}

const formModel = reactive<FormModel>({
  uuid: undefined,
  username: '',
  nickname: '',
  email: '',
  points: 0,
  phone: '',
  balance: 0,
  device_lock: false,
  kyc_status: false,
  vip_status: false
});

const { formRef, validate } = useNaiveForm();
const { formRules } = useFormRules();
const rules = computed<Partial<Record<keyof FormModel, App.Global.FormRule[]>>>(() => ({
  username: formRules.userName,
  nickname: [],
  email: [],
  points: [],
  phone: [],
  balance: []
}));

function openCreate() {
  isEdit.value = false;
  Object.assign(formModel, {
    id: undefined,
    username: '',
    nickname: '',
    email: '',
    points: 0,
    phone: '',
    balance: 0,
    device_lock: false,
    kyc_status: false,
    vip_status: false
  });
  showForm.value = true;
}

function openEdit(row: Api.User.CmsUser) {
  isEdit.value = true;
  Object.assign(formModel, {
    uuid: (row as any).uuid ?? (row as any).id,
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    points: (row.points as number) ?? (row.extra?.points as number) ?? 0,
    phone: row.phone ?? row.extra?.phone ?? '',
    balance: (row.balance as number) ?? (row.extra?.balance as number) ?? 0,
    device_lock: asBool(((row.settings as any)?.device_lock ?? row.extra?.settings?.device_lock) as unknown),
    kyc_status: asBool((row.kyc_status ?? row.extra?.kyc_status) as unknown),
    vip_status: asBool((row.vip_status ?? row.extra?.vip_status) as unknown)
  });
  showForm.value = true;
}

function openView(row: Api.User.CmsUser) {
  selectedRow.value = row;
  showDetail.value = true;
}

function openChildren(row: Api.User.CmsUser) {
  selectedRow.value = row;
  childrenLevel.value = 'L1';
  showChildren.value = true;
}

async function handleSubmit() {
  await validate();
  if (isEdit.value && formModel.uuid != null) {
    const payload: Api.User.CmsUserUpdate = {
      username: formModel.username,
      nickname: formModel.nickname ?? null,
      email: formModel.email ?? null,
      points: formModel.points ?? undefined,
      phone: formModel.phone ?? undefined,
      kyc_status: formModel.kyc_status,
      vip_status: formModel.vip_status,
      settings: { device_lock: formModel.device_lock }
    };
    const { error } = await updateUser(formModel.uuid as any, payload);
    if (!error) {
      window.$message?.success('已更新');
      showForm.value = false;
      await load();
    }
  } else {
    const payload: Api.User.CmsUserCreate = {
      username: formModel.username,
      nickname: formModel.nickname ?? null,
      email: formModel.email ?? null,
      points: formModel.points ?? undefined,
      phone: formModel.phone ?? undefined,
      kyc_status: formModel.kyc_status,
      vip_status: formModel.vip_status,
      settings: { device_lock: formModel.device_lock }
    };
    const { error } = await createUser(payload);
    if (!error) {
      window.$message?.success('已创建');
      showForm.value = false;
      await load();
    }
  }
}

async function handleDelete(row: Api.User.CmsUser) {
  await window.$dialog?.warning({
    title: '确认删除',
    content: `确认删除用户「${row.username}」吗？此操作不可撤销`,
    positiveText: '删除',
    negativeText: '取消',
    async onPositiveClick() {
      const uuid = (row as any).uuid ?? (row as any).id;
      const { error } = await deleteUser(uuid as any);
      if (!error) {
        window.$message?.success('已删除');
        await load();
      }
    }
  });
}

const showDetail = ref(false);

async function handleForceLogout(row: Api.User.CmsUser) {
  window.$dialog?.warning({
    title: '确认操作',
    content: `确定要将用户「${row.username}」强制下线吗？`,
    positiveText: '确认',
    negativeText: '取消',
    async onPositiveClick() {
      const { error } = await forceLogout(row.id);
      if (!error) {
        window.$message?.success('已强制下线');
        await load();
      }
    }
  });
}

/** adjust balance modal */
const showAdjust = ref(false);
const adjustAmount = ref<number>(0);
const adjustReason = ref<string>('');
const showPush = ref(false);
const pushContent = ref<string>('');

function openAdjustBalance() {
  showAdjust.value = true;
  adjustAmount.value = 0;
  adjustReason.value = '';
}

function openPush(row: Api.User.CmsUser) {
  selectedRow.value = row;
  pushContent.value = '';
  showPush.value = true;
}

function openAdjustFromRow(row: Api.User.CmsUser) {
  formModel.uuid = (row as any).uuid ?? (row as any).id;
  formModel.balance = Number((row.balance as number) ?? (row.extra?.balance as number) ?? 0);
  openAdjustBalance();
}

async function submitAdjust() {
  if (formModel.uuid == null) return;
  const amount = Number(adjustAmount.value || 0);
  if (!amount) {
    window.$message?.warning('请输入非 0 的变更金额');
    return;
  }
  if (!adjustReason.value) {
    window.$message?.warning('请输入原因');
    return;
  }
  const { error } = await adjustUserBalance(formModel.uuid as any, amount, adjustReason.value);
  if (!error) {
    window.$message?.success('余额已变更');
    formModel.balance = Number((formModel.balance || 0) + amount);
    showAdjust.value = false;
    await load();
  }
}

async function submitPush() {
  if (!selectedRow.value) return;
  if (!pushContent.value) {
    window.$message?.warning('请输入要发送的内容');
    return;
  }
  const { error } = await pushMessage(selectedRow.value.id, pushContent.value);
  if (!error) {
    window.$message?.success('已发送');
    showPush.value = false;
  }
}

const childrenColumns = computed<DataTableColumns<Api.User.CmsUser>>(() => [
  { title: '用户名', key: 'username', minWidth: 160 },
  { title: '昵称', key: 'nickname', minWidth: 120, render: r => r.nickname || '-' },
  {
    title: '邀请码',
    key: 'referral.invite_code',
    minWidth: 130,
    render: r => r.referral?.invite_code || '-'
  },
  {
    title: '创建时间',
    key: 'created_at',
    minWidth: 160,
    render: r => (r.created_at ? dayjs(r.created_at).format('YYYY-MM-DD HH:mm:ss') : '-')
  }
]);

const childrenList = computed(() => {
  if (!selectedRow.value) return [];
  const id = selectedRow.value.id;
  return users.value.filter(u => (u.referral?.inviter_id as unknown) === id);
});
</script>

<template>
  <div class="p-16px">
    <NCard :bordered="false" class="rd-12px shadow-sm">
      <template #header>
        <div class="flex-y-center justify-between w-full">
          <h3 class="text-18px text-primary font-medium">用户管理</h3>
          <div class="flex gap-12px">
            <NInput v-model:value="keyword" placeholder="搜索用户名/昵称" clearable style="width: 240px" />
            <NSelect v-model:value="sortOrder" :options="[{label:'降序',value:'desc'},{label:'升序',value:'asc'}]" style="width: 120px" />
            <NButton @click="() => { pagination.page = 1; load(); }">查询</NButton>
            <NButton quaternary @click="load">刷新</NButton>
            <NButton type="primary" @click="openCreate">新建用户</NButton>
          </div>
        </div>
      </template>
      <NDataTable
        :columns="columns"
        :data="filtered"
        :loading="loading"
        size="small"
        striped
        :bordered="false"
        :pagination="tablePagination"
      />
    </NCard>

    <NModal v-model:show="showForm" preset="dialog" :title="isEdit ? 'Edit User' : 'Create User'">
      <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="top">
        <NFormItem label="用户名" path="username">
          <NInput v-model:value="formModel.username" />
        </NFormItem>
        <NFormItem label="昵称" path="nickname">
          <NInput v-model:value="formModel.nickname" />
        </NFormItem>
        <NFormItem label="邮箱" path="email">
          <NInput v-model:value="formModel.email" />
        </NFormItem>
        <NFormItem label="积分" path="points">
          <NInputNumber v-model:value="formModel.points" :min="0" />
        </NFormItem>
        <NFormItem label="手机号" path="phone">
          <NInput v-model:value="formModel.phone" />
        </NFormItem>
        <NFormItem label="余额" path="balance">
          <div class="flex gap-12px items-center">
            <NInputNumber v-model:value="formModel.balance" :min="0" :precision="2" disabled />
            <NButton size="small" @click="openAdjustBalance">变更金额</NButton>
          </div>
        </NFormItem>
        <div class="grid grid-cols-3 gap-12px">
          <NFormItem label="设备锁">
            <NSwitch v-model:value="formModel.device_lock" :round="false" />
          </NFormItem>
          <NFormItem label="KYC 通过">
            <NSwitch v-model:value="formModel.kyc_status" :round="false" />
          </NFormItem>
          <NFormItem label="会员">
            <NSwitch v-model:value="formModel.vip_status" :round="false" />
          </NFormItem>
        </div>
        <div class="mt-12px flex justify-end gap-12px">
          <NButton @click="showForm = false">取消</NButton>
          <NButton type="primary" @click="handleSubmit">保存</NButton>
        </div>
      </NForm>
    </NModal>

    <NModal v-model:show="showDetail" preset="dialog" title="用户详情">
      <NCode :code="JSON.stringify(selectedRow, null, 2)" language="json" />
    </NModal>

    <NModal v-model:show="showChildren" preset="card" :title="`下级（直推 L1） - ${selectedRow?.username || ''}`" style="width: 720px">
      <NDataTable :columns="childrenColumns" :data="childrenList" size="small" striped :bordered="false" />
    </NModal>

    <NModal v-model:show="showAdjust" preset="dialog" title="变更余额">
      <div class="flex flex-col gap-12px">
        <div class="flex items-center gap-12px">
          <span>变更金额（正数增加，负数减少）：</span>
          <NInputNumber v-model:value="adjustAmount" :precision="2" />
        </div>
        <div class="flex items-center gap-12px">
          <span>原因：</span>
          <NInput v-model:value="adjustReason" placeholder="请输入原因" style="width: 360px" />
        </div>
      </div>
      <template #action>
        <NButton @click="showAdjust = false">取消</NButton>
        <NButton type="primary" @click="submitAdjust">确定</NButton>
      </template>
    </NModal>

    <NModal v-model:show="showPush" preset="dialog" title="发送信息">
      <div class="flex flex-col gap-12px">
        <NInput
          v-model:value="pushContent"
          type="textarea"
          placeholder="请输入要发送的内容"
          :autosize="{ minRows: 4, maxRows: 8 }"
        />
      </div>
      <template #action>
        <NButton @click="showPush = false">取消</NButton>
        <NButton type="primary" @click="submitPush">发送</NButton>
      </template>
    </NModal>
  </div>
  </template>

<style scoped></style>

<script lang="ts">
export default {};
</script>


