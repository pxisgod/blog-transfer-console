<template>
  <div class="app-container">
    <div class="filter-container">
      <system-select v-model="listQuery.logStatInfo.systemCode" class="filter-item"></system-select>
      <el-input clearable v-model="listQuery.logStatInfo.logCode" placeholder="日志编码" style="width: 200px;" class="filter-item"></el-input>
      <el-select v-model="listQuery.logStatInfo.logType" class="filter-item" placeholder="日志类型" clearable>
        <el-option v-for="item in logType" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="myTimeType" class="filter-item" placeholder="时间类型选择" @change="timeTypeChange()">
        <el-option v-for="item in timeType" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select  v-model="myStatPeriod" class="filter-item" placeholder="时间段选择" v-if="chooseTimePeriod" clearable >
        <el-option v-for="item in statPeriod" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-date-picker placeholder="开始时间" class="filter-item" type="datetime" v-model="listQuery.logStatInfo.beginTime" style="width: 250px;" v-if="chooseTimeRange" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
      <el-date-picker placeholder="结束时间" class="filter-item" type="datetime" v-model="listQuery.logStatInfo.endTime" style="width: 250px;" v-if="chooseTimeRange" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleQuery">
        搜索
      </el-button>
    </div>
    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <el-table-column label="中心编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.systemCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="中心名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.systemName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日志类型">
        <template slot-scope="{row}">
          <span>{{row.logType | logTypeFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column label="日志编码">
        <template slot-scope="{row}">
          <el-tag>{{ row.logCode }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="日志总量" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.logNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过滤量">
        <template slot-scope="scope">
          <a>{{ scope.row.filterNum }}</a>
        </template>
      </el-table-column>
      <el-table-column label="失败量">
        <template slot-scope="scope">
          <a>{{ scope.row.errNum }}</a>
        </template>
      </el-table-column>
      <el-table-column label="成功量">
        <template slot-scope="scope">
          <a>{{ scope.row.successNum }}</a>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageRequest.page" :limit.sync="listQuery.pageRequest.size" @pagination="getList" />
  </div>
</template>

<script>
import { getLogStat, getLogStatTrend } from "@/api/logStat";
import waves from "@/directive/waves"; // waves directive
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import Layout from "@/layout";
import RemoteSelect from "@/components/RemoteSelect";
import systemSelect from "../log-system/systemSelect";
import { deepClone, objectMerge } from "@/utils";

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

export default {
  name: "logStat",
  components: { Pagination, RemoteSelect, systemSelect },
  directives: { waves },
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
      myTimeType: "TIME_PERIOD",
      myStatPeriod: "5MINUTE",
      chooseTimePeriod: true,
      chooseTimeRange: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        logStatInfo: {
          systemCode: null,
          logCode: null,
          logType: null,
          statPeriod: "",
          beginTime: "",
          endTime: "",
          statType: "STAT"
        },
        pageRequest: {
          page: 1,
          pageNumber: 0,
          size: 10
        }
      },
      logType,
      assuranceLevel,
      storageType,
      timeType,
      statPeriod,
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
      trendParam: {},
      textMap: {
        update: "修改",
        create: "新增",
        master: "主路由",
        backup: "备用路由"
      },
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
    this.getList();
    // 添加子页面路由
    this.$router.addRoutes([
      {
        path: "/log-stat",
        component: Layout,
        children: [
          {
            path: "logStatTrend",
            component: () => import("@/views/log-stat/logStatTrend"),
            name: "logStatTrend",
            meta: { title: "日志统计详情", affix: false },
            props: true
          }
        ]
      }
    ]);
  },
  methods: {
    timeTypeChange() {
      if (this.myTimeType == "TIME_PERIOD") {
        this.chooseTimePeriod = true;
        this.chooseTimeRange = false;
      } else {
        this.chooseTimePeriod = false;
        this.chooseTimeRange = true;
      }
    },
    getList() {
      this.listLoading = true;
      if (!this.chooseTimePeriod) {
        this.listQuery.logStatInfo.statPeriod = "";
      } else {
        this.listQuery.logStatInfo.statPeriod = this.myStatPeriod;
      }
      console.log(this.listQuery);
      getLogStat(this.listQuery).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },
    handleQuery() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleDetail(row) {
      objectMerge(this.trendParam, row);
      if (!this.chooseTimePeriod) {
        this.trendParam.statPeriod = "";
      } else {
        this.trendParam.statPeriod = this.myStatPeriod;
      }
      this.trendParam.statType = this.listQuery.logStatInfo.statType;
      this.trendParam.beginTime = this.listQuery.logStatInfo.beginTime;
      this.trendParam.endTime = this.listQuery.logStatInfo.endTime;
      this.trendParam.statPeriod = this.myStatPeriod;
      this.trendParam.timeType = this.myTimeType;
      this.$router.push({
        name: "logStatTrend",
        params: this.trendParam
      });
    }
  }
};
</script>

<style>
.el-button.el-button--primary.el-button--mini.el-dropdown__caret-button {
  width: auto;
}
</style>
