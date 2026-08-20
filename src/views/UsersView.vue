<template>
  <div class="page-title"><h2>用户与积分</h2></div>
  <div class="panel"><div class="toolbar"><el-input v-model="keyword" placeholder="搜索姓名或邮箱" clearable @keyup.enter="load"/><el-select v-model="status" placeholder="账号状态" clearable><el-option label="正常" value="active"/><el-option label="已禁用" value="disabled"/></el-select><el-button type="primary" @click="load">查询</el-button></div><el-table :data="rows" v-loading="loading"><el-table-column prop="name" label="用户"/><el-table-column prop="email" label="邮箱"/><el-table-column prop="type" label="类型"/><el-table-column prop="credits" label="积分"/><el-table-column label="状态"><template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '正常' : '已禁用' }}</el-tag></template></el-table-column><el-table-column label="操作" width="190"><template #default="{ row }"><el-button link type="primary" @click="credit(row)">调积分</el-button><el-button link @click="toggle(row)">{{ row.status === 'active' ? '禁用' : '启用' }}</el-button></template></el-table-column></el-table><el-pagination layout="total,prev,pager,next" :total="total" v-model:current-page="page" @current-change="load"/></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/api'
const rows = ref<any[]>([]); const total = ref(0); const page = ref(1); const keyword = ref(''); const status = ref(''); const loading = ref(false)
async function load() { loading.value = true; try { const result = await api.users({ page: page.value, pageSize: 10, keyword: keyword.value, status: status.value }); rows.value = result.data.items; total.value = result.data.total } finally { loading.value = false } }
async function toggle(row: any) { await ElMessageBox.confirm(`确定${row.status === 'active' ? '禁用' : '启用'} ${row.name}？`); await api.userStatus(row.id, row.status === 'active' ? 'disabled' : 'active'); ElMessage.success('操作成功'); load() }
async function credit(row: any) { const value = window.prompt('请输入调整积分（可为负数）', '100'); if (value !== null) { await api.credits(row.id, Number(value)); ElMessage.success('积分已调整'); load() } }
onMounted(load)
</script>
