export default [
  {
    url: "/logRoute/getRouteByLogInfo",
    type: "post",
    response: config => {
      return require("./logRoute/getRouteByLogInfo.json");
    }
  },
  {
    url: "/logRoute/flushCache",
    type: "get",
    response: config => {
      return {
        code: "200",
        message: "缓存刷新成功"
      };
    }
  },
  {
    url: "/logRoute/saveRoute",
    type: "post",
    response: config => {
      return {
        code: "200",
        message: "缓存刷新成功"
      };
    }
  },
  {
    url: "/logRoute/getLogFilter",
    type: "get",
    response: config => {
      return {
        code: "200",
        data: {
          filterCode: "px_filter",
          filterId: 1,
          filterName: "px的filter",
          filterParamList: [
            {
              filterCode: "px_filter",
              filterId: 1,
              filterRule: "regex_filter",
              logType: "AUDIT_LOG_TYPE",
              operateType: "login",
              paramName: "px_name",
              paramType: "busi_info_col_type",
              paramValue: "pxisgod*",
              systemCode: "px"
            },
            {
              filterCode: "px_filter",
              filterId: 1,
              filterRule: "not_null_filter",
              logType: "AUDIT_LOG_TYPE",
              operateType: "login",
              paramName: "id",
              paramType: "busi_info_col_type",
              systemCode: "px"
            }
          ],
          logType: "AUDIT_LOG_TYPE",
          operateType: "login",
          systemCode: "px"
        },
        message: "获取过滤器信息成功"
      };
    }
  },
  {
    url: "/logRoute/getLogMapper",
    type: "get",
    response: config => {
      return {
        code: "200",
        data: {
          logType: "AUDIT_LOG_TYPE",
          mapperCode: "px_mapper",
          mapperId: 1,
          mapperName: "px的mapper",
          mapperParamList: [
            {
              destColumn: "name",
              destColumnType: "string",
              logType: "AUDIT_LOG_TYPE",
              mapperCode: "px_mapper",
              mapperId: 1,
              operateType: "login",
              sourceColumn: "px_name",
              systemCode: "px"
            },
            {
              destColumn: "id",
              destColumnType: "int",
              logType: "AUDIT_LOG_TYPE",
              mapperCode: "px_mapper",
              mapperId: 1,
              operateType: "login",
              sourceColumn: "id",
              systemCode: "px"
            }
          ],
          operateType: "login",
          systemCode: "px"
        },
        message: "获取映射器信息成功"
      };
    }
  },
  {
    url: "/logRoute/getLogGrade",
    type: "get",
    response: config => {
      return {
        code: "200",
        data: {
          logType: "AUDIT_LOG_TYPE",
          operateType: "login",
          systemCode: "px",
          threshold: 30,
          verifyCode: "px_verify",
          verifyId: 1,
          verifyParamList: [
            {
              columnName: "id",
              logType: "AUDIT_LOG_TYPE",
              operateType: "login",
              systemCode: "px",
              verifyCode: "px_verify",
              verifyId: 1,
              weight: 20
            },
            {
              columnName: "name",
              logType: "AUDIT_LOG_TYPE",
              operateType: "login",
              systemCode: "px",
              verifyCode: "px_verify",
              verifyId: 1,
              weight: 80
            }
          ]
        },
        message: "获取验证器信息成功"
      };
    }
  },
  {
    url: "/logRoute/getRouteInfo",
    type: "get",
    response: config => {
      return {
        code: "200",
        data: {
          logType: "AUDIT_LOG_TYPE",
          master: true,
          operateType: "login",
          routeCode: "px_route",
          routeId: 1,
          storageCode: "px_db",
          storageId: 1,
          storageTableCode: "px_table",
          storageTableId: 1,
          storageType: "DB_TYPE",
          systemCode: "px"
        },
        message: "获取路由信息成功"
      };
    }
  },
  {
    url: "/logStorage/pickableStorageList",
    type: "get",
    response: config => {
      return {
        code: "200",
        data: [{ storageId: 1, storageCode: "px_es" }],
        message: "可选存储列表查询成功"
      };
    }
  },
  {
    url: "/logStorage/pickableStorageTableList",
    type: "get",
    response: config => {
      return {
        code: "200",
        data: [{ storageTableId: 1, storageTableCode: "px_table" }],
        message: "可选存储列表查询成功"
      };
    }
  },
  {
    url: "/logRoute/getLogTable",
    type: "get",
    response: config => {
      return {
        code: "200",
        data: {
          routeId: 1,
          routeCode: "px",
          tableCode: "px_db",
          tableId: 1,
          tableName: "log_${regionId}",
          typeName: null,
          tableParamList: [
            {
              tableCode: "px_db",
              tableId: 1,
              routeId: 1,
              routeCode: "px",
              logType: "AUDIT_LOG_TYPE",
              operateType: "login",
              systemCode: "px",
              tableColName: "id",
              tableColType: "INTEGER",
              isPrimary: true,
              sequenceName: "log_571$seq"
            },
            {
              tableCode: "px_db",
              tableId: 1,
              routeId: 1,
              routeCode: "px",
              logType: "AUDIT_LOG_TYPE",
              operateType: "login",
              systemCode: "px",
              tableColName: "regionId",
              tableColType: "VARCHAR2()",
              isPrimary: false,
              sequenceName: null
            }
          ],
          logType: "AUDIT_LOG_TYPE",
          operateType: "login",
          systemCode: "px"
        },
        message: "获取表字段信息成功"
      };
    }
  },
  {
    url: "/logRoute/getLogDb",
    type: "get",
    response: config => {
      return {
        code: "200",
        data: {
          dbParamList: [
            {
              empty: false,
              logCode: "oracle",
              splitDbCode: "hyd02",
              splitStrategy: "DEFAULT_STRATEGY",
              storageCode: "oracle-test"
            }
          ],
          isSplit: "F",
          logCode: "oracle"
        },
        message: "获取分库信息成功"
      };
    }
  }
];
