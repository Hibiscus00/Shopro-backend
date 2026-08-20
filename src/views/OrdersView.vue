<template>
  <div class="page-title"><h2>订单与套餐</h2></div>
  <div class="cards"><div v-for="item in metrics" :key="item.label" class="card"><span class="kpi-label">{{ item.label }}</span><div class="kpi-value">{{ item.value }}</div><span class="trend">{{ item.trend }}</span></div></div>
  <div class="panel" style="margin-top:16px"><div class="toolbar"><el-select v-model="status" placeholder="支付状态" clearable @change="load"><el-option label="已支付" value="paid"/><el-option label="待支付" value="unpaid"/><el-option label="退款中" value="refunding"/><el-option label="已退款" value="refunded"/></el-select></div><el-table :data="rows" v-loading="loading"><el-table-column prop="id" label="订单号"/><el-table-column prop="user" label="用户"/><el-table-column prop="plan" label="套餐"/><el-table-column prop="amount" label="金额"><template #default="{ row }">¥{{ row.amount }}</template></el-table-column><el-table-column label="状态"><template #default="{ row }"><el-tag>{{ labels[row.status] }}</el-tag></template></el-table-column><el-table-column prop="createdAt" label="创建时间"/></el-table><el-pagination layout="total,prev,pager,next" :total="total" v-model:current-page="page" @current-change="load"/></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/api'
const metrics = [{ label: '本月成交额', value: '¥86,420', trend: '较上月 +18.2%' }, { label: '支付订单', value: '1,248', trend: '支付转化 82.4%' }, { label: '专业套餐占比', value: '46.8%', trend: '核心套餐' }, { label: '退款率', value: '1.8%', trend: '低于行业均值' }]
const labels: Record<string, string> = { paid: '已支付', unpaid: '待支付', refunding: '退款中', refunded: '已退款' }; const rows = ref<any[]>([]); const total = ref(0); const page = ref(1); const status = ref(''); const loading = ref(false)
async function load() { loading.value = true; try { const result = await api.orders({ page: page.value, pageSize: 10, status: status.value }); rows.value = result.data.items; total.value = result.data.total } finally { loading.value = false } }
onMounted(load)
</script>
