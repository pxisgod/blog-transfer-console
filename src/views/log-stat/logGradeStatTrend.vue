<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="日志打分统计详情"></page-head>
    <div class="filter-container">
      <el-input v-model="logStatInfo.systemCode" class="filter-item" style="width: 200px;"  :disabled="true"></el-input>
      <el-input v-model="logStatInfo.logCode" placeholder="日志编码" style="width: 200px;" class="filter-item"
                :disabled="true"></el-input>
      <el-select v-model="myTimeType" class="filter-item" placeholder="时间类型选择" @change="timeTypeChange()">
        <el-option v-for="item in timeType" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-select v-model="myStatPeriod" class="filter-item" placeholder="时间段选择" v-if="chooseTimePeriod" clearable>
        <el-option v-for="item in statPeriod" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-date-picker placeholder="开始时间" class="filter-item" type="datetime" v-model="logStatInfo.beginTime" style="width: 250px;" v-if="chooseTimeRange" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
      <el-date-picker placeholder="结束时间" class="filter-item" type="datetime" v-model="logStatInfo.endTime" style="width: 250px;" v-if="chooseTimeRange" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        搜索
      </el-button>
    </div>
    <div :id="id" class="chart-container" />
  </div>
</template>
<script>
import { getLogGradeStatTrend, getLogGradeStat } from "@/api/logStat";
import waves from "@/directive/waves"; // waves directive
import { deepClone, objectMerge } from "@/utils";
import pageHead from "@/components/PageHead";
import chartsRouter from "../../router/modules/charts";
import echarts from "echarts";

const logType = [
  {
    key: "OPLOG",
    display_name: "操作日志"
  },
  {
    key: "INTERFACELOG",
    display_name: "接口日志"
  },
  {
    key: "COMMONLOG",
    display_name: "通用日志"
  }
];
const dataType = [
  {
    key: "json",
    display_name: "JSON"
  },
  {
    key: "String",
    display_name: "STRING"
  }
];
const assuranceLevel = [
  {
    key: "DISCARDABLE",
    display_name: "丢弃"
  },
  {
    key: "FAIL_RETRY",
    display_name: "失败重试"
  },
  {
    key: "BACK_UP_ROUTE",
    display_name: "主备切换"
  }
];
const storageType = [
  {
    key: "ES_TYPE",
    display_name: "ES"
  },
  {
    key: "ORACLE_TYPE",
    display_name: "Oracle"
  },
  {
    key: "MYSQL_TYPE",
    display_name: "MySql"
  }
];
const timeType = [
  {
    key: "TIME_RANGE",
    display_name: "时间区间"
  },
  {
    key: "TIME_PERIOD",
    display_name: "时间段"
  }
];
const statPeriod = [
  {
    key: "5MINUTE",
    display_name: "5分钟"
  },
  {
    key: "60MINUTE",
    display_name: "1小时"
  },
  {
    key: "6HOUR",
    display_name: "6小时"
  },
  {
    key: "1DAY",
    display_name: "1天"
  },
  {
    key: "7DAY",
    display_name: "1周"
  },
  {
    key: "1MONTH",
    display_name: "1月"
  },
  {
    key: "3MONTH",
    display_name: "3月"
  }
];
const statType = ["日志打分"];

