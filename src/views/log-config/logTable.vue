<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="表配置"></page-head>
    <vp-dialog :title="autoCreateTitle" :visible.sync="dialogFormVisible">
      <vp-form ref="form" label-width="80px">
        <vp-row :gutter="30">
          <vp-col :span="8">
            <vp-form-item label="存储编码">
              <vp-select v-model="storageCode" class="filter-item" placeholder="Please select"
                         v-on:visible-change="getPickableStorageList()">
                <vp-option v-for="item in pickableStorageCodeList" :key="item.storageCode" :label="item.storageName"
                           :value="item.storageCode">
                  <span style="float: left">{{ item.storageName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.storageCode }}</span>
                </vp-option>
              </vp-select>
            </vp-form-item>
          </vp-col>
          <vp-col :span="8">
            <vp-form-item label="表名">
              <vp-input v-model="tableName"></vp-input>
            </vp-form-item>
          </vp-col>
          <vp-col :span="8">
            <vp-form-item label="类型名">
              <vp-input v-model="typeName"></vp-input>
            </vp-form-item>
          </vp-col>
        </vp-row>
      </vp-form>
      <div slot="footer" class="dialog-footer">
        <vp-button @click="dialogFormVisible = false">
          取消
        </vp-button>
        <vp-button type="primary" @click="generateData">
          生成
        </vp-button>
      </div>
    </vp-dialog>

    <div class="filter-container">
      <vp-form ref="form" :model="baseInfo" label-width="80px">
        <vp-row :gutter="20">
          <vp-col :span="6">
            <vp-form-item label="日志编码">
              <vp-input v-model="baseInfo.logCode" :disabled="true"></vp-input>
            </vp-form-item>
          </vp-col>
          <vp-col :span="6">
            <vp-form-item label="允许建表">
              <vp-select v-model="baseInfo.autoCreateTable" placeholder="Please select" width="100%"
                         v-if="roles.includes('admin')">
                <vp-option v-for="item in autoCreateList" :key="item.key" :label="item.display_name" :value="item.key"/>
              </vp-select>
              <vp-select v-model="baseInfo.autoCreateTable" placeholder="Please select" width="100%" v-else disabled>
                <vp-option v-for="item in autoCreateList" :key="item.key" :label="item.display_name" :value="item.key"/>
              </vp-select>
            </vp-form-item>
          </vp-col>
          <vp-col :span="6">
            <vp-form-item label="表名" v-if="roles.includes('admin')">
              <vp-input v-model="baseInfo.tableName"></vp-input>
            </vp-form-item>
            <vp-form-item label="表名" v-else>
              <vp-input v-model="baseInfo.tableName" disabled></vp-input>
            </vp-form-item>
          </vp-col>
          <vp-col :span="6">
            <vp-form-item label="类型名" v-if="roles.includes('admin')">
              <vp-input v-model="baseInfo.typeName"></vp-input>
            </vp-form-item>
            <vp-form-item label="类型名" v-else>
              <vp-input v-model="baseInfo.typeName" disabled></vp-input>
            </vp-form-item>
          </vp-col>
          <!--
          <vp-col :span="6" v-if="baseInfo.autoCreateTable==='T'" :offset="6">
            <vp-form-item label="模版表" v-if="roles.includes('admin')">
              <vp-input v-model="baseInfo.tableTemplate" ></vp-input>
            </vp-form-item>
            <vp-form-item label="模版表" v-else>
              <vp-input v-model="baseInfo.tableTemplate"  disabled></vp-input>
            </vp-form-item>
          </vp-col>
          -->
        </vp-row>
      </vp-form>
    </div>
    <vp-button v-waves class="filter-item" type="primary" size="small" plain @click="handleAdd"
               v-if="roles.includes('admin')">
      手动添加
    </vp-button>
    <vp-button v-waves class="filter-item" type="primary" size="small" plain @click="handleAutoAdd"
               v-if="roles.includes('admin')">
      自动添加
    </vp-button>
    <vp-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <vp-table-column align="center" label="字段名">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-input v-model="scope.row.tableColName" class="edit-input" size="small"/>
          </template>
          <span v-else>{{ scope.row.tableColName }}</span>
        </template>
      </vp-table-column>
      <vp-table-column align="center" label="字段类型">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-input v-model="scope.row.tableColType" class="edit-input" size="small"/>
          </template>
          <span v-else>{{ scope.row.tableColType }}</span>
        </template>
      </vp-table-column>
      <vp-table-column align="center" label="字段java类型">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.tableColJavaType" class="filter-item" placeholder="Please select">
              <vp-option v-for="item in colJavaType" :key="item" :label="item" :value="item"/>
            </vp-select>
          </template>
          <span v-else>{{ scope.row.tableColJavaType }}</span>
        </template>
      </vp-table-column>
      <vp-table-column align="center" label="是否是主键">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.isPrimary" placeholder="请选择是否为主键" size="small">
              <vp-option label="是" value="T">
              </vp-option>
              <vp-option label="否" value="F">
              </vp-option>
            </vp-select>
          </template>
          <vp-tag v-else :type="scope.row.isPrimary==='T'?'warning':'info'">{{ scope.row.isPrimary==='T'?'是':'否' }}
          </vp-tag>
        </template>
      </vp-table-column>
      <vp-table-column align="center" label="是否必要字段">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.isNecessary" placeholder="请选择是否为必要节点" size="small">
              <vp-option label="是" value='T'>
              </vp-option>
              <vp-option label="否" value='F'>
              </vp-option>
            </vp-select>
          </template>
          <vp-tag v-else :type="scope.row.isNecessary==='T'?'warning':'info'">{{ scope.row.isNecessary==='T'?'是':'否' }}
          </vp-tag>
        </template>
      </vp-table-column>
      <vp-table-column align="center" label="是否幂等字段">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.isIdempotent" placeholder="请选择是否为幂等字段" size="small">
              <vp-option label="是" value="T">
              </vp-option>
              <vp-option label="否" value="F">
              </vp-option>
            </vp-select>
          </template>
          <vp-tag v-else :type="scope.row.isIdempotent==='T'?'warning':'info'">{{ scope.row.isIdempotent==='T'?'是':'否' }}
          </vp-tag>
        </template>
      </vp-table-column>
      <vp-table-column align="center" label="是否自动增长">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-select v-model="scope.row.isAutoInc" placeholder="请选择是否自动增长" size="small">
              <vp-option label="是" value="T">
              </vp-option>
              <vp-option label="否" value="F">
              </vp-option>
            </vp-select>
          </template>
          <vp-tag v-else :type="scope.row.isAutoInc==='T'?'warning':'info'">{{ scope.row.isAutoInc==='T'?'是':'否' }}
          </vp-tag>
        </template>
      </vp-table-column>
      <vp-table-column align="center" label="序列名称">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <vp-input v-model="scope.row.sequenceName" class="edit-input" size="small"/>
          </template>
          <span v-else>{{ scope.row.sequenceName }}</span>
        </template>
      </vp-table-column>

      <vp-table-column align="center" label="操作" width="300" v-if="roles.includes('admin')">
        <template slot-scope="scope">
          <vp-button v-if="scope.row.edit" size="mini" icon="vp-icon-circle-cancel-outline"
                     @click="cancelEdit(scope.row,scope.$index)">
            Cancel
          </vp-button>
          <vp-button v-if="scope.row.edit" type="success" size="mini" icon="vp-icon-circle-check-outline"
                     @click="confirmEdit(scope.row)">
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
  getLogTable,
  saveLogTable,
  getTableCols,
  pickableStorageList
} from "@/api/logTable";
import waves from "@/directive/waves"; // waves directive
import { deepClone, objectMerge } from "@/utils";
import pageHead from "@/components/PageHead"; // secondary package based on el-pagination
import RemoteSelect from "@/components/RemoteSelect";
import { mapGetters } from "vuex";

