import React from 'react';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import {
  ContentSource,
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';

import ClinicalInsightsView from '@/components/ClinicalInsights/ClinicalInsightsView';
import type { ClinicalInsightsConfig } from '@/components/ClinicalInsights/types';

type ClinicalInsightsPageProps = NavPageLayoutProps & {
  config: ClinicalInsightsConfig | null;
};

const fallbackHeaderMetadata = {
  title: 'OMIX3 Clinical Insights',
  content: 'Interactive clinical cohort dashboard',
  key: 'omix3-clinical-insights-page',
};

const ClinicalInsightsPage = ({
  headerProps,
  footerProps,
  config,
}: ClinicalInsightsPageProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        ...fallbackHeaderMetadata,
        ...((config?.headerMetadata as Record<string, unknown> | undefined) ?? {}),
      }}
    >
      {config ? (
        <ClinicalInsightsView config={config} />
      ) : (
        <div className="w-full px-6 py-10">
          <TextBlock
            title="Clinical Insights configuration could not be loaded."
            body="Check config/gen3/clinicalInsights.json and reload the page."
          />
        </div>
      )}
    </NavPageLayout>
  );
};

const TextBlock = ({ title, body }: { title: string; body: string }) => (
  <div className="rounded-md border border-base-light bg-white p-6">
    <h2 className="text-xl font-semibold">{title}</h2>
    <p className="mt-2 text-sm text-base-contrast-light">{body}</p>
  </div>
);

export const getServerSideProps: GetServerSideProps<ClinicalInsightsPageProps> =
  async () => {
    try {
      const config = await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/clinicalInsights.json`,
      );

      return {
        props: {
          ...(await getNavPageLayoutPropsFromConfig()),
          config: config as ClinicalInsightsConfig,
        },
      };
    } catch (error) {
      console.error(error);

      return {
        props: {
          ...(await getNavPageLayoutPropsFromConfig()),
          config: null,
        },
      };
    }
  };

export default ClinicalInsightsPage;
