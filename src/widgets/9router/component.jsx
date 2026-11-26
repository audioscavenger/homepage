import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

export default function Component({ service: configuredService }) {
  const service = withWidgetFields(configuredService, ["providers", "models", "combos", "status"]);
  const { widget } = service;

  const { data: providersData, error: providersError } = useWidgetAPI(widget, "providers");
  const { data: modelsData, error: modelsError } = useWidgetAPI(widget, "models");
  const { data: combosData, error: combosError } = useWidgetAPI(widget, "combos");

  const error = providersError || modelsError || combosError;

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!providersData || !modelsData || !combosData) {
    return (
      <Container service={service}>
        <Block label="9router.providers" />
        <Block label="9router.models" />
        <Block label="9router.combos" />
        <Block label="9router.status" />
      </Container>
    );
  }

  const connections = providersData.connections ?? [];
  const activeConnections = connections.filter(
    (connection) => connection?.isActive === true && connection?.testStatus !== "unavailable",
  );
  const activeProviders = new Set(
    activeConnections.map((connection) => connection?.provider).filter(Boolean),
  ).size || activeConnections.length;
  const models = (modelsData.models ?? []).filter((model) => {
    const caps = model?.caps ?? {};
    return (
      caps.reasoning === true ||
      caps.vision === true ||
      caps.search === true ||
      caps.tools === true ||
      (caps.contextWindow ?? 0) >= 131072
    );
  }).length;
  const combos = combosData.combos?.length ?? 0;
  const status = activeConnections.length > 0 ? "OK" : "Down";

  return (
    <Container service={service}>
      <Block label="9router.providers" value={providers} />
      <Block label="9router.models" value={models} />
      <Block label="9router.combos" value={combos} />
      <Block label="9router.status" value={status} />
    </Container>
  );
}