const colJavaType = [
  "char",
  "int",
  "float",
  "double",
  "long",
  "string",
  "date",
  "time",
  "timestamp",
  "bigdecimal",
  "boolean",
  "short"
];

export default {
  name: "logTable",
  directives: { waves },
  components: {
    pageHead,
    RemoteSelect
  },
  computed: {
    ...mapGetters(["roles"])
  },
  data() {
    return {
      baseInfo: {},
      tableKey: 0,
      list: [],
      listLoading: true,
      curRowData: [],
      storageCode: "",
      systemCode: "",
      tableName: "",
      typeName: "",
      autoCreateList: [
        {
          key: "T",
          display_name: "是"
        },
        {
          key: "F",
          display_name: "否"
        }
      ],
      pickableStorageCodeList: [],
      dialogFormVisible: false,
      autoCreateTitle: "自动生成列",
      colJavaType
    };
  },
  created() {
    objectMerge(this.baseInfo, this.$route.query);
    this.systemCode = this.baseInfo.systemCode;
    this.storageType = this.baseInfo.storageType;
    this.getList();
  },
  methods: {
    goBack() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.go(-1);
    },
    getList() {
      getLogTable(this.$route.query).then(response => {
        if (response.data) {
          this.baseInfo = response.data;
          this.list = response.data.tableParamList;
        }
        this.listLoading = false;
      });
    },
    generateData() {
      getTableCols({
        tableName: this.tableName,
        storageCode: this.storageCode,
        typeName: this.typeName
      }).then(rs => {
        this.list = rs.data;
        this.dialogFormVisible = false;
      });
    },
    handleAutoAdd() {
      this.dialogFormVisible = true;
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
      if (this.checkData()) {
        this.list.forEach(el => {
          objectMerge(el, this.baseInfo, ["tableParamList"]);
        });
        this.baseInfo.tableParamList = this.list;
        saveLogTable(this.baseInfo).then(() => {
          this.goBack();
        });
      }
    },
    getPickableStorageList() {
      pickableStorageList(this.systemCode, this.storageType).then(response => {
        if (response.data) {
          this.pickableStorageCodeList = response.data;
        }
      });
    },
    checkData() {
      /*
      if (
        this.baseInfo.tableTemplate === "" &&
        this.baseInfo.autoCreateTable === "T"
      ) {
        this.$message.error("模板表为填写！");
        return false;
      }
      if (this.baseInfo.tableName === "") {
        this.$message.error("表名必须配置");
        return false;
      }
      */

      return true;
    }
  }
};
</script>
