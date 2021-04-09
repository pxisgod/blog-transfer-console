<template>
  <div class="app-container">
    <div class="filter-container">
      <system-select v-model="listQuery.systemCode" class="filter-item"></system-select>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-if="roles.includes('admin')" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加存储配置
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <el-table-column label="存储编码"  align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.storageCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="存储名称"  align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.storageName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="存储类型" align="center">
        <template slot-scope="{row}">
          <el-tag>{{ row.storageType | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="中心编码"  align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.systemCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前版本号" align="center" width="100px">
        <template slot-scope="scope">
          <a>{{ scope.row.version }}</a>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="roles.includes('admin')" type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-else type="primary" size="mini" @click="handleView(row)">
            查看
          </el-button>
          <el-button size="mini" v-if="roles.includes('admin')" type="danger" @click="handleDelete(row.storageCode)">
            删除
          </el-button>
          <el-dropdown size="mini" type="primary" style="margin-left:10px;">
            <el-button type="primary" size="mini">
              更多
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleMaster(row)">主存储</el-dropdown-item>
              <el-dropdown-item @click.native="handleBackup(row)">备用存储</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageRequest.page" :limit.sync="listQuery.pageRequest.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="中心编码" prop="systemCode">
          <system-select v-if="dialogStatus==='update'||dialogStatus==='view'" disabled v-model="temp.systemCode"></system-select>
          <system-select v-else v-model="temp.systemCode"></system-select>
        </el-form-item>
        <el-form-item label="存储类型">
          <div v-if="dialogStatus=='update'||dialogStatus==='view'">
            <el-select v-model="temp.storageType" class="filter-item" placeholder="Please select" disabled>
              <el-option v-for="item in storageType" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
          </div>
          <div v-else>
            <el-select v-model="temp.storageType" class="filter-item" placeholder="Please select">
              <el-option v-for="item in storageType" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='update'||dialogStatus==='view'" label="存储编码" prop="storageCode">
          <el-input v-model="temp.storageCode" disabled />
        </el-form-item>
        <el-form-item v-else label="存储编码" prop="storageCode">
          <el-input v-model="temp.storageCode" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='view'" label="存储名称" prop="storageName">
          <el-input v-model="temp.storageName" disabled/>
        </el-form-item>
        <el-form-item v-else label="存储名称" prop="storageName">
          <el-input v-model="temp.storageName" />
        </el-form-item>
        <div v-if="dialogStatus=='update'||dialogStatus==='view'">
          <el-form-item label="版本编号">
            <el-input v-model="temp.version" :disabled="true" />
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button v-if="dialogStatus!='view'" type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="masterMap[isMaster]" :visible.sync="storageDialogVisible">
      <el-form ref="storageDataForm" :rules="rules" :model="storageTemp" label-position="right" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="存储编码" prop="storageCode">
          <el-input v-model="storageTemp.storageCode" :disabled="true" />
        </el-form-item>
        <el-form-item  label="存储类型">
          <el-input :value="storageTemp.storageType | typeFilter" disabled/>
        </el-form-item>
        <el-form-item v-if="roles.includes('admin')" label="存储URL" prop="url">
          <el-input v-model="storageTemp.url" />
        </el-form-item>
        <el-form-item v-else label="存储URL" prop="url">
          <el-input v-model="storageTemp.url" disabled="true"/>
        </el-form-item>
        <el-form-item v-if="roles.includes('admin')" label="用户名" prop="username">
          <el-input v-model="storageTemp.username" />
        </el-form-item>
        <el-form-item v-else label="用户名" prop="username">
          <el-input v-model="storageTemp.username" disabled="true"/>
        </el-form-item>
        <el-form-item v-if="roles.includes('admin')" label="密码" prop="password">
          <el-input v-model="storageTemp.password" />
        </el-form-item>
        <el-form-item v-else label="密码" prop="password">
          <el-input v-model="storageTemp.password" disabled/>
        </el-form-item>
        <el-form-item  v-if="roles.includes('admin')" label="状态">
          <template v-if="isMaster=='T'">
            <el-select v-model="storageTemp.state" class="filter-item" placeholder="Please select">
              <el-option v-for="item in masterStateType" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
          </template>
          <template v-else="">
            <el-select v-model="storageTemp.state" class="filter-item" placeholder="Please select">
              <el-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
          </template>
        </el-form-item>
        <el-form-item v-else label="状态">
          <el-input :value="storageTemp.state|stateTypeFilter" disabled="true" />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="testConnect(storageTemp)">
            连接测试
          </el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="storageDialogVisible = false">
          取消
        </el-button>
        <el-button v-if="roles.includes('admin')" type="primary" @click="saveStorageParam()">
          保存
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  fetchList,
  createStorage,
  updateStorage,
  delStorage,
  checkLink,
  fetchStorage,
  fetchStorageParam,
  createStorageParam
} from "@/api/storage";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import systemSelect from "../log-system/systemSelect";
import { mapGetters } from "vuex";

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

const masterStateType = [
  {
    key: "E",
    display_name: "启用"
  }
];
const stateType = [
  {
    key: "E",
    display_name: "启用"
  },
  {
    key: "D",
    display_name: "停用"
  }
];
export default {
  name: "storageConfig",
  components: { Pagination, systemSelect },
  directives: { waves },
  filters: {
    typeFilter(type) {
      return storageType.find(el => type === el.key).display_name;
    },
    stateTypeFilter(type) {
      return stateType.find(el => type === el.key).display_name;
    }
  },
  computed: {
    ...mapGetters(["roles"])
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        systemCode: "",
        pageRequest: {
          page: 1,
          pageNumber: 0,
          size: 10
        }
      },
      storageType,
      temp: {
        systemCode: undefined,
        storageCode: undefined,
        storageName: undefined,
        storageType: "ORACLE_TYPE",
        version: 0
      },
      dialogStatus: "",
      textMap: {
        update: "修改",
        create: "新增",
        view: "查看"
      },
      dialogFormVisible: false,
      stateType,
      masterStateType,
      isMaster: "T",
      masterMap: {
        T: "主存储",
        F: "备用存储"
      },
      storageDialogVisible: false,
      storageTemp: {
        storageCode: undefined,
        storageType: "ORACLE_TYPE",
        state: "E",
        url: "",
        username: "",
        password: "",
        isMaster: "T"
      },
      rules: {
        storageCode: [
          { required: true, message: "存储编码不能为空!", trigger: "blur" }
        ],
        storageName: [
          { required: true, message: "存储名称不能为空!", trigger: "blur" }
        ]
      },
      rules2: {
        storageCode: [
          { required: true, message: "存储编码不能为空!", trigger: "blur" }
        ],
        storageName: [
          { required: true, message: "存储名称不能为空!", trigger: "blur" }
        ],
        state: [{ required: true, message: "状态不能为空!", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getList();
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
    handleMaster(row) {
      this.resetStorageTemp();
      this.isMaster = "T";
      this.state = "E";
      fetchStorageParam(row.storageCode, this.isMaster).then(response => {
        this.storageTemp = Object.assign({}, response.data); // copy obj
        this.storageTemp.timestamp = new Date(this.temp.timestamp);
        this.storageTemp.storageCode = row.storageCode;
        this.storageTemp.storageType = row.storageType;
        this.storageDialogVisible = true;
        this.storageTemp.isMaster = "T";
        this.$nextTick(() => {
          this.$refs["storageDataForm"].clearValidate();
        });
      });
    },
    handleBackup(row) {
      this.resetStorageTemp();
      this.isMaster = "F";
      this.state = "D";
      fetchStorageParam(row.storageCode, this.isMaster).then(response => {
        this.storageTemp = Object.assign({}, response.data); // copy obj
        this.storageTemp.timestamp = new Date(this.temp.timestamp);
        this.storageTemp.storageCode = row.storageCode;
        this.storageTemp.storageType = row.storageType;
        this.storageDialogVisible = true;
        this.storageTemp.isMaster = "F";
        this.$nextTick(() => {
          this.$refs["storageDataForm"].clearValidate();
        });
      });
    },
    saveStorageParam() {
      this.$refs["storageDataForm"].validate(valid => {
        if (valid) {
          this.storageTemp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.storageTemp.author = "vue-element-admin";
          createStorageParam(this.storageTemp).then(() => {
            this.storageDialogVisible = false;
            this.$notify({
              title: "Success",
              message: "Created Successfully",
              type: "success",
              duration: 2000
            });
            this.getList();
          });
        }
      });
    },
    resetTemp() {
      this.temp = {
        systemCode: undefined,
        storageCode: undefined,
        storageName: undefined,
        storageType: "ORACLE_TYPE",
        version: 0
      };
    },
    resetStorageTemp() {
      this.storageTemp = {
        storageCode: undefined,
        storageType: "ORACLE_TYPE",
        state: "E",
        url: "",
        username: "",
        password: "",
        isMaster: "T"
      };
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createStorage(this.temp).then(() => {
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Created Successfully",
              type: "success",
              duration: 2000
            });
            this.getList();
          });
        }
      });
    },
    handleUpdate(row) {
      fetchStorage(row.storageCode).then(response => {
        this.temp = Object.assign({}, response.data); // copy obj
        this.temp.timestamp = new Date(this.temp.timestamp);
        this.dialogStatus = "update";
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs["dataForm"].clearValidate();
        });
      });
    },
    handleView(row) {
      fetchStorage(row.storageCode).then(response => {
        this.temp = Object.assign({}, response.data); // copy obj
        this.temp.timestamp = new Date(this.temp.timestamp);
        this.dialogStatus = "view";
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs["dataForm"].clearValidate();
        });
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          updateStorage(tempData).then(() => {
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Update Successfully",
              type: "success",
              duration: 2000
            });
            this.getList();
          });
        }
      });
    },
    handleDelete(row) {
      delStorage(row).then(res => {
        this.$notify({
          title: "Success",
          message: res.message,
          type: "success",
          duration: 2000
        });
        this.getList();
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    testConnect(link) {
      const tempData = Object.assign({}, link);
      tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      checkLink(tempData).then(res => {
        this.$message({ type: "success", message: res.message });
      });
    }
  }
};
</script>
