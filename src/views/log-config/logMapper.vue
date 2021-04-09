<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="映射配置"></page-head>
    <div class="filter-container">
      <el-form ref="form" :model="baseInfo" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="">
              <el-input v-model="baseInfo.logCode" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <!--<el-col :span="8">
            <el-form-item label="启用">
              <el-select v-model="baseInfo.state" class="filter-item" placeholder="Please select" v-if="roles.includes('admin')">
                <el-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key" />
              </el-select>
              <el-select v-model="baseInfo.state" class="filter-item" placeholder="Please select" v-else disabled>
                <el-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key" />
              </el-select>
            </el-form-item>
          </el-col>-->
        </el-row>
      </el-form>
    </div>

    <el-button v-waves class="filter-item" type="primary" size="small" plain @click="handleAdd" v-if="roles.includes('admin')">
      手动添加
    </el-button>
    <el-button v-waves class="filter-item" type="primary" size="small" plain @click="generateData" v-if="roles.includes('admin')">
      自动补全
    </el-button>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="源字段名">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input v-model="scope.row.sourceColumn" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.sourceColumn }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="源字段类型">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-select v-model="scope.row.sourceColumnType" clearable class="filter-item" placeholder="Please select">
              <el-option v-for="item in destColumnType" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
          </template>
          <span v-else>{{ scope.row.sourceColumnType | columnTypeFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="目标字段名">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-select v-model="scope.row.destColumn" class="filter-item" placeholder="Please select" @visible-change="getPickableTableParam()" @change="((val)=>{changeStatus(val, scope.row)})">
              <el-option v-for="item in pickableTableParam" :key="item.tableColName" :label="item.tableColName" :value="item.tableColName" />
            </el-select>
          </template>
          <span v-else>
            <el-tooltip v-if="scope.row.noColumn" :content="`${scope.row.destColumn}字段在表配置中不存在`" placement="top">
              <el-tag type="danger" effect="plain">{{ scope.row.destColumn }}</el-tag>
            </el-tooltip>
            <template v-else>{{ scope.row.destColumn }}</template>
          </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="目标字段类型">
        <template slot-scope="scope">
          <template v-if="scope.row.typeIsSame">
            <el-input v-model="scope.row.destColumnType" class="edit-input" size="small" :disabled="true" />
          </template>
          <el-tooltip v-else :content="`${scope.row.destColumn}字段类型与表配置中的不一致`" placement="top">
            <el-tag type="danger" effect="plain">{{ scope.row.destColumnType }}</el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" label="字段格式">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input v-model="scope.row.columnFormat" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.columnFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="默认值">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input v-model="scope.row.defaultValue" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.defaultValue }}</span>
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
import { getLogMapper, saveLogMapper, getLogTable } from "@/api/logMapper";
import waves from "@/directive/waves"; // waves directive
import { deepClone, objectMerge } from "@/utils";
import pageHead from "@/components/PageHead"; // secondary package based on el-pagination
import { mapGetters } from "vuex";

const destColumnType = [
  {
    key: "char",
    display_name: "char"
  },
  {
    key: "int",
    display_name: "int"
  },
  {
    key: "float",
    display_name: "float"
  },
  {
    key: "double",
    display_name: "double"
  },
  {
    key: "long",
    display_name: "long"
  },
  {
    key: "string",
    display_name: "string"
  },
  {
    key: "date",
    display_name: "date"
  },
  {
    key: "time",
    display_name: "time"
  },
  {
    key: "timestamp",
    display_name: "timestamp"
  },
  {
    key: "bigdecimal",
    display_name: "bigdecimal"
  },
  {
    key: "boolean",
    display_name: "boolean"
  },
  {
    key: "short",
    display_name: "short"
  }
];

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
  name: "logMapper",
  directives: { waves },
  components: {
    pageHead
  },
  filters: {
    columnTypeFilter(type) {
      let rs = destColumnType.find(el => type === el.key);
      return rs ? rs.display_name : "";
    }
  },
  computed: {
    ...mapGetters(["roles"])
  },
  data() {
    return {
      baseInfo: {},
      destColumnType,
      tableKey: 0,
      list: [],
      listLoading: true,
      curRowData: [],
      tableParamList: [],
      pickableTableParam: [],
      stateType
    };
  },
  created() {
    objectMerge(this.baseInfo, this.$route.query);
    this.baseInfo["mapperType"] = "NORMAL_MAPPER_TYPE";
    this.getList();
  },
  methods: {
    goBack() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.go(-1);
    },
    async getList() {
      let logtable = (this.tableParamList = await getLogTable(
        objectMerge({}, this.$route.query)
      ).then(response => {
        if (response.data) {
          return response.data.tableParamList;
        }
      }));
      getLogMapper(objectMerge({}, this.$route.query)).then(response => {
        if (response.data) {
          this.baseInfo = response.data;
          response.data.mapperParamList.forEach(item => {
            let find = logtable.find(el => el.tableColName === item.destColumn);
            if (find) {
              item.typeIsSame = find.tableColJavaType === item.destColumnType;
            } else {
              item.noColumn = true;
            }
          });
          this.list = response.data.mapperParamList;
        }
        this.listLoading = false;
      });
    },
    /**
     * 校验表字段与映射是否匹配
     */
    checkRow(row) {
      let find = this.tableParamList.find(
        el => el.tableColName === row.destColumn
      );
      if (find) {
        row.typeIsSame = find.tableColJavaType === row.destColumnType;
        row.noColumn = false;
      } else {
        row.noColumn = true;
      }
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
      this.checkRow(row);
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
        objectMerge(el, this.baseInfo, ["mapperParamList"]);
      });
      this.baseInfo.mapperParamList = this.list;
      saveLogMapper(this.baseInfo).then(() => {
        this.goBack();
      });
    },
    generateData() {
      this.list = [];
      for (var tableIndex in this.tableParamList) {
        var mapperParam = {};
        mapperParam.destColumn = this.tableParamList[tableIndex].tableColName;
        mapperParam.destColumnType = this.tableParamList[
          tableIndex
        ].tableColJavaType;
        mapperParam.sourceColumn = this.tableParamList[tableIndex].tableColName;
        mapperParam.sourceColumnType = this.tableParamList[
          tableIndex
        ].tableColJavaType;
        mapperParam.typeIsSame = true;
        this.list.push(mapperParam);
      }
    },
    getPickableTableParam() {
      this.pickableTableParam = [];
      for (var tableIndex in this.tableParamList) {
        var hasSame = false;
        for (var mapperIndex in this.list) {
          if (
            this.list[mapperIndex].destColumn ==
            this.tableParamList[tableIndex].tableColName
          ) {
            hasSame = true;
          }
        }
        if (hasSame == false) {
          this.pickableTableParam.push(this.tableParamList[tableIndex]);
        }
      }
    },
    changeStatus(val, row) {
      for (var index in this.tableParamList) {
        if (this.tableParamList[index].tableColName == val) {
          row.destColumnType = this.tableParamList[index].tableColJavaType;
          break;
        }
      }
    }
  }
};
</script>
