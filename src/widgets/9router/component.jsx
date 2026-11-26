import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

import { ALIAS_TO_PROVIDER_ID } from "./provider-aliases";

export default function Component({ service: configuredService }) {
  const service = withWidgetFields(configuredService, ["providers", "models", "combos", "activeRequests"]);
  const { widget } = service;

  const { data: providersData, error: providersError } = useWidgetAPI(widget, "providers");
  const { data: modelsData, error: modelsError } = useWidgetAPI(widget, "models");
  const { data: combosData, error: combosError } = useWidgetAPI(widget, "combos");
  const { data: usageData, error: usageError } = useWidgetAPI(widget, "usage");

  const error = providersError || modelsError || combosError || usageError;

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!providersData || !modelsData || !combosData || !usageData) {
    return (
      <Container service={service}>
        <Block label="9router.providers" />
        <Block label="9router.models" />
        <Block label="9router.combos" />
        <Block label="9router.activeRequests" />
      </Container>
    );
  }

  const connections = providersData.connections ?? [];
  const activeConnections = connections.filter(
    (connection) => connection?.isActive === true && connection?.testStatus !== "unavailable",
  );
  const activeProviderIds = new Set(
    providersData
      ? [...activeConnections.map((connection) => connection?.provider).filter(Boolean), "opencode"]
      : [],
  );
  const activeProviders = activeProviderIds.size;
  const models = (modelsData.models ?? []).filter((model) => {
    const caps = model?.caps ?? {};
    const isLlm =
      caps.reasoning === true ||
      caps.vision === true ||
      caps.search === true ||
      caps.tools === true ||
      (caps.contextWindow ?? 0) >= 131072;
    const providerId = ALIAS_TO_PROVIDER_ID[model?.provider] ?? model?.provider;
    return isLlm && activeProviderIds.has(providerId);
  }).length;
  const combos = combosData.combos?.length ?? 0;
  const activeRequests = (usageData.activeRequests ?? []).reduce(
    (total, request) => total + (request?.count ?? 1),
    0,
  );

  return (
    <Container service={service}>
      <Block label="9router.providers" value={activeProviders} />
      <Block label="9router.models" value={models} />
      <Block label="9router.combos" value={combos} />
      <Block label="9router.activeRequests" value={activeRequests} />
    </Container>
  );
}
