<template>
  <div class="el-page-header">
    <div class="el-page-header__left" @click="back()">
      <i class="el-icon-back"></i>
      <div class="el-page-header__title">返回</div>
    </div>
    <div class="el-page-header__content">{{content}}</div>
  </div>
</template>

<script>
export default {
  props: {
    content: String
  },
  methods: {
    back() {
      this.$emit("back");
    }
  }
};
</script>

<style>
.el-page-header {
  display: flex;
  line-height: 24px;
  padding-bottom: 16px;
}
.el-page-header__left {
  display: flex;
  cursor: pointer;
  margin-right: 40px;
  position: relative;
}
.el-page-header__left {
  display: flex;
  cursor: pointer;
  margin-right: 40px;
  position: relative;
}
.el-page-header__content {
  font-size: 18px;
  color: #303133;
}
.el-page-header__left:after {
  content: "";
  position: absolute;
  width: 1px;
  height: 16px;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #dcdfe6;
}
.el-page-header__left .el-icon-back {
  font-size: 18px;
  margin-right: 6px;
  align-self: center;
}
</style>
