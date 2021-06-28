module.exports = {
  gateway: "http://gateway.local.xbt-dev.top",
  apiVersion: "v2",
  controllerDir: {
    alias: "@/http/controller",
    path: "./data/controller",
  },
  serviceDir: {
    alias: "@/http/services",
    path: "./data/services",
  },
  services: {
    "xbt-platform-dingtalk-service": "xbt-platform-dingtalk-service",
    "xbt-platform-salary-service": "xbt-platform-salary-service",
    "xbt-platform-kyb-service": "xbt-platform-kyb-service",
  },
};
