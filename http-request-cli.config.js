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
    // controllerResolver: () => "app",
  },
];
