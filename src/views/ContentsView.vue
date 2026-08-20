<template>
  <div class="page-title"><h2>内容审核</h2></div>
  <div class="panel">
    <div class="toolbar">
      <el-select v-model="status" placeholder="审核状态" clearable @change="load">
        <el-option label="待审核" value="pending"/>
        <el-option label="已通过" value="approved"/>
        <el-option label="已驳回" value="rejected"/>
        <el-option label="已下架" value="offline"/>
      </el-select>
    </div>
    <el-table :data="rows" v-loading="loading">
      <el-table-column prop="title" label="内容标题"/>
      <el-table-column prop="type" label="类型" width="100"/>
      <el-table-column prop="author" label="作者"/>
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag>{{ labels[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-if="row.status === 'pending'" link type="success" @click="review(row, 'approved')">通过
          </el-button>
          <el-button v-if="row.status === 'pending'" link type="danger" @click="review(row, 'rejected')">驳回
          </el-button>
          <el-button v-if="row.status === 'approved'" link @click="review(row, 'offline')">下架</el-button>
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

const labels: Record<string, string> = {pending: '待审核', approved: '已通过', rejected: '已驳回', offline: '已下架'};
const rows = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const status = ref('');
const loading = ref(false)

async function load() {
  loading.value = true;
  try {
    const result = await api.contents({page: page.value, pageSize: 10, status: status.value});
    rows.value = result.data.items;
    total.value = result.data.total
  } finally {
    loading.value = false
  }
}

async function review(row: any, nextStatus: string) {
  await ElMessageBox.confirm(`确认${labels[nextStatus]}「${row.title}」？`);
  await api.review(row.id, nextStatus);
  ElMessage.success('审核操作成功');
  load()
}

onMounted(load)
</script>
