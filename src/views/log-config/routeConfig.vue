<template>
  <div class="app-container">
    <div class="filter-container">
      <system-select v-model="listQuery.logInfo.systemCode" @keyup.enter.native="handleQuery" class="filter-item"></system-select>

      <vp-select v-model="listQuery.logInfo.logType" class="filter-item" placeholder="日志类型" clearable>
        <vp-option v-for="item in logType" :key="item.key" :label="item.display_name" :value="item.key" />
      </vp-select>
      <vp-select v-model="listQuery.logInfo.dataType" class="filter-item" placeholder="操作类型" clearable>
        <vp-option v-for="item in dataType" :key="item.key" :label="item.display_name" :value="item.key" />
      </vp-select>
      <vp-button v-waves class="filter-item" type="primary" icon="vp-icon-search" @click="handleQuery">
        搜索
      </vp-button>
      <vp-button class="filter-item" v-if="roles.includes('admin')" style="margin-left: 10px;" type="primary" icon="vp-icon-edit" @click="handleCreate">
        添加路由
      </vp-button>
      <vp-button class="filter-item" v-if="roles.includes('admin')" style="margin-right: 0px;" type="primary" icon="vp-icon-phone" @click="flushCache" >
        同步缓存
      </vp-button>
      <vp-button class="filter-item" style="margin-right: 0px;" type="primary" icon="vp-icon-phone" @click="goFlushCacheState">
        同步缓存状态
      </vp-button>

    </div>

    <vp-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row>
      <vp-table-column label="路由ID" align="center" width="80px">
        <template slot-scope="scope">
          <span>{{ scope.row.routeId}}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="日志编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.logCode }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="日志名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.logName }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="中心编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.systemCode }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="日志类型">
        <template slot-scope="{row}">
          <vp-tag>{{ row.logType | logTypeFilter }}</vp-tag>
        </template>
      </vp-table-column>
      <vp-table-column label="数据类型">
        <template slot-scope="{row}">
          <vp-tag>{{ row.dataType | dataTypeFilter }}</vp-tag>
        </template>
      </vp-table-column>
      <vp-table-column label="存储类型">
        <template slot-scope="scope">
          <a>{{ scope.row.storageType| storageTypeFilter }}</a>
        </template>
      </vp-table-column>
      <vp-table-column label="保障级别">
        <template slot-scope="scope">
          <span>{{ scope.row.assuranceLevel | assuranceLevelFilter }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="重试次数">
        <template slot-scope="scope">
          <a>{{ scope.row.retryTime }}</a>
        </template>
      </vp-table-column>
      <vp-table-column label="启用状态">
        <template slot-scope="scope">
          <span>{{ scope.row.state | stateTypeFilter }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <vp-button v-if="roles.includes('admin')" type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </vp-button>
          <vp-button v-else type="primary" size="mini" @click="handleView(row)">
            查看
          </vp-button>
          <vp-button size="mini" type="danger" @click="handleDelete(row)" v-if="roles.includes('admin')">
            删除
          </vp-button>
          <vp-dropdown size="mini" type="primary" style="margin-left:10px;">
            <vp-button type="primary" size="mini">
              更多
            </vp-button>
            <vp-dropdown-menu slot="dropdown">
              <vp-dropdown-item @click.native="handleDb(row)">库配置</vp-dropdown-item>
              <vp-dropdown-item @click.native="handleTable(row)">表配置</vp-dropdown-item>
              <vp-dropdown-item @click.native="handleBeforeFilter(row)">前置过滤</vp-dropdown-item>
              <vp-dropdown-item @click.native="handleMapper(row)">映射配置</vp-dropdown-item>
              <vp-dropdown-item @click.native="handleAfterFilter(row)">后置过滤</vp-dropdown-item>
              <vp-dropdown-item @click.native="handleVerify(row)">打分配置</vp-dropdown-item>
              <vp-dropdown-item @click.native="handleDistribute(row)">分发配置</vp-dropdown-item>
            </vp-dropdown-menu>
          </vp-dropdown>
        </template>
      </vp-table-column>
    </vp-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageRequest.page" :limit.sync="listQuery.pageRequest.size" @pagination="getList" />

    <vp-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <vp-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="120px" style="width: 400px; margin-left:50px;">
        <vp-form-item label="日志编码" prop="routeCode">
          <vp-input v-if="dialogStatus==='create'" v-model="temp.logCode" />
          <vp-input v-else v-model="temp.logCode" disabled />
        </vp-form-item>
        <vp-form-item v-if="dialogStatus !='view'" label="日志名称" prop="routeName">
          <vp-input v-model="temp.logName" />
        </vp-form-item>
        <vp-form-item v-else label="日志名称" prop="routeName">
          <vp-input v-model="temp.logName" disabled/>
        </vp-form-item>
        <vp-form-item label="中心编码" prop="systemCode">
          <system-select v-if="dialogStatus==='create'" v-model="temp.systemCode"></system-select>
          <system-select v-else v-model="temp.systemCode" disabled></system-select>
        </vp-form-item>
        <vp-form-item label="日志类型" prop="logType" v-if="dialogStatus !='view'">
          <vp-select v-model="temp.logType" class="filter-item" placeholder="Please select">
            <vp-option v-for="item in logType" :key="item.key" :label="item.display_name" :value="item.key" />
          </vp-select>
        </vp-form-item>
        <vp-form-item label="日志类型" prop="logType" v-else>
          <vp-input :value="temp.logType|logTypeFilter" disabled></vp-input>
        </vp-form-item>
        <vp-form-item label="数据类型" prop="dataType">
          <vp-select v-model="temp.dataType" class="filter-item" placeholder="Please select">
            <vp-option v-for="item in dataType" :key="item.key" :label="item.display_name" :value="item.key" />
          </vp-select>
        </vp-form-item>
        <vp-form-item label="存储类型" prop="storageType" v-if="dialogStatus !='view'">
          <vp-select v-model="temp.storageType" class="filter-item" placeholder="Please select">
            <vp-option v-for="item in storageType" :key="item.key" :label="item.display_name" :value="item.key" />
          </vp-select>
        </vp-form-item>
        <vp-form-item label="存储类型" prop="storageType" v-else>
          <vp-input :value="temp.storageType|storageTypeFilter" disabled></vp-input>
        </vp-form-item>
        <vp-form-item label="保障级别" prop="assuranceLevel" v-if="dialogStatus !='view'">
          <vp-select v-model="temp.assuranceLevel" class="filter-item" placeholder="Please select">
            <vp-option v-for="item in assuranceLevel" :key="item.key" :label="item.display_name" :value="item.key" />
          </vp-select>
        </vp-form-item>
        <vp-form-item label="保障级别" prop="assuranceLevel" v-else>
           <vp-input :value="temp.assuranceLevel|assuranceLevelFilter" disabled></vp-input>
        </vp-form-item>
        <vp-form-item label="重试次数" prop="retryTime" v-if="temp.assuranceLevel!=='DISCARDABLE'">
          <vp-select v-model="temp.retryTime" class="filter-item" placeholder="Please select" v-if="dialogStatus !='view'">
            <vp-option :label="1" :value="1" />
            <vp-option :label="2" :value="2" />
            <vp-option :label="3" :value="3" />
            <vp-option :label="4" :value="4" />
            <vp-option :label="5" :value="5" />
          </vp-select>
          <vp-select v-model="temp.retryTime" class="filter-item" placeholder="Please select" v-else disabled>
            <vp-option :label="1" :value="1" />
            <vp-option :label="2" :value="2" />
            <vp-option :label="3" :value="3" />
            <vp-option :label="4" :value="4" />
            <vp-option :label="5" :value="5" />
          </vp-select>
        </vp-form-item>
        <vp-form-item label="启用">
          <vp-select v-model="temp.state" class="filter-item" placeholder="Please select" v-if="dialogStatus !='view'">
            <vp-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key" />
          </vp-select>
          <vp-select v-model="temp.state" class="filter-item" placeholder="Please select" v-else disabled>
            <vp-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key" />
          </vp-select>
        </vp-form-item>
      </vp-form>
      <div slot="footer" class="dialog-footer">
        <vp-button @click="dialogFormVisible = false">
          取消
        </vp-button>
        <vp-button type="primary" @click="saveData" v-if="dialogStatus !='view'">
          保存
        </vp-button>
      </div>
    </vp-dialog>
  </div>
</template>

<script>
import {
  fetchList,
  saveRoute,
  delRoute,
  flushCache,
  getRouteInfo,
  saveRouteInfo,
  getStorageList,
  getStorageTableList
} from "@/api/routeConfig";
import waves from "@/directive/waves"; // waves directive
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import Layout from "@/layout";
import RemoteSelect from "@/components/RemoteSelect";
import systemSelect from "../log-system/systemSelect";
import { mapGetters } from "vuex";
const stateType = [
  {
    key: "E",
    display_name: "是"
  },
  {
    key: "D",
    display_name: "否"
  }
];
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
  },
  {
    key: "HBASE_TYPE",
    display_name: "HBase"
  },
  {
    key: "ANTDB_TYPE",
    display_name: "AntDB"
  }
];

