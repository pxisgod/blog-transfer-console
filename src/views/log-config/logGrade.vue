<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="打分配置"></page-head>
    <div class="filter-container">
      <vp-form ref="form" :model="baseInfo" label-width="80px">
        <vp-row :gutter="20">
          <vp-col :span="8">
            <vp-form-item label="告警阈值">
              <vp-input v-model="baseInfo.threshold" v-if="roles.includes('admin')"></vp-input>
              <vp-input v-model="baseInfo.threshold" v-else disabled></vp-input>
            </vp-form-item>
          </vp-col>
          <vp-col :span="8">
            <vp-form-item label="启用">
              <vp-select v-model="baseInfo.state" class="filter-item" placeholder="Please select" v-if="roles.includes('admin')">
                <vp-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key"/>
              </vp-select>
              <vp-select v-model="baseInfo.state" class="filter-item" placeholder="Please select" v-else disabled>
                <vp-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key"/>
              </vp-select>
            </vp-form-item>
          </vp-col>
        </vp-row>
      </vp-form>
      <vp-button v-waves class="filter-item" type="primary" size="small" plain @click="handleAdd" v-if="roles.includes('admin')">
        添加字段
      </vp-button>
    </div>

    <vp-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <vp-table-column align="center" label="字段名">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.columnName" class="filter-item" placeholder="Please select"
                       @visible-change="getPickableTableParam()" >
              <vp-option v-for="item in pickableTableParam" :key="item.tableColName" :label="item.tableColName" :value="item.tableColName" />
            </vp-select>
          </template>
          <span v-else>{{ scope.row.columnName }}</span>
        </template>
      </vp-table-column>

      <vp-table-column label="评分">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-input v-model="scope.row.columnWeight" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.columnWeight }}</span>
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
import { getLogGrade, saveLogGrade, getLogTable } from "@/api/logGrade";
import waves from "@/directive/waves"; // waves directive
import { deepClone, objectMerge } from "@/utils";
import pageHead from "@/components/PageHead"; // secondary package based on el-pagination
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
export default {
  name: "logFilter",
  directives: { waves },
  components: {
    pageHead
  },
  computed: {
    ...mapGetters(["roles"])
  },
  data() {
    return {
      baseInfo: {},
      // filterRule,
      // paramType,
      tableKey: 0,
      list: [],
      listLoading: true,
      curRowData: [],
      stateType,
      pickableTableParam: [],
      tableParamList: []
    };
  },
  created() {
    objectMerge(this.baseInfo, this.$route.query);
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
      getLogGrade(this.$route.query).then(response => {
        if (response.data) {
          this.baseInfo = response.data;
          this.list = response.data.gradeParamList;
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
      row.edit = false;
      this.$message({
        message: "The Data has been edited",
        type: "success"
      });
    },
    handleDel(index) {
      this.list.splice(index, 1);
    },
    handleSave() {
      this.list.forEach(el => {
        objectMerge(el, this.baseInfo, ["gradeParamList"]);
      });
      this.baseInfo.gradeParamList = this.list;
      saveLogGrade(this.baseInfo).then(() => {
        this.goBack();
      });
    },
    getPickableTableParam() {
      this.pickableTableParam = [];
      for (var tableIndex in this.tableParamList) {
        var hasSame = false;
        for (var mapperIndex in this.list) {
          if (
            this.list[mapperIndex].columnName ==
            this.tableParamList[tableIndex].tableColName
          ) {
            hasSame = true;
          }
        }
        if (hasSame == false) {
          this.pickableTableParam.push(this.tableParamList[tableIndex]);
        }
      }
    }
  }
};
</script>
