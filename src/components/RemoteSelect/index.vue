<template>
  <vp-select v-model="value" :filterable="search" @change="changeFunc" remote reserve-keyword placeholder="请输入关键词" :remote-method="remoteMethod" :loading="loading">
    <vp-option v-for="item in options" :key="item[valueKey]" :label="item[labelKey]" :value="item[valueKey]">
    </vp-option>
  </vp-select>
</template>

<script>
export default {
  data() {
    return {
      value: "",
      loading: false,
      options: []
    };
  },
  props: {
    v: [Number, String],
    // 参数
    search: {
      type: Boolean,
      default: true
    },
    labelKey: String,
    valueKey: String,
    apiFunc: Function
  },
  model: {
    prop: "v",
    event: "change"
  },
  watch: {
    value(val) {
      this.$emit("change", val);
    },
    v: {
      handler(val, oldval) {
        this.value = val;
      }
    }
  },
  methods: {
    remoteMethod(query) {
      this.loading = true;
      this.apiFunc(query).then(rs => {
        this.loading = false;
        this.options = rs;
      });
    },
    getMatchedOption() {
      return this.options.find(el => {
        return el[this.valueKey] === this.value;
      });
    },
    changeFunc() {
      this.$emit("change", this.getMatchedOption());
    }
  }
};
</script>

<style>
</style>
