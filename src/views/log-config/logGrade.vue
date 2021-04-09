<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="打分配置"></page-head>
    <div class="filter-container">
      <el-form ref="form" :model="baseInfo" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="告警阈值">
              <el-input v-model="baseInfo.threshold" v-if="roles.includes('admin')"></el-input>
              <el-input v-model="baseInfo.threshold" v-else disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="启用">
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
      <el-button v-waves class="filter-item" type="primary" size="small" plain @click="handleAdd" v-if="roles.includes('admin')">
        添加字段
      </el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="字段名">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-select v-model="scope.row.columnName" class="filter-item" placeholder="Please select"
                       @visible-change="getPickableTableParam()" >
              <el-option v-for="item in pickableTableParam" :key="item.tableColName" :label="item.tableColName" :value="item.tableColName" />
            </el-select>
          </template>
          <span v-else>{{ scope.row.columnName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="评分">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input v-model="scope.row.columnWeight" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.columnWeight }}</span>
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
