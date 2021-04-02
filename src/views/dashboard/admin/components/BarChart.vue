<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";
import { dateQuantity } from "@/api/logStat";
const animationDuration = 6000;

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "300px"
    }
  },
  data() {
    return {
      chart: null,
      successList: [],
      filterList: [],
      errList: []
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      dateQuantity().then(response => {
        this.successList = response.data.success;
        this.errList = response.data.fail;
        this.filterList = response.data.filter;
        this.chart = echarts.init(this.$el, "macarons");

        this.chart.setOption({
          tooltip: {
            trigger: "axis",
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          grid: {
            top: 10,
            left: "2%",
            right: "2%",
            bottom: "3%",
            containLabel: true
          },
          xAxis: [
            {
              type: "category",
              data: this.getWeekDay(),
              axisTick: {
                alignWithLabel: true
              }
            }
          ],
          yAxis: [
            {
              type: "value",
              axisTick: {
                show: false
              }
            }
          ],
          series: [
            {
              name: "成功",
              type: "bar",
              stack: "vistors",
              barWidth: "60%",
              data: this.successList,
              animationDuration
            },
            {
              name: "失败",
              type: "bar",
              stack: "vistors",
              barWidth: "60%",
              data: this.errList,
              animationDuration
            },
            {
              name: "过滤",
              type: "bar",
              stack: "vistors",
              barWidth: "60%",
              data: this.filterList,
              animationDuration
            }
          ]
        });
      });
    },
    getWeekDay() {
      let i = 6;
      let now = new Date();
      let rs = [];
      while (i >= 0) {
        let date = new Date(now);
        date.setDate(now.getDate() - i);
        rs.push(date.toLocaleDateString());
        i--;
      }
      return rs;
    }
  }
};
</script>
