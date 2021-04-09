<template>
  <el-select v-model="value"  filterable placeholder="中心名称" :disabled=disabled  :clearable=clearable|clearTypeFilter >
    <el-option
      v-for="item in options"
      :key="item.systemCode"
      :label="item.systemName"
      :value="item.systemCode">
    </el-option>
  </el-select>
</template>

<script>
import { getAll } from "../../api/logSystem";
const clearType = [
  {
    key: "T",
    display_name: true
  },
  {
    key: "F",
    display_name: false
  }
];
export default {
  props: {
    v: {
      type: String | Array
    },
    disabled: {
      default: false
    },
    clearable: {
      default: "F"
    }
  },
  model: {
    prop: "v",
    event: "change"
  },
  filters: {
    clearTypeFilter(type) {
      let rs = clearType.find(el => type === el.key);
      return rs ? rs.display_name : type;
    }
  },
  data() {
    return {
      value: "",
      options: [],
      clearType
    };
  },
  watch: {
    value(val) {
      this.$emit("change", val);
    },
    v(val) {
      this.value = val;
    }
  },
  methods: {
    getOptions() {
      getAll().then(rs => {
        this.options = rs;
        if (this.options.length != 0) {
          this.value = this.options[0].systemCode;
        }
        console.log(this.options);
      });
    },
    getValue() {
      return this.value;
    }
  },
  created() {
    this.getOptions();
    this.value = this.v;
  }
};
</script>

<style>
</style>
