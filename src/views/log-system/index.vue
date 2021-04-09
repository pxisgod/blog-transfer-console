<template>
  <div>
    <Crud ref="curd" :columns="columns" :config="config" :getData="getList" :add="add"></Crud>
    <el-dialog :title="dialog.title" :visible.sync="dialog.visible" width="450px">
      <el-form ref="dataForm" :rules="rules" :model="infoForm" label-position="right" label-width="80px">
        <el-form-item label="中心编码" prop="systemCode">
          <el-input v-if="dialog.title=='新增'" v-model="infoForm.systemCode" />
          <el-input v-else v-model="infoForm.systemCode" :disabled="true"/>
        </el-form-item>
        <el-form-item label="中心名称" prop="systemName">
          <el-select filterable clearable
                     v-model="infoForm.systemName"  placeholder="中心名称" @change="systemChange"
                     @input.native="systemTextChange" ref="searchSelect" >
            <el-option
              v-for="item in systemList"
              :key="item.systemName"
              :label="item.systemName"
              :value="item.systemName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="中心ID" prop="systemId" >
          <el-input v-model="infoForm.systemId" :disabled="true"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialog.title==='新增'?createData():updateData()">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Crud from "../../components/Crud";
import {
  getList,
  create,
  update,
  del,
  getPickableSystemList
} from "../../api/logSystem";
export default {
  components: { Crud },
  data() {
    let that = this;
    return {
      systemList: [],
      dialog: {
        title: "新增",
        visible: false
      },
      infoForm: {},
      rules: {
        systemCode: [
          { required: true, message: "中心编码不能为空!", trigger: "blur" }
        ],
        systemName: [
          { required: true, message: "中心名称不能为空!", trigger: "blur" }
        ]
      },
      columns: [
        {
          label: "中心编码",
          prop: "systemCode",
          query: true
        },
        {
          label: "中心名称",
          prop: "systemName",
          query: true
        },
        {
          label: "中心ID",
          prop: "systemId",
          query: true
        },
        {
          label: "操作",
          opreate: true,
          button: [
            {
              type: "primary",
              size: "small",
              fa: "fa-co",
              label: "修改",
              click(i, row) {
                that.update(i, row);
              }
            },
            {
              type: "danger",
              size: "small",
              fa: "fa-co",
              label: "删除",
              click(i, row) {
                that.del(i, row);
              }
            }
          ]
        }
      ],
      config: {
        formName: "logSystem",
        tbopt: {
          border: true,
          fit: true,
          "highlight-current-row": true
        },
        queryopt: {},
        dialogopt: {}
      }
    };
  },
  methods: {
    getList,
    add: function() {
      this.dialog.title = "新增";
      this.dialog.visible = true;
      this.infoForm = {};
    },
    update(i, row) {
      this.dialog.title = "修改";
      this.dialog.visible = true;
      this.infoForm = Object.assign({}, row);
    },
    del(i, row) {
      del(row).then(res => {
        this.$notify({
          title: "Success",
          message: res.message,
          type: "success",
          duration: 2000
        });
        this.$refs.curd.getTbData();
      });
    },
    createData() {
      this.$refs.dataForm.validate().then(() => {
        create(this.infoForm).then(() => {
          this.dialog.visible = false;
          this.$notify({
            title: "Success",
            message: "Created Successfully",
            type: "success",
            duration: 2000
          });
          this.$refs.curd.getTbData();
        });
      });
    },
    updateData() {
      this.$refs.dataForm.validate().then(() => {
        update(this.infoForm).then(() => {
          this.dialog.visible = false;
          this.$notify({
            title: "Success",
            message: "Update Successfully",
            type: "success",
            duration: 2000
          });
          this.$refs.curd.getTbData();
        });
      });
    },
    systemChange() {
      console.log(this.infoForm.systemName);
      for (var index in this.systemList) {
        if (this.systemList[index].systemName == this.infoForm.systemName) {
          this.infoForm.systemId = this.systemList[index].systemId;
          //this.infoForm.systemCode=this.systemList[index].systemCode;
          break;
        }
      }
    },
    systemTextChange() {
      var queryText = this.$refs.searchSelect.$data.selectedLabel;
      if (queryText == null) {
        queryText = "";
      }
      var data = { queryText: queryText };
      getPickableSystemList(data).then(response => {
        this.systemList = response.data;
      });
    }
  }
};
</script>

<style>
</style>
