export type ClinicalInsightsFacet = {
  field: string;
  label: string;
  description?: string;
};

export type ClinicalInsightsTab = {
  label: string;
  color: string;
  purpose?: string;
  facets: ClinicalInsightsFacet[];
};

export type ClinicalInsightsConfig = {
  index: string;
  dataTypename: string;
  uniqueIdField: string;
  title: string;
  description: string;
  explorerHref?: string;
  pageNote?: string;
  initialFields: string[];
  tabs: ClinicalInsightsTab[];
  interactionModel?: {
    name: string;
    status: string;
    summary: string;
  };
  headerMetadata?: Record<string, unknown>;
};
