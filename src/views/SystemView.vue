<template>
  <div class="page-title">
    <div><h2>系统运营</h2>
      <p class="muted">服务健康、操作审计与演示环境管理</p></div>
    <el-button type="danger" plain @click="reset">恢复演示数据</el-button>
  </div>
  <div class="cards">
    <div v-for="item in health" :key="item.name" class="card"><span class="kpi-label">{{ item.name }}</span>
      <div class="kpi-value" style="font-size:22px"><i
          class="status-dot"></i>{{ item.status === 'healthy' ? '运行正常' : '需要关注' }}
      </div>
      <span class="muted">延迟 {{ item.latency }}</span></div>
  </div>
  <div class="panel" style="margin-top:16px"><h3>操作日志</h3>
    <el-table :data="logs">
      <el-table-column prop="createdAt" label="时间" width="210"/>
      <el-table-column prop="operator" label="操作人" width="190"/>
      <el-table-column prop="action" label="操作内容"/>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {api} from '@/api'

const health = ref<any[]>([]);
const logs = ref<any[]>([])

async function load() {
  health.value = (await api.health()).data;
  logs.value = (await api.logs()).data
}

async function reset() {
  await ElMessageBox.confirm('将清空所有演示操作并恢复初始数据，确定继续？', '恢复演示数据', {type: 'warning'});
  await api.reset();
  ElMessage.success('演示数据已恢复');
  load()
}

onMounted(load)
</script>
