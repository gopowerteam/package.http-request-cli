module.exports = [
  {
    gateway: "http://localhost:3000",
    swagger: "api-docs-json",
    controllerDir: {
      alias: "@/http/controller",
      path: "./data/controller",
    },
    serviceDir: {
      alias: "@/http/services",
      path: "./data/services",
    },
  },
  {
    name: "authorization",
    gateway: "https://authorization.local.xbt-dev.top",
    swagger: "api-docs-json",
    controllerDir: {
      alias: "@/http/controller/authorization-service", // 控制器目录名别
      path: "./src/http/controller/authorization-service", // 控制器目录路径
    },
    serviceDir: {
      alias: "@/http/services/authorization-service", // 服务目录名别
      path: "./src/http/services/authorization-service", // 服务目录名别
    },
    alias: {
      App: "Acc",
    },
  },
];
