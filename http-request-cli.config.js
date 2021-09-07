module.exports = [
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
