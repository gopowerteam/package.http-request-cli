module.exports = [
  {
    name: "default",
    gateway: "http://gateway.local.xbt-dev.top",
    swagger: "v2/api-docs",
    model: true,
    modelDir: {
      alias: "@/http/model", // 控制器目录名别
      path: "./data/model", // 控制器目录路径
    },
    controllerDir: {
      alias: "@/http/controller", // 控制器目录名别
      path: "./data/controller", // 控制器目录路径
    },
    serviceDir: {
      alias: "@/http/services", // 服务目录名别
      path: "./data/services", // 服务目录名别
    },
    services: {
      "communication-service": "xbt-platform-communication-service",
      "wechat-service": "xbt-platform-wxcp-service",
      "eky-service": "xbt-platform-data-service",
      "customer-service": "xbt-platform-customer-service",
    },
    alias: [
      {
        service: "wechat-service",
        from: "Department",
        to: "WechatDepartment",
      },
      {
        service: "customer-service",
        from: "ConsultationRecord",
        to: "WxConsultationRecord",
      },
      {
        service: "customer-service",
        from: "Appointment",
        to: "WxAppointment",
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
