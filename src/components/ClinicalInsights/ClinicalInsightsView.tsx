import React from 'react';
import ClinicalInsightsDashboard from './ClinicalInsightsDashboard';

import type { ClinicalInsightsConfig } from './types';

type ClinicalInsightsViewProps = {
  config: ClinicalInsightsConfig;
};

const ClinicalInsightsView = ({ config }: ClinicalInsightsViewProps) => {
  return <ClinicalInsightsDashboard config={config} />;
};

export default ClinicalInsightsView;
