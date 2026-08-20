<template>
  <div class="page-title"><h2>AI 任务中心</h2></div>
  <div class="panel">
    <div class="toolbar">
      <el-select v-model="status" placeholder="任务状态" clearable @change="load">
        <el-option v-for="item in statuses" :key="item" :label="labels[item]" :value="item"/>
      </el-select>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table :data="rows" v-loading="loading">
      <el-table-column prop="name" label="任务名称"/>
      <el-table-column prop="type" label="类型" width="100"/>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'success' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'">
            {{ labels[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="进度">
        <template #default="{ row }">
          <el-progress :percentage="row.progress"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="190">
        <template #default="{ row }">
          <el-button v-if="row.status === 'failed'" link type="primary" @click="retry(row)">查看原因 / 重试</el-button>
          <el-button v-if="['pending', 'running'].includes(row.status)" link type="danger" @click="cancel(row)">取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination layout="total,prev,pager,next" :total="total" v-model:current-page="page" @current-change="load"/>
  </div>
</template>
<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {api} from '@/api'

const labels: Record<string, string> = {
  pending: '排队中',
  running: '生成中',
  success: '成功',
  failed: '失败',
  cancelled: '已取消'
};
const statuses = Object.keys(labels);
const rows = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const status = ref('');
const loading = ref(false)

async function load() {
  loading.value = true;
  try {
    const result = await api.jobs({page: page.value, pageSize: 10, status: status.value});
    rows.value = result.data.items;
    total.value = result.data.total
  } finally {
    loading.value = false
  }
}

async function retry(row: any) {
  await ElMessageBox.confirm(`${row.error}\n\n确定重试任务吗？`, '失败原因', {confirmButtonText: '重试'});
  await api.retry(row.id);
  ElMessage.success('任务已重试，预计 3 秒后完成');
  load();
  window.setTimeout(load, 3500)
}

async function cancel(row: any) {
  await ElMessageBox.confirm('确定取消该任务？');
  await api.cancel(row.id);
  ElMessage.success('任务已取消');
  load()
}

onMounted(load)
</script>
