<template>
  <div class="page-title">
    <div><h2>运营总览</h2>
      <p class="muted">实时掌握平台经营与 AI 生成效率</p></div>
    <el-button type="primary" @click="load">刷新数据</el-button>
  </div>
  <div class="cards">
    <div v-for="k in data?.kpis" :key="k.label" class="card"><span class="kpi-label">{{ k.label }}</span>
      <div class="kpi-value">{{ k.value }}</div>
      <span class="trend">{{ k.trend }}</span></div>
  </div>
  <div class="grid2">
    <div class="panel"><h3>近 7 日任务趋势</h3>
      <div ref="chart" style="height:270px"></div>
    </div>
    <div class="panel"><h3>任务状态分布</h3>
      <div ref="pie" style="height:270px"></div>
    </div>
  </div>
  <div class="panel" style="margin-top:16px"><h3>待处理事项</h3>
    <el-table :data="data?.pending" stripe>
      <el-table-column prop="title" label="内容"/>
      <el-table-column prop="type" label="类型" width="120"/>
      <el-table-column prop="author" label="提交人"/>
      <el-table-column label="状态" width="120">
        <template #default>
          <el-tag type="warning">待审核</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import {nextTick, onMounted, ref} from 'vue'
import * as echarts from 'echarts'
import {api} from '@/api'

const data = ref<any>();
const chart = ref<HTMLElement>();
const pie = ref<HTMLElement>()

async function load() {
  data.value = (await api.dashboard()).data;
  await nextTick();
  const line = echarts.init(chart.value!);
  line.setOption({
    color: ['#6259d9'],
    tooltip: {trigger: 'axis'},
    xAxis: {type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']},
    yAxis: {type: 'value'},
    series: [{type: 'line', smooth: true, areaStyle: {opacity: .12}, data: data.value.trend}]
  });
  const ring = echarts.init(pie.value!);
  ring.setOption({
    color: ['#6259d9', '#36b37e', '#ef6b73'],
    tooltip: {trigger: 'item'},
    series: [{type: 'pie', radius: ['50%', '72%'], data: data.value.distribution}]
  })
}

onMounted(load)
</script>
