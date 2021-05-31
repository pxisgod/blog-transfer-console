<!--
<template>
  <div id="editor">
    <el-container style="height: 100%;">
      <el-input
        type="textarea"

        placeholder=""
        v-model="input" @input="update">
      </el-input>
      &lt;!&ndash;<textarea :value="input" @input="update"></textarea>&ndash;&gt;
      <div v-html="compiledMarkdown"></div>
    </el-container>
  </div>
</template>
<script>
  import marked from 'marked'
  import _ from "underscore"
  import { mavonEditor } from 'mavon-editor'
  import 'mavon-editor/dist/css/index.css'

  export default {
    name: "Blog",
    components: {},
    data() {
      return {input: ""}
    },
    computed: {
      compiledMarkdown: function () {
        return marked(this.input, {sanitize: true});
      }
    },
    methods: {
      update: _.debounce(function (e) {
        this.input = e.target.value;
      }, 300)
    }
  };
</script>
<style>
  html, body {
    margin: 0;
    height: 100%;
  }

  #editor {
    margin: 0;
    height: 100%;
    font-family: "Helvetica Neue", Arial, sans-serif;
    color: #333;
  }

  textarea,
  #editor div {
    display: inline-block;
    width: 49%;
    height: 100%;
    vertical-align: top;
    box-sizing: border-box;
    padding: 0 20px;
  }

  textarea {
    border: none;
    border-right: 1px solid #ccc;
    resize: none;
    outline: none;
    background-color: #f6f6f6;
    font-size: 14px;
    font-family: "Monaco", courier, monospace;
    padding: 20px;
  }

  code {
    color: #f66;
  }
</style>
-->


<template>
  <div>
    <el-input
      placeholder="请输入内容"
      v-model="blogUrl"
      clearable>
    </el-input>
    <el-select v-model="blogType" placeholder="博客类型">
      <el-option
        v-for="item in blogTypeList"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
    <el-button type="primary" @click="getBlog">获取博客</el-button>
    <mavon-editor
      v-model="content"
      ref="md"
      @change="change"
      style="min-height: 600px"
    />

    <button @click="submit">提交</button>
  </div>
</template>

<script>
import { mavonEditor } from "mavon-editor";
import "mavon-editor/dist/css/index.css";
import { getBlogContent } from "@/api/blog";

const blogTypeList = [
  {
    label: "CSDN博客",
    value: "CSDN_BLOG"
  },
  {
    label: "CNBLOG博客",
    value: "CNBLOG_BLOG"
  },
  {
    label: "简书博客",
    value: "JIANSHU_BLOG"
  }
];
export default {
  // 注册
  components: {
    mavonEditor
  },
  data() {
    return {
      content: "", // 输入的markdown
      html: "", // 及时转的html
      blogUrl: "",
      blogType: "CSDN_BLOG",
      blogTypeList
    };
  },
  methods: {
    getBlog() {
      getBlogContent({ blogType: this.blogType, blogUrl: this.blogUrl }).then(
        response => {
          this.content = response.data.content;
        }
      );
    },
    // 所有操作都会被解析重新渲染
    change(value, render) {
      // render 为 markdown 解析后的结果[html]
      this.html = render;
    },
    // 提交
    submit() {
      console.log(this.content);
      console.log(this.html);
    }
  },
  mounted() {}
};
</script>
