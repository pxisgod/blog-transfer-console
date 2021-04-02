<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "../dashboard/admin/components/mixins/resize";

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
      default: "350px"
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val);
      }
    }
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
      this.chart = echarts.init(this.$el, "macarons");
      this.setOptions(this.chartData);
    },
    setOptions(data) {
      this.chart.setOption({
        xAxis: {
          data: data.timeRange,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ["currentOffset", "committedOffset", "latestOffset"]
        },
        series: [
          {
            name: "currentOffset",
            itemStyle: {
              normal: {
                // color: "#3888fa",
                lineStyle: {
                  // color: "#409eff",
                  width: 2
                }
              }
            },
            smooth: true,
            type: "line",
            data: data.currentOffset,
            animationDuration: 2800,
            animationEasing: "cubicInOut"
          },
          {
            name: "committedOffset",
            smooth: true,
            type: "line",
            itemStyle: {
              normal: {
                // color: "#3888fa",
                lineStyle: {
                  color: "#3888fa",
                  width: 2
                },
                areaStyle: {
                  color: "#f3f8ff"
                }
              }
            },
            data: data.committedOffset,
            animationDuration: 2800,
            animationEasing: "quadraticOut"
          },
          {
            name: "latestOffset",
            smooth: true,
            type: "line",
            itemStyle: {
              normal: {
                // color: "#3888fa",
                lineStyle: {
                  // color: "#3888fa",
                  width: 2
                }
                // areaStyle: {
                //   color: "#f3f8ff"
                // }
              }
            },
            data: data.latestOffset,
            animationDuration: 2800,
            animationEasing: "quadraticOut"
          }
        ]
      });
    },
    getWeekDay() {
      let i = 7;
      let now = new Date();
      let rs = [];
      while (i) {
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
