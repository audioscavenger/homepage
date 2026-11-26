import nineRouterProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: nineRouterProxyHandler,

  mappings: {
    providers: {
      endpoint: "providers",
    },
    models: {
      endpoint: "models",
    },
    combos: {
      endpoint: "combos",
    },
    usage: {
      endpoint: "usage/stats",
    },
  },
};

export default widget;
