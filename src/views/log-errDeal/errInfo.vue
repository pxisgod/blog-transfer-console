<template>
  <div class="app-container">
    <div class="filter-container">
      <system-select v-model="listQuery.logStatInfo.systemCode" class="filter-item"></system-select>
      <vp-input clearable v-model="listQuery.logStatInfo.logCode" placeholder="日志编码" style="width: 200px;" class="filter-item"></vp-input>
      <vp-select v-model="listQuery.logStatInfo.logType" class="filter-item" placeholder="日志类型" clearable>
        <vp-option v-for="item in logType" :key="item.key" :label="item.display_name" :value="item.key" />
      </vp-select>
      <vp-select v-model="myTimeType" class="filter-item" placeholder="时间类型选择" @change="timeTypeChange()">
        <vp-option v-for="item in timeType" :key="item.key" :label="item.display_name" :value="item.key" />
      </vp-select>
      <vp-select  v-model="myStatPeriod" class="filter-item" placeholder="时间段选择" v-if="chooseTimePeriod" clearable >
        <vp-option v-for="item in statPeriod" :key="item.key" :label="item.display_name" :value="item.key" />
      </vp-select>
      <vp-date-picker placeholder="开始时间" class="filter-item" type="datetime" v-model="listQuery.logStatInfo.beginTime" style="width: 250px;" v-if="chooseTimeRange" value-format="yyyy-MM-dd HH:mm:ss"></vp-date-picker>
      <vp-date-picker placeholder="结束时间" class="filter-item" type="datetime" v-model="listQuery.logStatInfo.endTime" style="width: 250px;" v-if="chooseTimeRange" value-format="yyyy-MM-dd HH:mm:ss"></vp-date-picker>
      <vp-button v-waves class="filter-item" type="primary" icon="vp-icon-search" @click="handleQuery">
        搜索
      </vp-button>
    </div>
    <vp-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <vp-table-column label="日志ID" align="center" width="300px">
        <template slot-scope="scope">
          <span>{{ scope.row.logInfoId }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="中心编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.systemCode}}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="中心名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.systemName }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="日志类型">
        <template slot-scope="{row}">
          <span>{{ row.logType | logTypeFilter }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="日志编码">
        <template slot-scope="{row}">
          <vp-tag>{{ row.logCode }}</vp-tag>
        </template>
      </vp-table-column>
      <vp-table-column label="服务名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.serverName }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="IP" width="100px">
        <template slot-scope="scope">
          <a>{{ scope.row.ip }}</a>
        </template>
      </vp-table-column>
      <vp-table-column label="异常位置">
        <template slot-scope="scope">
          <a>{{ scope.row.errPos |errPosTypeFilter }}</a>
        </template>
      </vp-table-column>
      <!--<vp-table-column label="异常类名" width="150px">
        <template slot-scope="scope">
          <a>{{ scope.row.errClass }}</a>
        </template>
      </vp-table-column>-->
      <vp-table-column label="时间" width="160px">
        <template slot-scope="scope">
          <a>{{ scope.row.sendTime |formatDate}}</a>
        </template>
      </vp-table-column>
      <vp-table-column label="处理状态">
        <template slot-scope="scope">
          <a>{{ scope.row.dealState|dealStatTypeFilter }}</a>
        </template>
      </vp-table-column>
      <vp-table-column label="操作" align="center" width="280px" class-name="small-padding fixed-width" v-if="roles.includes('admin')">
        <template slot-scope="{row}">
          <vp-popover
            placement="bottom"
            width="1000"
            trigger="click">
            <vp-button type="primary" size="mini" slot="reference">异常堆栈</vp-button>
            <span>异常类:</span><br>
            <span>{{row.errClass}}</span><br><br>
            <span>异常堆栈:</span><br>
            <span>{{row.errMsg}}</span>
          </vp-popover>
          <vp-button type="primary" size="mini" @click="handleDeal(row)" v-if="row.dealState==0">
            失败处理
          </vp-button>
        </template>
      </vp-table-column>
    </vp-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageRequest.page" :limit.sync="listQuery.pageRequest.size" @pagination="getList" />
  </div>
</template>

<script>
import { getErrInfo, updateStateToWaitDealSingle } from "@/api/logErrDeal";
import { formatDate } from "@/utils/date";
import waves from "@/directive/waves"; // waves directive
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import Layout from "@/layout";
import RemoteSelect from "@/components/RemoteSelect";
import systemSelect from "../log-system/systemSelect";
import { deepClone, objectMerge } from "@/utils";
import { mapGetters } from "vuex";

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
const errPosType = [
  {
    key: "MAPPER_ERR",
    display_name: "映射异常"
  },
  {
    key: "VERIFY_ERR",
    display_name: "验证异常"
  },
  {
    key: "SINK_ERR",
    display_name: "存储异常"
  }
];
const dealStatType = [
  {
    key: 0,
    display_name: "处理失败"
  },
  {
    key: 1,
    display_name: "待处理"
  },
  {
    key: 2,
    display_name: "处理中"
  },
  {
    key: 3,
    display_name: "处理成功"
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
  name: "errInfo",
  components: { Pagination, RemoteSelect, systemSelect },
  directives: { waves },
  filters: {
    formatDate(time) {
      var timestamp = Number(time);
      let date = new Date(timestamp);
      return formatDate(date, "yyyy-MM-dd hh:mm:ss");
    },
    logTypeFilter(type) {
      let rs = logType.find(el => type === el.key);
      return rs ? rs.display_name : type;
    },
    errPosTypeFilter(type) {
      let rs = errPosType.find(el => type === el.key);
      return rs ? rs.display_name : type;
    },
    assuranceLevelFilter(type) {
      let rs = assuranceLevel.find(el => type === el.key);
      return rs ? rs.display_name : type;
    },
    dealStatTypeFilter(type) {
      let rs = dealStatType.find(el => type === el.key);
      return rs ? rs.display_name : type;
    }
  },
  computed: {
    ...mapGetters(["roles"])
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
      drawer: false,
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
    /* this.$router.addRoutes([
      {
        path: "/log-stat-center",
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
    ]);*/
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
      getErrInfo(this.listQuery).then(response => {
        this.list = response.data.items;
        this.total = response.data.totalItemsCount;
        this.listLoading = false;
      });
    },
    handleQuery() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleDeal(row) {
      updateStateToWaitDealSingle(row).then(() => {
        this.$message({
          type: "success",
          message: "修改状态为待处理成功"
        });
      });
    },
    handleShow(row) {
      this.drawer = true;
    }
  }
};
</script>

<style>
.vp-button.vp-button--primary.vp-button--mini.vp-dropdown__caret-button {
  width: auto;
}
</style>
