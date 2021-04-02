<template>
  <vp-input v-if="!fieldType||fieldType=='input'" v-model="value" :placeholder="placeholder"></vp-input>
  <vp-select v-else-if="fieldType=='select'" v-model="value" :placeholder="placeholder">
    <template v-for="(op,ii) in conf.options">
      <vp-option v-bind="op" :key="ii"></vp-option>
    </template>
  </vp-select>
  <vp-input v-else-if="fieldType=='textarea'" type="textarea" v-model="value" v-bind="conf" :placeholder="placeholder">
  </vp-input>
  <vp-time-select v-else-if="fieldType=='timeselect'" v-model="value" v-bind="conf" :placeholder="placeholder">
  </vp-time-select>
  <vp-time-picker v-else-if="fieldType=='timepicker'" v-model="value" v-bind="conf" :placeholder="placeholder">
  </vp-time-picker>
  <vp-date-picker v-else-if="fieldType=='datepicker'" v-model="value" v-bind="conf" :placeholder="placeholder">
  </vp-date-picker>

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
