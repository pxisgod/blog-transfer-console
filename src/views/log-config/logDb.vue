<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="库配置"></page-head>
    <div class="filter-container">
      <el-form ref="form" :model="baseInfo" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="">
              <el-input v-model="baseInfo.logCode" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否分库" >
              <el-select v-model="baseInfo.isSplit" class="filter-item" placeholder="Please select" v-if="roles.includes('admin')">
                <el-option v-for="item in splitStat" :key="item.key" :label="item.display_name" :value="item.key" />
              </el-select>
              <el-select v-model="baseInfo.isSplit" class="filter-item" placeholder="Please select" v-else disabled>
                <el-option v-for="item in splitStat" :key="item.key" :label="item.display_name" :value="item.key" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="分库字段">
							<el-input v-if="baseInfo.isSplit==='T' && roles.includes('admin') " v-model="baseInfo.splitColumn"></el-input>
              <el-input v-else v-model="baseInfo.splitColumn" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

    </div>
    <el-button v-waves class="filter-item" type="primary" size="small" plain @click="handleAdd" v-if="roles.includes('admin')">
      添加库配置
    </el-button>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="分库编码">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input v-if="scope.row.isFromSaved" v-model="scope.row.splitDbCode" disabled></el-input>
            <el-input v-else v-model="scope.row.splitDbCode" ></el-input>
          </template>
          <span v-else>{{ scope.row.splitDbCode}}</span>
        </template>

      </el-table-column>
      <el-table-column align="center" label="分库策略">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-select v-model="scope.row.splitStrategy" class="filter-item" placeholder="Please select" @visible-change="getPickableSplitStrategy()">
              <el-option v-for="item in pickableSplitDbType" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
          </template>
          <span v-else>{{ scope.row.splitStrategy | splitDbFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="分库字段值">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input v-if="scope.row.splitStrategy==='DEFAULT_STRATEGY'" disabled v-model="scope.row.splitColumnValue"></el-input>
            <el-input v-else v-model="scope.row.splitColumnValue"></el-input>
          </template>
          <span v-else>{{ scope.row.splitColumnValue}}</span>
        </template>

      </el-table-column>
      <el-table-column align="center" label="存储编码">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-select v-model="scope.row.storageCode" class="filter-item" placeholder="Please select" v-on:visible-change="getPickableStorageList()">
              <el-option v-for="item in pickableStorageList" :key="item.storageCode" :label="item.storageName" :value="item.storageCode">
                <span style="float: left">{{ item.storageName }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.storageCode }}</span>
              </el-option>
            </el-select>
          </template>
          <span v-else>{{ scope.row.storageCode }}</span>
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
import { getLogDb, saveLogDb, pickableStorageList } from "@/api/logDb";
import waves from "@/directive/waves"; // waves directive
import { deepClone, objectMerge } from "@/utils";
import pageHead from "@/components/PageHead"; // secondary package based on el-pagination
import { mapGetters } from "vuex";

const splitDb = [
  {
    key: "DEFAULT_STRATEGY",
    display_name: "默认"
  },
  {
    key: "CUSTOM_STRATEGY",
    display_name: "自定义"
  }
];

const splitStat = [
  {
    key: "T",
    display_name: "是"
  },
  {
    key: "F",
    display_name: "否"
  }
];

export default {
  name: "logDb",
  directives: { waves },
  components: {
    pageHead
  },
  filters: {
    splitDbFilter(type) {
      let rs = splitDb.find(el => type === el.key);
      return rs ? rs.display_name : "";
    }
  },
  computed: {
    ...mapGetters(["roles"])
  },
  data() {
    return {
      baseInfo: {},
      splitDb,
      tableKey: 0,
      list: [],
      listLoading: true,
      curRowData: [],
      pickableStorageList: null,
      systemCode: "",
      storageType: "",
      splitStat,
      pickableSplitDbType: []
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
      getLogDb(this.$route.query).then(response => {
        if (response.data) {
          this.baseInfo = response.data;
          if (response.data.dbParamList) {
            response.data.dbParamList.forEach(dbParam => {
              // 标识此条数据为后台获取的
              dbParam.isFromSaved = true;
            });
            this.list = response.data.dbParamList;
          }
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
    checkRow(row) {
      return new Promise((resolve, reject) => {
        if (
          row.splitColumnValue === "" &&
          row.splitStrategy === "CUSTOM_STRATEGY"
        ) {
          this.$message.error("分库字段值未配置!");
          reject(false);
        }
        if (row.storageCode === "") {
          this.$message.error("存储编码不能为空!");
          reject(false);
        }
        if (row.splitDbCode === "") {
          this.$message.error("分库编码不能为空!");
          reject(false);
        }

        resolve(true);
      });
    },
    handleDel(index) {
      this.list.splice(index, 1);
    },
    handleSave() {
      if (this.checkData()) {
        this.list.forEach(el => {
          objectMerge(el, this.baseInfo, ["dbParamList"]);
        });
        this.baseInfo.dbParamList = this.list;
        saveLogDb(this.baseInfo).then(() => {
          this.goBack();
        });
      }
    },
    getPickableStorageList() {
      pickableStorageList(this.systemCode, this.storageType).then(response => {
        if (response.data) {
          this.pickableStorageList = response.data;
        }
      });
    },
    getPickableSplitStrategy() {
      this.pickableSplitDbType = [];
      this.pickableSplitDbType[0] = splitDb[0];
      this.pickableSplitDbType[1] = splitDb[1];
      // for (var index in this.list) {
      //   if (this.list[index].splitStrategy == this.splitDb[0].key) {
      //     this.pickableSplitDbType.splice(0, 1);
      //     break;
      //   }
      // }
    },
    checkData() {
      let obj = [];
      if (this.baseInfo.isSplit === "T") {
        if (this.baseInfo.splitColumn === "") {
          this.$message.error("分库字段不能为空！");
          return false;
        }
        /*if (
          !this.list.every(item => {
            item.splitColumnValue !== null;
          })
        ) {
          this.$message.error("分库字段存在未配置的项！");
          return false;
        }*/
      }
      if (this.list.length === 0) {
        this.$message.error("分库字段为是，分库列表至少配置一条");
        return false;
      }

      return true;
    }
  }
};
</script>
