module.exports = [
  {
    name: "default",
    gateway: "http://gateway.local.xbt-dev.top",
    swagger: "v2/api-docs",
    model: true,
    modelDir: {
      alias: "@/http/model", // 控制器目录名别
      path: "./src/http/model", // 控制器目录路径
    },
    controllerDir: {
      alias: "@/http/controller", // 控制器目录名别
      path: "./src/http/controller", // 控制器目录路径
    },
    serviceDir: {
      alias: "@/http/services", // 服务目录名别
      path: "./src/http/services", // 服务目录名别
    },
    services: {
      "communication-service": "xbt-platform-communication-service",
      "wechat-service": "xbt-platform-wxcp-service",
    },
    alias: [
      {
        service: "wechat-service",
        from: "Department",
        to: "WechatDepartment",
      },
    ],
  },
  {
    name: "authorization",
    gateway: "https://authorization.local.xbt-dev.top",
    swagger: "api-docs-json",
    controllerDir: {
      alias: "@/http/controller",
      path: "./data/controller",
    },
    serviceDir: {
      alias: "@/http/services",
      path: "./data/services",
    },
    alias: {
      from: "App",
      to: "Acc",
    },
  },
];
