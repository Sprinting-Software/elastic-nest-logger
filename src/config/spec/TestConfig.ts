import { RetailCommonConfigProvider } from "../RetailCommonConfigProvider"

const SYSTEM_NAME = "testSystemName"
export const TestConfigRaw = {
  systemName: SYSTEM_NAME,
  envPrefix: "",
  enableConsoleLogs: false,
  elk: {
    apm: {
      serviceName: SYSTEM_NAME,
      serverUrl: "localhost:8200",
      centralConfig: false,
      captureExceptions: false,
      enableLogs: false,
      labels: { someLabel: "someKey" },
      metricsInterval: "30s",
    },
    logstash: { host: "", isEnabled: false, port: 0 },
  },
}
export const TestConfig: RetailCommonConfigProvider = new RetailCommonConfigProvider(TestConfigRaw)