export default {
  name: "routeConfig",
  components: { Pagination, RemoteSelect, systemSelect },
  directives: { waves },
  filters: {
    logTypeFilter(type) {
      let rs = logType.find(el => type === el.key);
      return rs ? rs.display_name : type;
    },
    dataTypeFilter(type) {
      let rs = dataType.find(el => type === el.key);
      return rs ? rs.display_name : type;
    },
    assuranceLevelFilter(type) {
      let rs = assuranceLevel.find(el => type === el.key);
      return rs ? rs.display_name : type;
    },
    storageTypeFilter(type) {
      let rs = storageType.find(el => type === el.key);
      return rs ? rs.display_name : type;
    },
    stateTypeFilter(type) {
      let rs = stateType.find(el => type === el.key);
      return rs ? rs.display_name : type;
    }
  },
  computed: {
    ...mapGetters(["roles"])
  },
  data() {
    return {
      stateType,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        logInfo: {
          systemCode: "",
          logType: "",
          operatorType: ""
        },
        pageRequest: {
          page: 1,
          pageNumber: 0,
          size: 10
        }
      },
      logType,
      dataType,
      assuranceLevel,
      storageType,
      temp: {
        logCode: "",
        logName: "",
        systemCode: "",
        logType: "",
        dataType: "",
        storageType: "",
        assuranceLevel: "",
        retryTime: "",
        version: 0
      },
      dialogStatus: "",
      textMap: {
        update: "修改",
        create: "新增",
        view: "查看"
      },
      dialogFormVisible: false,
      rules: {
        logCode: [
          { required: true, message: "日志编码不能为空!", trigger: "change" }
        ],
        logName: [
          { required: true, message: "日志名称不能为空!", trigger: "change" }
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
        ]
      }
    };
  },
  created() {
    this.getList();
    // 添加子页面路由
    this.$router.addRoutes([
      {
        path: "/log-center",
        component: Layout,
        children: [
          {
            path: "logBeforeFilter",
            component: () => import("@/views/log-config/logBeforeFilter"),
            name: "logBeforeFilter",
            meta: { title: "路由前置过滤配置", affix: false },
            props: true
          },
          {
            path: "logMapper",
            component: () => import("@/views/log-config/logMapper"),
            name: "logMapper",
            meta: { title: "路由映射配置", affix: false },
            props: true
          },
          {
            path: "logAfterFilter",
            component: () => import("@/views/log-config/logAfterFilter"),
            name: "logAfterFilter",
            meta: { title: "路由后置过滤配置", affix: false },
            props: true
          },
          {
            path: "logGrade",
            component: () => import("@/views/log-config/logGrade"),
            name: "logGrade",
            meta: { title: "路由验证配置", affix: false },
            props: true
          },
          {
            path: "logDb",
            component: () => import("@/views/log-config/logDb"),
            name: "logDb",
            meta: { title: "路由分表配置", affix: false },
            props: true
          },
          {
            path: "logTable",
            component: () => import("@/views/log-config/logTable"),
            name: "logTable",
            meta: { title: "路由表字段配置", affix: false },
            props: true
          },
          {
            path: "flushState",
            component: () => import("@/views/log-config/flushState"),
            name: "flushState",
            meta: { title: "同步刷新状态", affix: false },
            props: true
          },
          {
            path: "logDistribute",
            component: () => import("@/views/log-config/logDistribute"),
            name: "logDistribute",
            meta: { title: "路由分发配置", affix: false },
            props: true
          }
        ]
      }
    ]);
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    resetTemp() {
      this.temp = {
        logCode: "",
        logName: "",
        systemCode: "",
        logType: "",
        dataType: "",
        storageType: "",
        assuranceLevel: "",
        retryTime: "",
        state: "E",
        version: 0
      };
    },
    saveData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          if (["create", "update"].includes(this.dialogStatus)) {
            saveRoute(this.temp).then(() => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Saved Successfully",
                type: "success",
                duration: 2000
              });
              this.getList();
            });
          } else {
            saveRouteInfo(this.temp).then(() => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Saved Successfully",
                type: "success",
                duration: 2000
              });
            });
          }
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleView(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "view";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleDelete(row) {
      delRoute(row).then(() => {
        this.$notify({
          title: "Success",
          message: "Delete Successfully",
          type: "success",
          duration: 2000
        });
        this.getList();
      });
    },
    handleQuery() {
      this.listQuery.page = 1;
      this.getList();
    },
    flushCache() {
      this.confirmSystem()
        .then(center => {
          flushCache({ systemCode: center }).then(() => {
            this.$message({
              type: "success",
              message: center + "缓存刷新成功"
            });
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消刷新缓存"
          });
        });
    },
    confirmSystem() {
      let vm = this;
      const h = this.$createElement;
      return this.$msgbox({
        title: "提示",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        message: h("div", {}, [
          h("p", {}, "请选择需要缓存的中心"),
          h(systemSelect, {
            style: {
              width: "100%",
              paddingTop: "16px"
            },
            ref: "confirmCenter"
          })
        ])
      }).then(() => {
        return vm.$refs["confirmCenter"].getValue();
        // return center;
      });
    },
    goFlushCacheState() {
      this.confirmSystem().then(center => {
        this.$router.push({
          path: "/log-center/flushState",
          query: {
            systemCode: center
          }
        });
      });
    },
    handleBeforeFilter(row) {
      // 页面跳转
      this.$router.push({
        path: "/log-center/logBeforeFilter",
        query: row
      });
    },
    handleAfterFilter(row) {
      console.log(row);
      // 页面跳转
      this.$router.push({
        path: "/log-center/logAfterFilter",
        query: row
      });
    },
    handleDistribute(row) {
      this.$router.push({
        path: "/log-center/logDistribute",
        query: row
      });
    },
    handleVerify(row) {
      this.$router.push({
        path: "/log-center/logGrade",
        query: row
      });
    },
    handleMapper(row) {
      this.$router.push({
        path: "/log-center/logMapper",
        query: row
      });
    },
    handleDb(row) {
      this.$router.push({
        path: "/log-center/logDb",
        query: row
      });
    },
    handleTable(row) {
      this.$router.push({
        path: "/log-center/logTable",
        query: row
      });
    },
    getStorageList(query) {
      let param = {
        storageType: this.temp.storageType,
        storageCode: query,
        systemCode: this.temp.systemCode
      };
      return getStorageList(param).then(rs => {
        if (rs.code === "200") {
          return rs.data;
        }
      });
    },
    getStorageTableList(query) {
      let param = {
        storageTableCode: query,
        storageId: this.temp.storageId,
        storageType: this.temp.storageType,
        systemCode: this.temp.systemCode
      };
      return getStorageTableList(param).then(rs => {
        if (rs.code === "200") {
          return rs.data;
        }
      });
    },
    setStorageCode(s) {
      if (s) {
        this.temp.storageCode = s.storageCode;
      }
    },
    setStorageTableCode(s) {
      if (s) {
        this.temp.storageTableCode = s.storageTableCode;
      }
    }
  }
};
</script>

<style>
.vp-button.vp-button--primary.vp-button--mini.vp-dropdown__caret-button {
  width: auto;
}
</style>
