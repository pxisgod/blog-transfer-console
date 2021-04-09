<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="中心" min-width="200">
      <template slot-scope="scope">
        {{ scope.row.systemCode }}
      </template>
    </el-table-column>
    <el-table-column label="日志总量" align="center">
      <template slot-scope="scope">
        {{ scope.row.logNum }}
      </template>
    </el-table-column>
    <el-table-column label="成功量"  align="center">
      <template slot-scope="{row}">
        <el-tag type="success">
          {{ row.successNum }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="过滤量"  align="center">
      <template slot-scope="{row}">
        <el-tag type="info">
          {{ row.filterNum }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="失败量"  align="center">
      <template slot-scope="{row}">
        <el-tag type="danger">
          {{ row.errNum }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { statCenter } from "@/api/logStat";

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: "success",
        pending: "danger"
      };
      return statusMap[status];
    },
    orderNoFilter(str) {
      return str.substring(0, 30);
    }
  },
  data() {
    return {
      list: null
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      statCenter().then(response => {
        this.list = response.data.slice(0, 8);
      });
    }
  }
};
</script>
