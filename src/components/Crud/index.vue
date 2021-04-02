<template>
  <div class="app-container">
    <div class="filter-container">
      <vp-form ref="searchForm" v-bind="config.queryopt?config.queryopt:{}" :model="searchFormDta" size="middle"
               style="width:100%;">
        <system-select v-model="searchFormDta['systemCode']" class="filter-item" clearable="T"></system-select>
        <!--<Field :fieldType="col.queryType" v-model="searchFormDta[col.prop]" :conf="col.queryFieldConf" :placeholder="col.label"></Field>-->
        <vp-button class="filter-item" type="primary" icon="vp-icon-search" @click="handleFilter">
          搜索
        </vp-button>
        <vp-button class="filter-item" style="margin-left: 10px;" type="primary" icon="vp-icon-edit" @click="add">
          添加
        </vp-button>
      </vp-form>
    </div>
    <vp-table v-bind="config.tbopt" v-loading="loading" :data="tableData" tooltip-effect="dark">
      <template v-for="(col,index) in columns">
        <vp-table-column v-if="col.opreate" v-bind="col" :key="index">
          <!-- <template slot="header" slot-scope="slot"> -->
          <!-- 操作 -->
          <!-- <vp-input v-model="search" size="mini" placeholder="Type to search" /> -->
          <!-- </template> -->
          <template v-if="col.button" slot-scope="scope">
            <template v-for="(btn,ii) in col.button">
              <vp-button v-if="!isMoreBtn(ii,col)" v-bind="btn" @click="btn.click(scope.$index, scope.row)" :key="ii">
                <i v-if="btn.fa" :class="btn.fa"></i>
                {{btn.label}}
              </vp-button>
            </template>
            <vp-dropdown v-if="isMore(col)" :size="TBCONF.size">
              <span class="el-dropdown-link">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <vp-dropdown-menu slot="dropdown">
                <template v-for="(btn,ii) in col.button">
                  <vp-dropdown-item v-if="isMoreBtn(ii,col)" v-bind="btn"
                                    @click.native="btn.click(scope.$index, scope.row)" :key="ii">{{btn.label}}
                  </vp-dropdown-item>
                </template>
              </vp-dropdown-menu>
            </vp-dropdown>
          </template>
        </vp-table-column>
        <vp-table-column v-else-if="col.tag" v-bind="col" :key="index">
          <template slot-scope="scope">
            <vp-tag :type="col.tagConf.getType(scope.row)" size="small ">{{col.tagConf.getText(scope.row)}}</vp-tag>
          </template>
        </vp-table-column>
        <vp-table-column v-else-if="col.custom" v-bind="col" :key="index">
          <template slot-scope="scope">
            <div v-html="col.custom(scope.row)"></div>
          </template>
        </vp-table-column>
        <vp-table-column v-else v-bind="col" :key="index">
        </vp-table-column>
      </template>
    </vp-table>
    <div class="ai-pagination-con">
      <vp-pagination @size-change="sizeChange" @current-change="pageChange" :current-page="currentPage"
                     :page-sizes="pageList" :page-size="currentSize" layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </vp-pagination>
    </div>
  </div>
</template>

<script>
import Field from "./field";
import systemSelect from "../../views/log-system/systemSelect";

export default {
  components: { Field, systemSelect },
  props: {
    columns: {
      type: Array,
      required: true
    },
    config: {
      type: Object
    },
    getData: {
      type: Function
    },
    queryParams: {
      type: Object,
      default: function() {
        return {};
      }
    },
    handleDta: {
      type: Function,
      default: function(rsp) {
        return {
          data: rsp.data.list,
          total: rsp.data.total
        };
      }
    },
    add: Function
  },
  computed: {
    searchField: function() {
      return this.columns.filter(el => {
        return el.query === true;
      });
    },
    size: function() {
      return this.config.size ? this.config.size : "mini";
    }
  },
  data() {
    return {
      searchFormDta: {},
      tableData: [],
      currentPage: 1,
      currentSize: 10,
      pageList: [10, 20, 30],
      total: 0
    };
  },
  created() {
    this.getTbData();
  },
  methods: {
    getTbData() {
      /*
        if (this.data) {
          this.tableDta = this.data;
          return false;
        }
        */

      this.loading = true;

      let param = {
        pageRequest: {
          page: this.currentPage,
          pageNumber: this.currentPage,
          size: this.currentSize
        }
      };

      param[this.config.formName] = Object.assign(
        {},
        this.queryParams,
        this.searchFormDta
      );

      this.getData(param).then(rsp => {
        this.loading = false;
        let { data, total } = this.handleDta(rsp);
        this.tableData = data;
        //分页信息赋值
        if (this.pagenation) {
          this.total = total;
        }
      });
    },
    handleFilter() {
      this.getTbData();
    },
    sizeChange(cur) {
      this.currentSize = cur;
      this.getTbData();
    },
    pageChange(cur) {
      this.currentPage = cur;
      this.getTbData();
    },
    // 判断是否有更多操作
    isMore(col) {
      let num = col.buttonNum ? col.buttonNum : 3;
      let l = col.button.length;
      if (num > l - 1) return false;
      else return true;
    },
    isMoreBtn(l, col) {
      let num = col.buttonNum ? col.buttonNum : 3;
      if (num > l) return false;
      else return true;
    }
  }
};
</script>

<style>
</style>
