<template>
  <div class="app-container">
    <page-head @back="goBack" content="分发配置"></page-head>
    <div class="filter-container">
      <el-form ref="form" :model="baseInfo" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="">
              <el-input v-model="baseInfo.logCode" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="">
              <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleCreate">
                添加分发配置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>


    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="日志编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.logCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分发日志系统" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.distributeSystemCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分发日志编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.distributeLogCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="danger" @click="handleDelete(row)" v-if="roles.includes('admin')">
            删除
          </el-button>
          <el-dropdown size="mini" type="primary" style="margin-left:10px;">
            <el-button type="primary" size="mini">
              更多
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleMapper(row)">映射配置</el-dropdown-item>
              <el-dropdown-item @click.native="handleFilter(row)">过滤配置</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="添加分发配置" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="120px"
               style="width: 400px; margin-left:50px;">
        <el-form-item label="日志编码" prop="logCode">
          <el-input v-model="temp.logCode" disabled/>
        </el-form-item>
        <el-form-item label="分发中心编码" prop="systemCode">
          <el-input v-model="temp.distributeSystemCode"/>
        </el-form-item>
        <el-form-item label="分发日志编码" prop="systemCode">
          <el-input v-model="temp.distributeLogCode"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="saveData">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getDistributeList,
  saveDistribute,
  deleteDistribute
} from "@/api/logDistribute";
import waves from "@/directive/waves"; // waves directive
import Layout from "@/layout";
import { mapGetters } from "vuex";
import { deepClone, objectMerge } from "@/utils";
import pageHead from "@/components/PageHead"; // secondary package based on el-pagination
export default {
  name: "routeConfig",
  directives: { waves },
  computed: {
    ...mapGetters(["roles"])
  },
  components: {
    pageHead
  },
  data() {
    return {
      baseInfo: {},
      logCode: "",
      list: null,
      tableKey: 0,
      temp: {
        logCode: "",
        distributeSystemCode: "",
        distributeLogCode: ""
      },
      dialogFormVisible: false,
      rules: {
        logCode: [
          { required: true, message: "日志编码不能为空!", trigger: "change" }
        ],
        distributeSystemCode: [
          {
            required: true,
            message: "分发日志系统不能为空!",
            trigger: "change"
          }
        ],
        distributeLogCode: [
          {
            required: true,
            message: "分发日志编码不能为空!",
            trigger: "change"
          }
        ]
      }
    };
  },
  created() {
    objectMerge(this.baseInfo, this.$route.query);
    this.logCode = this.baseInfo.logCode;
    this.temp.logCode = this.logCode;
    this.getList();
    // 添加子页面路由
    this.$router.addRoutes([
      {
        path: "/log-distribute",
        component: Layout,
        children: [
          {
            path: "logDistributeMapper",
            component: () => import("@/views/log-config/logDistributeMapper"),
            name: "logDistributeMapper",
            meta: { title: "分发路由映射配置", affix: false },
            props: true
          },
          {
            path: "logDistributeFilter",
            component: () => import("@/views/log-config/logDistributeFilter"),
            name: "logDistributeFilter",
            meta: { title: "分发路由过滤配置", affix: false },
            props: true
          }
        ]
      }
    ]);
  },
  methods: {
    goBack() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.go(-1);
    },
    getList() {
      this.listLoading = true;
      getDistributeList(this.$route.query).then(response => {
        if (response.data) {
          this.list = response.data;
        }
        this.listLoading = false;
      });
    },
    handleCreate() {
      this.resetTemp();
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    resetTemp() {
      this.temp = {
        logCode: "",
        distributeSystemCode: "",
        distributeLogCode: ""
      };
      this.temp.logCode = this.logCode;
    },
    saveData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          saveDistribute(this.temp).then(() => {
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Saved Successfully",
              type: "success",
              duration: 2000
            });
            this.getList();
          });
        }
      });
    },

    handleDelete(row) {
      deleteDistribute(row).then(() => {
        this.$notify({
          title: "Success",
          message: "Delete Successfully",
          type: "success",
          duration: 2000
        });
        this.getList();
      });
    },
    handleMapper(row) {
      this.$router.push({
        path: "/log-distribute/logDistributeMapper",
        query: row
      });
    },
    handleFilter(row) {
      // 页面跳转
      this.$router.push({
        path: "/log-distribute/logDistributeFilter",
        query: row
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