export default {
  name: "logGradeStatTrend",
  directives: { waves },
  components: {
    pageHead
  },
  filters: {
    logTypeFilter(type) {
      let rs = logType.find(el => type === el.key);
      return rs ? rs.display_name : type;
    },
    assuranceLevelFilter(type) {
      let rs = assuranceLevel.find(el => type === el.key);
      return rs ? rs.display_name : type;
    }
  },
  data() {
    return {
      id: "gradeTrendChart",
      chart: null,
      baseInfo: {},
      myTimeType: "TIME_PERIOD",
      myStatPeriod: "5MINUTE",
      chooseTimePeriod: true,
      chooseTimeRange: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      logStatInfo: {
        systemCode: null,
        logCode: null,
        logType: null,
        statPeriod: "",
        beginTime: "",
        endTime: "",
        statType: "STAT"
      },
      logType,
      assuranceLevel,
      storageType,
      timeType,
      statPeriod,
      statType,
      temp: {
        routeCode: "",
        routeName: "",
        logType: "",
        dataType: "",
        systemCode: "",
        assuranceLevel: "",
        retryTime: ""
      },
      dialogStatus: "",
      textMap: {
        update: "修改",
        create: "新增",
        master: "主路由",
        backup: "备用路由"
      },
      gradeList: [],
      xData: [],
      dialogFormVisible: false,
      rules: {
        routeCode: [
          { required: true, message: "路由编码不能为空!", trigger: "change" }
        ],
        routeName: [
          { required: true, message: "路由名称不能为空!", trigger: "change" }
        ],
        logType: [
          { required: true, message: "日志类型不能为空!", trigger: "change" }
        ],
        dataType: [
          { required: true, message: "数据类型不能为空!", trigger: "change" }
        ],
        assuranceLevel: [
          { required: true, message: "保障级别不能为空!", trigger: "change" }
        ],
        storageType: [
          { required: true, message: "存储类型不能为空!", trigger: "change" }
        ],
        storageId: [
          { required: true, message: "存储编码不能为空!", trigger: "change" }
        ],
        storageTableId: [
          { required: true, message: "存储表编码不能为空!", trigger: "change" }
        ]
      }
    };
  },
  created() {
    objectMerge(this.baseInfo, this.$route.params);
    this.logStatInfo.systemCode = this.baseInfo.systemCode;
    this.logStatInfo.logCode = this.baseInfo.logCode;
    this.logStatInfo.statPeriod = this.baseInfo.statPeriod;
    this.logStatInfo.statType = this.baseInfo.statType;
    this.logStatInfo.beginTime = this.baseInfo.beginTime;
    this.logStatInfo.endTime = this.baseInfo.endTime;
    this.myTimeType = this.baseInfo.timeType;
    this.myStatPeriod = this.baseInfo.statPeriod;
    this.timeTypeChange();
    this.getList();
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
      this.chart = echarts.init(document.getElementById(this.id));
      /*const xData = (function() {
          const data = [];
          for (let i = 1; i < 13; i++) {
            data.push(i + "month");
          }
          return data;
        })();*/
      this.chart.setOption({
        backgroundColor: "#344b58",
        title: {
          /*text: "日志量趋势统计",*/
          x: "20",
          top: "20",
          textStyle: {
            color: "#fff",
            fontSize: "22"
          },
          subtextStyle: {
            color: "#90979c",
            fontSize: "16"
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            textStyle: {
              color: "#fff"
            }
          }
        },
        grid: {
          left: "5%",
          right: "5%",
          borderWidth: 0,
          top: 150,
          bottom: 95,
          textStyle: {
            color: "#fff"
          }
        },
        legend: {
          x: "5%",
          top: "10%",
          textStyle: {
            color: "#90979c"
          },
          data: statType
        },
        calculable: true,
        xAxis: [
          {
            type: "category",
            axisLine: {
              lineStyle: {
                color: "#90979c"
              }
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitArea: {
              show: false
            },
            axisLabel: {
              interval: 0
            },
            data: this.xData
          }
        ],
        yAxis: [
          {
            type: "value",
            splitLine: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: "#90979c"
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              interval: 0
            },
            splitArea: {
              show: false
            }
          }
        ],
        dataZoom: [
          {
            show: true,
            height: 30,
            xAxisIndex: [0],
            bottom: 30,
            start: 10,
            end: 80,
            handleIcon:
              "path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z",
            handleSize: "110%",
            handleStyle: {
              color: "#d3dee5"
            },
            textStyle: {
              color: "#fff"
            },
            borderColor: "#90979c"
          },
          {
            type: "inside",
            show: true,
            height: 15,
            start: 1,
            end: 35
          }
        ],
        series: [
          {
            name: "日志打分",
            type: "bar",
            stack: "total",
            barMaxWidth: 35,
            barGap: "10%",
            itemStyle: {
              normal: {
                color: "rgba(255,144,128,1)",
                label: {
                  show: true,
                  textStyle: {
                    color: "#fff"
                  },
                  position: "insideTop",
                  formatter(p) {
                    return p.value > 0 ? p.value : "";
                  }
                }
              }
            },
            data: this.gradeList
          }
        ]
      });
    },
    timeTypeChange() {
      if (this.myTimeType == "TIME_PERIOD") {
        this.chooseTimePeriod = true;
        this.chooseTimeRange = false;
      } else {
        this.chooseTimePeriod = false;
        this.chooseTimeRange = true;
      }
    },
    goBack() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.go(-1);
    },
    getList() {
      this.listLoading = true;
      if (!this.chooseTimePeriod) {
        this.logStatInfo.statPeriod = "";
      } else {
        this.logStatInfo.statPeriod = this.myStatPeriod;
      }
      console.log(this.logStatInfo);
      getLogGradeStatTrend(this.logStatInfo).then(response => {
        if (response.data) {
          this.list = response.data;
          this.gradeList = [];
          this.xData = [];
          for (var index in this.list) {
            this.gradeList.push(this.list[index].avgGrade);
            this.xData.push(this.list[index].timeRange);
          }
        }
        this.listLoading = false;
        this.initChart();
      });
    }
  }
};
</script>


<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 300px);
}
</style>
