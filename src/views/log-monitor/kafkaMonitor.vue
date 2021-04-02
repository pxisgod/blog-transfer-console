<template>
  <vp-row class="app-container" :gutter="32">
    <vp-col :xs="24" :sm="24" :lg="6">
      <vp-card class="box-card">
        <div slot="header" class="clearfix">
          <span style="line-height:36px;">kafka偏移量</span>
        </div>
        <vp-card class="box-card" shadow="never" v-for="(item,i) in offset" :key="i">
          <h4 style="color:#409EFF;margin-block-start: 0px;margin-block-end:0px;">分区{{item.partition}}</h4>
          <div class="list" style="line-height:26px;">
            <div><i class="list-point bg-green"></i>committedOffsets:{{item.committedOffsets}}</div>
            <div><i class="list-point bg-blue"></i>currentOffsets:{{item.currentOffsets}}</div>
            <div><i class="list-point bg-orange"></i>latestOffsets:{{item.latestOffsets}}</div>
            <div><i class="list-point bg-red"></i>lag:{{item.lag}}</div>
          </div>
        </vp-card>
      </vp-card>
    </vp-col>
    <vp-col :xs="24" :sm="24" :lg="18">
      <vp-card class="box-card">
        <div slot="header" class="clearfix">
          <span style="line-height:36px;">Kafka处理速度变化曲线</span>
          <vp-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="float: right;">
          </vp-date-picker>
          <vp-select v-model="period" class="filter-item" placeholder="" clearable>
            <vp-option v-for="item in periodType" :key="item.key" :label="item.display_name" :value="item.key" />
          </vp-select>
        </div>
        <div class="chart-wrapper">
          <lineChart :chartData="trendData"></lineChart>
        </div>
      </vp-card>
    </vp-col>
  </vp-row>
</template>

<script>
import lineChart from "./lineChart";
import { getOffset, getOffsetTrend } from "@/api/kafkaMonitor";
import { parseTime } from "@/utils";

const periodType = [
  {
    key: "MINUTE",
    display_name: "1分钟"
  },
  {
    key: "TENMINUTE",
    display_name: "10分钟"
  },
  {
    key: "HOUR",
    display_name: "1小时"
  },
  {
    key: "DAY",
    display_name: "1天"
  },
  {
    key: "WEEK",
    display_name: "1周"
  },
  {
    key: "MONTH",
    display_name: "1月"
  },
  {
    key: "QUARTER",
    display_name: "1季度"
  },
  {
    key: "YEAR",
    display_name: "1年"
  }
];

export default {
  components: { lineChart },
  data() {
    return {
      periodType,
      period: "DAY",
      dateRange: [this.getXDayDate(-7), new Date()],
      trendData: {
        currentOffset: [],
        committedOffset: [],
        latestOffset: [],
        timeRange: []
      },
      offset: [],
      pagetimeout: null
    };
  },
  watch: {
    dateRange() {
      this.getOffsetTrend();
    },
    period() {
      this.getOffsetTrend();
    }
  },
  created() {
    this.getOffsetTrend();
    this.getOffset();
  },
  methods: {
    getOffsetTrend() {
      let data = {
        beginTime: parseTime(this.dateRange[0]),
        endTime: parseTime(this.dateRange[1]),
        period: this.period
      };
      getOffsetTrend(data).then(rs => {
        this.trendData = rs.data;
      });
    },
    getOffset() {
      getOffset().then(rs => {
        this.offset = rs.data;
        this.pagetimeout = setTimeout(() => {
          this.getOffset();
        }, 5000);
      });
    },
    getXDayDate(x) {
      return new Date().setTime(new Date().getTime() + 1000 * 60 * 60 * 24 * x);
    },
    beforeDestroy() {
      clearTimeout(this.pagetimeout);
    }
  }
};
</script>

<style scoped>
.list-point {
  display: inline-block;
  margin-right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.bg-red {
  background-color: #f56c6c;
}
.bg-green {
  background-color: #67c23a;
}
.bg-blue {
  background-color: #409eff;
}
.bg-orange {
  background-color: #e6a23c;
}
</style>
