<template>
  <div class="app-container" style="margin:24px 65px;">
    <page-head @back="goBack" content="同步刷新状态"></page-head>
    <div v-loading="!show" element-loading-text="数据加载中..." :style="!show ? 'height: 500px' : 'height: 100%'" class="app-container">
      <div v-if="show">
        <vp-card class="box-card" shadow="hover">
          <div class="log-page-head" style="color: #666;font-size: 16px;">
            <span>
              系统：{{ info.systemCode }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
            <span>
              刷新状态：
              <vp-tag :type=" info.refreshState | tagType" effect="dark">
                {{ info.refreshState | state }}
              </vp-tag>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
            <span>
              最近刷新时间：{{ getTime(info.refreshTime) }}
            </span>
            <i class="vp-icon-refresh" style="float:right;margin-right:10px;" @click="getFlushState"/>
          </div>
        </vp-card>
        <vp-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold;color: #666;font-size: 15px;">详细情况</span>
          </div>
          <vp-collapse>
            <template v-for="(item,i) in  info.refreshResultList">
              <vp-collapse-item :name="i" :key="item.logCode">
                <template slot="title">
                  <div class="log-collapse-item">
                    <h3 class="log-item-title">日志编码：{{item.logCode}}</h3>
                    <div class="log-item-info">
                      状态：
                      <vp-tag :type=" item.logRefreshState | tagType" effect="dark">
                        {{ item.logRefreshState | state }}
                      </vp-tag>
                    </div>
                    <div class="log-item-info" style="flex-basis: 500px;">
                      key：
                      <span>{{item.logCacheKey}}</span>
                    </div>
                  </div>
                </template>
                <div class="log-item-detail">
									<h4>错误信息：</h4>
									<code lang="log">
										{{item.errMessage}}
									</code>
                </div>
              </vp-collapse-item>
            </template>
          </vp-collapse>
        </vp-card>
      </div>
    </div>

  </div>
</template>

<script>
import { getFlushState } from "@/api/routeConfig";
import waves from "@/directive/waves"; // waves directive
import pageHead from "@/components/PageHead"; // secondary package based on el-pagination

const state = [
  {
    key: "REFRESH_SUCCESS",
    display_name: "刷新成功",
    tag: "success"
  },
  {
    key: "REFRESH_FAIL",
    display_name: "刷新失败",
    tag: "danger"
  },
  {
    key: "REFRESHING",
    display_name: "刷新中",
    tag: "warning"
  }
];

export default {
  name: "flushState",
  directives: { waves },
  components: {
    pageHead
  },
  filters: {
    state(type) {
      let rs = state.find(el => type === el.key);
      return rs ? rs.display_name : "";
    },
    tagType(type) {
      let rs = state.find(el => type === el.key);
      return rs ? rs.tag : "";
    }
  },
  data() {
    return {
      show: false,
      info: {
        systemCode: "sys",
        refreshState: "REFRESH_SUCCESS",
        refreshTime: Number(new Date()),
        refreshResultList: [
          {
            logCode: "logCode",
            logRefreshState: "REFRESH_FAIL",
            logCacheKey: "sadr34347r9qiu3hj4rhq987ftyqwah",
            errMessage: "报错信息"
          }
        ]
      }
    };
  },
  created() {
    this.getFlushState();
    this.show = true;
  },
  methods: {
    goBack() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.go(-1);
    },
    getFlushState() {
      getFlushState(this.$route.query).then(response => {
        if (response.data) {
          this.info = response.data;
        }
      });
    },
    getTime(timestamp) {
      return new Date(timestamp).toLocaleString();
    }
  }
};
</script>
<style scoped>
.log-collapse-item {
  flex-basis: 800px;
  line-height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.log-item-info {
  font-size: 13px;
  flex-basis: 200px;
}
.log-item-title {
  flex-basis: 250px;
}
.log-page-head > span:after {
  content: "";
  position: absolute;
  width: 1px;
  height: 16px;
  right: -20px;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  background-color: #dcdfe6;
}
</style>>
