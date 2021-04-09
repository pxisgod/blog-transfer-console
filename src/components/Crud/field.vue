<template>
  <el-input v-if="!fieldType||fieldType=='input'" v-model="value" :placeholder="placeholder"></el-input>
  <el-select v-else-if="fieldType=='select'" v-model="value" :placeholder="placeholder">
    <template v-for="(op,ii) in conf.options">
      <el-option v-bind="op" :key="ii"></el-option>
    </template>
  </el-select>
  <el-input v-else-if="fieldType=='textarea'" type="textarea" v-model="value" v-bind="conf" :placeholder="placeholder">
  </el-input>
  <el-time-select v-else-if="fieldType=='timeselect'" v-model="value" v-bind="conf" :placeholder="placeholder">
  </el-time-select>
  <el-time-picker v-else-if="fieldType=='timepicker'" v-model="value" v-bind="conf" :placeholder="placeholder">
  </el-time-picker>
  <el-date-picker v-else-if="fieldType=='datepicker'" v-model="value" v-bind="conf" :placeholder="placeholder">
  </el-date-picker>

</template>

<script>
export default {
  props: {
    // field: Object,
    fieldType: String,
    conf: {
      type: Object
    },
    v: {},
    placeholder: {
      type: String
    }
  },
  model: {
    prop: "v",
    event: "change"
  },
  data() {
    return {
      value: ""
    };
  },
  methods: {
    getData() {
      // return fieldData;
    }
  },
  created() {
    // 初始值设置
    this.value = this.v;
    // console.log(this.fieldType);
  },
  watch: {
    value(val) {
      this.$emit("change", val);
    },
    v(val) {
      this.value = val;
    }
  }
};
</script>

<style>
</style>
