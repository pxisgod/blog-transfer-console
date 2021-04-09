<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="后置过滤配置"></page-head>
    <div class="filter-container">
      <el-form ref="form" :model="baseInfo" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="">
              <el-input v-model="baseInfo.logCode" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="启用" >
              <el-select v-model="baseInfo.state" class="filter-item" placeholder="Please select" v-if="roles.includes('admin')">
                <el-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key"/>
              </el-select>
              <el-select v-model="baseInfo.state" class="filter-item" placeholder="Please select" v-else disabled>
                <el-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <el-button v-waves class="filter-item" type="primary" size="small" plain @click="handleAdd" v-if="roles.includes('admin')">
      添加参数
    </el-button>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="参数名">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-select v-model="scope.row.paramName" class="filter-item" placeholder="Please select" @change="((val)=>{changeStatus(val, scope.row)})">
              <el-option v-for="item in tableParamList" :key="item.tableColName" :label="item.tableColName" :value="item.tableColName" />
            </el-select>
          </template>
          <span v-else>{{ scope.row.paramName }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="参数类型">
        <template slot-scope="scope">
          <template>
            <el-input v-model="scope.row.paramType" class="edit-input" size="small" :disabled="true"/>
          </template>
        </template>
      </el-table-column>

      <el-table-column align="center" label="过滤规则">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-select v-model="scope.row.filterRule" class="filter-item" placeholder="Please select">
              <el-option v-for="item in filterRule" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
          </template>
          <span v-else>{{ scope.row.filterRule | rulesFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column label="过滤正则表达式">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input v-model="scope.row.filterExp" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.filterExp }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="300" v-if="roles.includes('admin')">
        <template slot-scope="scope">
          <el-button v-if="scope.row.edit" size="mini" icon="el-icon-circle-cancel-outline" @click="cancelEdit(scope.row,scope.$index)">
            Cancel
          </el-button>
          <el-button v-if="scope.row.edit" type="success" size="mini" icon="el-icon-circle-check-outline" @click="confirmEdit(scope.row)">
            Ok
          </el-button>
          <el-button v-else type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row,scope.$index)">
            修改
          </el-button>
          <el-button type="danger" size="mini" icon="el-icon-circle-close-outline" @click="handleDel(scope.$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="padding:24px 0;">
      <el-button v-waves class="filter-item" type="primary" @click="handleSave" v-if="roles.includes('admin')">
        保存
      </el-button>
      <el-button v-waves class="filter-item" type="primary" @click="goBack">
        返回
      </el-button>
    </div>
  </div>
</template>

<script>
import { getLogFilter, saveFilter, getLogTable } from "@/api/logFilter";
import waves from "@/directive/waves"; // waves directive
import { deepClone, objectMerge } from "@/utils";
import pageHead from "@/components/PageHead"; // secondary package based on el-pagination
import { mapGetters } from "vuex";

const filterType = "BUSI_FILTER_TYPE";
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
const filterRule = [
  {
    key: "null_filter",
    display_name: "空过滤"
  },
  {
    key: "regex_filter",
    display_name: "正则过滤"
  }
];

export default {
  name: "logAfterFilter",
  directives: { waves },
  components: {
    pageHead
  },
  filters: {
    rulesFilter(type) {
      let rs = filterRule.find(el => type === el.key);
      return rs ? rs.display_name : "";
    }
  },
  computed: {
    ...mapGetters(["roles"])
  },
  data() {
    return {
      baseInfo: {},
      filterRule,
      stateType,
      tableKey: 0,
      list: [],
      listLoading: true,
      curRowData: [],
      filterType,
      tableParamList: []
    };
  },
  created() {
    objectMerge(this.baseInfo, this.$route.query);
    objectMerge(this.baseInfo, { filterType: this.filterType });
    this.getList();
  },
  methods: {
    goBack() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.go(-1);
    },
    getList() {
      var loadCount = 2;
      getLogTable(this.$route.query).then(response => {
        if (response.data) {
          this.tableParamList = response.data.tableParamList;
        }
        loadCount--;
        if (loadCount == 0) {
          this.listLoading = false;
        }
      });
      getLogFilter(this.baseInfo).then(response => {
        if (response.data) {
          this.baseInfo = response.data;
          this.list = response.data.filterParamList;
        }
        loadCount--;
        if (loadCount == 0) {
          this.listLoading = false;
        }
      });
    },
    handleAdd() {
      this.list.push(objectMerge({ edit: true }, this.baseInfo));
    },
    handleEdit(row, index) {
      row.edit = !row.edit;
      this.curRowData[index] = deepClone(row);
    },
    cancelEdit(row, index) {
      objectMerge(row, this.curRowData[index]);
      row.edit = false;
      this.$message({
        message: "The Data has been restored to the original value",
        type: "warning"
      });
    },
    confirmEdit(row) {
      this.checkRow(row).then(() => {
        row.edit = false;
        this.$message({
          message: "The Data has been edited",
          type: "success"
        });
      });
    },
    handleDel(index) {
      this.list.splice(index, 1);
    },
    handleSave() {
      this.list.forEach(el => {
        objectMerge(el, this.baseInfo, ["filterParamList"]);
      });
      this.baseInfo.filterParamList = this.list;
      console.log(this.baseInfo);
      saveFilter(this.baseInfo).then(() => {
        this.goBack();
      });
    },
    changeStatus(val, row) {
      for (var index in this.tableParamList) {
        if (this.tableParamList[index].tableColName == val) {
          row.paramType = this.tableParamList[index].tableColJavaType;
          break;
        }
      }
    },
    checkRow(row) {
      return new Promise((resolve, reject) => {
        if (row.filterRule === "regex_filter" && !row.filterExp) {
          this.$message.error("过滤正则表达式未配置！");
          reject(false);
        }
        resolve(true);
      });
    }
  }
};
</script>
