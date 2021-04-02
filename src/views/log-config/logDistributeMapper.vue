<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="分发映射配置"></page-head>
    <div class="filter-container">
      <vp-form ref="form" :model="baseInfo" label-width="80px">
        <vp-row :gutter="20">
          <vp-col :span="7">
            <vp-form-item label="">
              <vp-input v-model="baseInfo.logCode" :disabled="true"></vp-input>
            </vp-form-item>
          </vp-col>
          <vp-col :span="7">
            <vp-form-item label="分发系统">
              <vp-input v-model="baseInfo.distributeSystemCode" :disabled="true"></vp-input>
            </vp-form-item>
          </vp-col>
          <vp-col :span="7">
            <vp-form-item label="分发日志">
              <vp-input v-model="baseInfo.distributeLogCode" :disabled="true"></vp-input>
            </vp-form-item>
          </vp-col>
        </vp-row>
      </vp-form>
    </div>

    <vp-button v-waves class="filter-item" type="primary" size="small" plain @click="handleAdd" v-if="roles.includes('admin')">
      手动添加
    </vp-button>
    <vp-button v-waves class="filter-item" type="primary" size="small" plain @click="generateData" v-if="roles.includes('admin')">
      自动补全
    </vp-button>
    <vp-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <vp-table-column align="center" label="源字段名">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-input v-model="scope.row.sourceColumn" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.sourceColumn }}</span>
        </template>
      </vp-table-column>

      <vp-table-column align="center" label="源字段类型">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.sourceColumnType" clearable class="filter-item" placeholder="Please select">
              <vp-option v-for="item in destColumnType" :key="item.key" :label="item.display_name" :value="item.key" />
            </vp-select>
          </template>
          <span v-else>{{ scope.row.sourceColumnType | columnTypeFilter }}</span>
        </template>
      </vp-table-column>

      <vp-table-column align="center" label="目标字段名">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.destColumn" class="filter-item" placeholder="Please select" @visible-change="getPickableTableParam()" @change="((val)=>{changeStatus(val, scope.row)})">
              <vp-option v-for="item in pickableTableParam" :key="item.sourceColumn" :label="item.sourceColumn" :value="item.sourceColumn" />
            </vp-select>
          </template>
          <span v-else>
            <vp-tooltip v-if="scope.row.noColumn" :content="`${scope.row.destColumn}字段在表配置中不存在`" placement="top">
              <vp-tag type="danger" effect="plain">{{ scope.row.destColumn }}</vp-tag>
            </vp-tooltip>
            <template v-else>{{ scope.row.destColumn }}</template>
          </span>
        </template>
      </vp-table-column>

      <vp-table-column align="center" label="目标字段类型">
        <template slot-scope="scope">
          <template v-if="scope.row.typeIsSame">
            <vp-input v-model="scope.row.destColumnType" class="edit-input" size="small" :disabled="true" />
          </template>
          <vp-tooltip v-else :content="`${scope.row.destColumn}字段类型与表配置中的不一致`" placement="top">
            <vp-tag type="danger" effect="plain">{{ scope.row.destColumnType }}</vp-tag>
          </vp-tooltip>
        </template>
      </vp-table-column>
      <vp-table-column align="center" label="字段格式">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-input v-model="scope.row.columnFormat" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.columnFormat }}</span>
        </template>
      </vp-table-column>
      <vp-table-column align="center" label="默认值">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-input v-model="scope.row.defaultValue" class="edit-input" size="small" />
          </template>
          <span v-else>{{ scope.row.defaultValue }}</span>
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
import {
  getLogMapper,
  getDistributeMapper,
  saveDistributeMapper
} from "@/api/logMapper";
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
  name: "logDistributeMapper",
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
      mapperParamList: [],
      pickableTableParam: [],
      stateType
    };
  },
  created() {
    objectMerge(this.baseInfo, this.$route.query);
    this.baseInfo["mapperType"] = "DISTIBUTE_MAPPER_TYPE";
    this.getList();
  },
  methods: {
    goBack() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.go(-1);
    },
    async getList() {
      let logMapper = (this.mapperParamList = await getLogMapper({
        logCode: this.baseInfo.distributeLogCode
      }).then(response => {
        if (response.data) {
          return response.data.mapperParamList;
        }
      }));
      getDistributeMapper(objectMerge({}, this.$route.query)).then(response => {
        if (response.data) {
          this.baseInfo = response.data;
          response.data.mapperParamList.forEach(item => {
            let find = logMapper.find(
              el => el.sourceColumn === item.destColumn
            );
            if (find) {
              item.typeIsSame = find.sourceColumnType === item.destColumnType;
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
      let find = this.mapperParamList.find(
        el => el.sourceColumn === row.destColumn
      );
      if (find) {
        row.typeIsSame = find.sourceColumnType === row.destColumnType;
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
      saveDistributeMapper(this.baseInfo).then(() => {
        this.goBack();
      });
    },
    generateData() {
      this.list = [];
      for (var tableIndex in this.mapperParamList) {
        var mapperParam = {};
        mapperParam.destColumn = this.mapperParamList[tableIndex].sourceColumn;
        mapperParam.destColumnType = this.mapperParamList[
          tableIndex
        ].sourceColumnType;
        mapperParam.sourceColumn = this.mapperParamList[
          tableIndex
        ].sourceColumn;
        mapperParam.sourceColumnType = this.mapperParamList[
          tableIndex
        ].sourceColumnType;
        mapperParam.typeIsSame = true;
        this.list.push(mapperParam);
      }
    },
    getPickableTableParam() {
      this.pickableTableParam = [];
      for (var tableIndex in this.mapperParamList) {
        var hasSame = false;
        for (var mapperIndex in this.list) {
          if (
            this.list[mapperIndex].destColumn ==
            this.mapperParamList[tableIndex].sourceColumn
          ) {
            hasSame = true;
          }
        }
        if (hasSame == false) {
          this.pickableTableParam.push(this.mapperParamList[tableIndex]);
        }
      }
    },
    changeStatus(val, row) {
      for (var index in this.mapperParamList) {
        if (this.mapperParamList[index].sourceColumn == val) {
          row.destColumnType = this.mapperParamList[index].sourceColumnType;
          break;
        }
      }
    }
  }
};
</script>
