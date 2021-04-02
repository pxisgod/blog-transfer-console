<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";
import { typeRatio } from "@/api/logStat";

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
      chartYData: [],
      isLoading: true
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
      typeRatio().then(response => {
        var logTypeList = response.data;
        this.chartYData = [];
        if (logTypeList["COMMONLOG"] != null) {
          this.chartYData.push({
            value: logTypeList["COMMONLOG"],
            name: "通用日志"
          });
        } else {
          this.chartYData.push({ value: 0, name: "通用日志" });
        }
        if (logTypeList["INTERFACELOG"] != null) {
          this.chartYData.push({
            value: logTypeList["INTERFACELOG"],
            name: "接口日志"
          });
        } else {
          this.chartYData.push({ value: 0, name: "接口日志" });
        }
        if (logTypeList["OPLOG"] != null) {
          this.chartYData.push({
            value: logTypeList["OPLOG"],
            name: "操作日志"
          });
        } else {
          this.chartYData.push({ value: 0, name: "操作日志" });
        }
        this.chart = echarts.init(this.$el, "macarons");
        this.chart.setOption({
          tooltip: {
            trigger: "item",
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            left: "center",
            bottom: "10",
            data: ["通用日志", "接口日志", "操作日志"]
          },
          series: [
            {
              name: "日志类型占比",
              type: "pie",
              roseType: "radius",
              radius: [15, 95],
              center: ["50%", "38%"],
              data: this.chartYData,
              animationEasing: "cubicInOut",
              animationDuration: 2600
            }
          ]
        });
      });
    }
  }
};
</script>
