<template>
  <div class="app-container">
    <div class="filter-container">
      <system-select v-model="listQuery.systemCode" class="filter-item"></system-select>

      <vp-button v-waves class="filter-item" type="primary" icon="vp-icon-search" @click="handleFilter">
        搜索
      </vp-button>
      <vp-button v-if="roles.includes('admin')" class="filter-item" style="margin-left: 10px;" type="primary" icon="vp-icon-edit" @click="handleCreate">
        添加存储配置
      </vp-button>
    </div>

    <vp-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <vp-table-column label="存储编码"  align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.storageCode }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="存储名称"  align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.storageName }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="存储类型" align="center">
        <template slot-scope="{row}">
          <vp-tag>{{ row.storageType | typeFilter }}</vp-tag>
        </template>
      </vp-table-column>
      <vp-table-column label="中心编码"  align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.systemCode }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="当前版本号" align="center" width="100px">
        <template slot-scope="scope">
          <a>{{ scope.row.version }}</a>
        </template>
      </vp-table-column>
      <vp-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <vp-button v-if="roles.includes('admin')" type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </vp-button>
          <vp-button v-else type="primary" size="mini" @click="handleView(row)">
            查看
          </vp-button>
          <vp-button size="mini" v-if="roles.includes('admin')" type="danger" @click="handleDelete(row.storageCode)">
            删除
          </vp-button>
          <vp-dropdown size="mini" type="primary" style="margin-left:10px;">
            <vp-button type="primary" size="mini">
              更多
            </vp-button>
            <vp-dropdown-menu slot="dropdown">
              <vp-dropdown-item @click.native="handleMaster(row)">主存储</vp-dropdown-item>
              <vp-dropdown-item @click.native="handleBackup(row)">备用存储</vp-dropdown-item>
            </vp-dropdown-menu>
          </vp-dropdown>
        </template>
      </vp-table-column>
    </vp-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageRequest.page" :limit.sync="listQuery.pageRequest.size" @pagination="getList" />

    <vp-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <vp-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="120px" style="width: 400px; margin-left:50px;">
        <vp-form-item label="中心编码" prop="systemCode">
          <system-select v-if="dialogStatus==='update'||dialogStatus==='view'" disabled v-model="temp.systemCode"></system-select>
          <system-select v-else v-model="temp.systemCode"></system-select>
        </vp-form-item>
        <vp-form-item label="存储类型">
          <div v-if="dialogStatus=='update'||dialogStatus==='view'">
            <vp-select v-model="temp.storageType" class="filter-item" placeholder="Please select" disabled>
              <vp-option v-for="item in storageType" :key="item.key" :label="item.display_name" :value="item.key" />
            </vp-select>
          </div>
          <div v-else>
            <vp-select v-model="temp.storageType" class="filter-item" placeholder="Please select">
              <vp-option v-for="item in storageType" :key="item.key" :label="item.display_name" :value="item.key" />
            </vp-select>
          </div>
        </vp-form-item>
        <vp-form-item v-if="dialogStatus==='update'||dialogStatus==='view'" label="存储编码" prop="storageCode">
          <vp-input v-model="temp.storageCode" disabled />
        </vp-form-item>
        <vp-form-item v-else label="存储编码" prop="storageCode">
          <vp-input v-model="temp.storageCode" />
        </vp-form-item>
        <vp-form-item v-if="dialogStatus==='view'" label="存储名称" prop="storageName">
          <vp-input v-model="temp.storageName" disabled/>
        </vp-form-item>
        <vp-form-item v-else label="存储名称" prop="storageName">
          <vp-input v-model="temp.storageName" />
        </vp-form-item>
        <div v-if="dialogStatus=='update'||dialogStatus==='view'">
          <vp-form-item label="版本编号">
            <vp-input v-model="temp.version" :disabled="true" />
          </vp-form-item>
        </div>
      </vp-form>
      <div slot="footer" class="dialog-footer">
        <vp-button @click="dialogFormVisible = false">
          取消
        </vp-button>
        <vp-button v-if="dialogStatus!='view'" type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </vp-button>
      </div>
    </vp-dialog>

    <vp-dialog :title="masterMap[isMaster]" :visible.sync="storageDialogVisible">
      <vp-form ref="storageDataForm" :rules="rules" :model="storageTemp" label-position="right" label-width="120px" style="width: 400px; margin-left:50px;">
        <vp-form-item label="存储编码" prop="storageCode">
          <vp-input v-model="storageTemp.storageCode" :disabled="true" />
        </vp-form-item>
        <vp-form-item  label="存储类型">
          <vp-input :value="storageTemp.storageType | typeFilter" disabled/>
        </vp-form-item>
        <vp-form-item v-if="roles.includes('admin')" label="存储URL" prop="url">
          <vp-input v-model="storageTemp.url" />
        </vp-form-item>
        <vp-form-item v-else label="存储URL" prop="url">
          <vp-input v-model="storageTemp.url" disabled="true"/>
        </vp-form-item>
        <vp-form-item v-if="roles.includes('admin')" label="用户名" prop="username">
          <vp-input v-model="storageTemp.username" />
        </vp-form-item>
        <vp-form-item v-else label="用户名" prop="username">
          <vp-input v-model="storageTemp.username" disabled="true"/>
        </vp-form-item>
        <vp-form-item v-if="roles.includes('admin')" label="密码" prop="password">
          <vp-input v-model="storageTemp.password" />
        </vp-form-item>
        <vp-form-item v-else label="密码" prop="password">
          <vp-input v-model="storageTemp.password" disabled/>
        </vp-form-item>
        <vp-form-item  v-if="roles.includes('admin')" label="状态">
          <template v-if="isMaster=='T'">
            <vp-select v-model="storageTemp.state" class="filter-item" placeholder="Please select">
              <vp-option v-for="item in masterStateType" :key="item.key" :label="item.display_name" :value="item.key" />
            </vp-select>
          </template>
          <template v-else="">
            <vp-select v-model="storageTemp.state" class="filter-item" placeholder="Please select">
              <vp-option v-for="item in stateType" :key="item.key" :label="item.display_name" :value="item.key" />
            </vp-select>
          </template>
        </vp-form-item>
        <vp-form-item v-else label="状态">
          <vp-input :value="storageTemp.state|stateTypeFilter" disabled="true" />
        </vp-form-item>
        <vp-form-item>
          <vp-button type="success" @click="testConnect(storageTemp)">
            连接测试
          </vp-button>
        </vp-form-item>
      </vp-form>
      <div slot="footer" class="dialog-footer">
        <vp-button @click="storageDialogVisible = false">
          取消
        </vp-button>
        <vp-button v-if="roles.includes('admin')" type="primary" @click="saveStorageParam()">
          保存
        </vp-button>
      </div>
    </vp-dialog>

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
