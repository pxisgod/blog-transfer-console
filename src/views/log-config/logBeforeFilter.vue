<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="前置过滤配置"></page-head>
    <div class="filter-container">
      <vp-form ref="form" :model="baseInfo" label-width="80px">
        <vp-row :gutter="20">
          <vp-col :span="8">
            <vp-form-item label="">
              <vp-input v-model="baseInfo.logCode" :disabled="true"></vp-input>
            </vp-form-item>
          </vp-col>
          <vp-col :span="8">
            <vp-form-item label="启用">
              <vp-select v-model="baseInfo.state" class="filter-item" placeholder="Please select" v-if="roles.includes('admin')">
                <vp-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key" />
              </vp-select>
              <vp-select v-model="baseInfo.state" class="filter-item" placeholder="Please select" v-else disabled>
                <vp-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key" />
              </vp-select>
            </vp-form-item>
          </vp-col>
        </vp-row>
      </vp-form>
    </div>

    <vp-button v-waves class="filter-item" type="primary" size="small" plain @click="handleAdd" v-if="roles.includes('admin')">
      添加参数
    </vp-button>
    <vp-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <vp-table-column align="center" label="参数名">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.paramName" class="filter-item" placeholder="Please select" @change="((val)=>{changeStatus(val, scope.row)})">
              <vp-option v-for="item in pubParamList" :key="item.paramName" :label="item.paramName" :value="item.paramName" />
            </vp-select>
          </template>
          <span v-else>{{ scope.row.paramName }}</span>
        </template>
      </vp-table-column>

      <vp-table-column align="center" label="参数类型">
        <template slot-scope="scope">
          <template>
            <vp-input v-model="scope.row.paramType" class="edit-input" size="small" :disabled="true" />
          </template>
        </template>
      </vp-table-column>

      <vp-table-column align="center" label="过滤规则">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.filterRule" class="filter-item" placeholder="Please select">
              <vp-option v-for="item in filterRule" :key="item.key" :label="item.display_name" :value="item.key" />
            </vp-select>
          </template>
          <span v-else>{{ scope.row.filterRule | rulesFilter }}</span>
        </template>
      </vp-table-column>

      <vp-table-column label="过滤正则表达式">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-input v-model="scope.row.filterExp" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.filterExp }}</span>
        </template>
      </vp-table-column>

      <vp-table-column align="center" label="操作" width="300" v-if="roles.includes('admin')">
        <template slot-scope="scope">
          <vp-button v-if="scope.row.edit" size="mini" icon="vp-icon-circle-cancel-outline" @click="cancelEdit(scope.row,scope.$index)">
            Cancel
          </vp-button>
          <vp-button v-if="scope.row.edit" type="success" size="mini" icon="vp-icon-circle-check-outline" @click="confirmEdit(scope.row)">
            Ok
          </vp-button>
          <vp-button v-else type="primary" size="mini" icon="vp-icon-edit" @click="handleEdit(scope.row,scope.$index)">
            修改
          </vp-button>
          <vp-button type="danger" size="mini" icon="vp-icon-circle-close-outline" @click="handleDel(scope.$index)">
            删除
          </vp-button>
        </template>
      </vp-table-column>
    </vp-table>
    <div style="padding:24px 0;">
      <vp-button v-waves class="filter-item" type="primary" @click="handleSave" v-if="roles.includes('admin')">
        保存
      </vp-button>
      <vp-button v-waves class="filter-item" type="primary" @click="goBack">
        返回
      </vp-button>
    </div>
  </div>
</template>

<script>
import { getLogFilter, saveFilter } from "@/api/logFilter";
import waves from "@/directive/waves"; // waves directive
import { deepClone, objectMerge } from "@/utils";
import pageHead from "@/components/PageHead"; // secondary package based on el-pagination
import { mapGetters } from "vuex";

const filterType = "PUB_FILTER_TYPE";
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

const pubParamList = [
  { paramName: "ip", paramType: "string" },
  { paramName: "serverName", paramType: "string" }
];

export default {
  name: "logFilter",
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
      pubParamList
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
      getLogFilter(this.baseInfo).then(response => {
        if (response.data) {
          this.baseInfo = response.data;
          this.list = response.data.filterParamList;
        }
        this.listLoading = false;
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
      for (var index in this.pubParamList) {
        if (this.pubParamList[index].paramName == val) {
          row.paramType = this.pubParamList[index].paramType;
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
