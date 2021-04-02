<template>
  <div class="app-container">
    <div class="filter-container">
      <vp-input v-model="listQuery.centerName" placeholder="中心编码" style="width: 300px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <vp-button v-waves class="filter-item" type="primary" icon="vp-icon-search" @click="handleFilter">
        搜索
      </vp-button>
      <vp-button class="filter-item" style="margin-left: 10px;" type="primary" icon="vp-icon-edit" @click="handleCreate">
        添加KAFKA配置
      </vp-button>
    </div>

    <vp-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <vp-table-column label="中心编码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.centerName }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="KAFKA-BROKER地址" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.kfkAddr }}</span>
        </template>
      </vp-table-column>
      <vp-table-column label="KAFKA主题">
        <template slot-scope="{row}">
          <vp-tag>{{ row.topic }}</vp-tag>
        </template>
      </vp-table-column>
      <vp-table-column label="KAFKA-ZK">
        <template slot-scope="scope">
          <a>{{ scope.row.zk }}</a>
        </template>
      </vp-table-column>
      <vp-table-column label="操作" align="center" width="180px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <vp-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </vp-button>
          <vp-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </vp-button>
        </template>
      </vp-table-column>
    </vp-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <vp-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <vp-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="180px" style="width: 400px; margin-left:50px;">
        <vp-form-item label="KAFKA-BROKER" prop="storageCode">
          <vp-input v-model="temp.kfkAddr" />
        </vp-form-item>
        <vp-form-item label="KAFKA-主题" prop="storageName">
          <vp-input v-model="temp.topic" />
        </vp-form-item>
        <vp-form-item label="中心编码">
          <vp-input v-model="temp.centerName" />
        </vp-form-item>
        <vp-form-item label="KAFKA-ZK" prop="zk">
          <vp-input v-model="temp.zk" />
        </vp-form-item>
        <vp-form-item label="参数1" prop="param1">
          <vp-input v-model="temp.param1" />
        </vp-form-item>
        <vp-form-item label="参数2" prop="param2">
          <vp-input v-model="temp.param2" />
        </vp-form-item>
        <vp-form-item label="参数3" prop="param3">
          <vp-input v-model="temp.param3" />
        </vp-form-item>
        <vp-form-item label="参数4" prop="param4">
          <vp-input v-model="temp.param4" />
        </vp-form-item>
      </vp-form>
      <div slot="footer" class="dialog-footer">
        <vp-button @click="dialogFormVisible = false">
          取消
        </vp-button>
        <vp-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
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
  delStorage
} from "@/api/storage";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

const storageType = [
  {
    key: "ES",
    display_name: "ES"
  },
  {
    key: "oracle",
    display_name: "Oracle"
  },
  {
    key: "mysql",
    display_name: "MySql"
  }
];

export default {
  name: "storageConfig",
  components: { Pagination },
  directives: { waves },
  filters: {
    typeFilter(type) {
      return storageType.find(el => type === el.key).display_name;
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        centerName: undefined
      },
      storageType,
      temp: {
        centerName: "",
        kfkAddr: "",
        topic: "LOG-CUST  ",
        zk: "localhost:2181",
        param1: "",
        param2: "",
        param3: "",
        param4: ""
      },
      dialogStatus: "",
      textMap: {
        update: "修改",
        create: "新增"
      },
      dialogFormVisible: false,
      rules: {
        storageCode: [
          { required: true, message: "存储编码不能为空!", trigger: "change" }
        ],
        storageName: [
          { required: true, message: "存储名称不能为空!", trigger: "change" }
        ],
        storageUrl: [
          { required: true, message: "存储Url不能为空!", trigger: "change" }
        ]
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
        this.list = response.data.items;
        this.total = response.data.total;
        this.listLoading = false;
      });
      let mockList = {
        data: {
          items: [
            {
              centerName: "CUST",
              kfkAddr: "localhost:9292",
              type: "ES",
              topic: "LOG-CUST  ",
              zk: "localhost:2181"
            },
            {
              centerName: "PERSONAL",
              kfkAddr: "localhost:9292",
              type: "ES",
              topic: "LOG-PERSONAL",
              zk: "localhost:2181"
            },
            {
              centerName: "ESOP",
              kfkAddr: "localhost:9292",
              type: "ES",
              topic: "LOG-ESOP",
              zk: "localhost:2181"
            },
            {
              centerName: "NP",
              kfkAddr: "localhost:9292",
              type: "ES",
              topic: "LOG-NP",
              zk: "localhost:2181"
            }
          ]
        },
        total: 2
      };
      this.list = mockList.data.items;
      this.total = mockList.total;
      this.listLoading = false;
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    resetTemp() {
      this.temp = {
        storageCode: undefined,
        storageName: undefined,
        type: "ES",
        user: undefined,
        pws: undefined,
        storageUrl: ""
      };
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createStorage(this.temp).then(() => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Created Successfully",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateStorage(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, this.temp);
                break;
              }
            }
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Update Successfully",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleDelete(row) {
      this.$notify({
        title: "Success",
        message: "Delete Successfully",
        type: "success",
        duration: 2000
      });
      // 模拟删除，后续删除
      const index = this.list.indexOf(row);
      this.list.splice(index, 1);
      delStorage(row).then(() => {
        this.$notify({
          title: "Success",
          message: "Delete Successfully",
          type: "success",
          duration: 2000
        });
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    testConnect() {}
  }
};
</script>
