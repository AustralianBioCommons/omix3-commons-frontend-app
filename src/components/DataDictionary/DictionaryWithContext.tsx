'use client';

import { useEffect, useState } from 'react';
import { useGetDictionaryQuery } from '@gen3/core';
import { Loader, Text } from '@mantine/core';
import type { DataDictionary, DictionaryConfig } from '@gen3/frontend';
import DictionaryProvider from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/DictionaryProvider.js';
import { removeUnusedFieldsFromDictionaryObject } from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/utils.js';
import DictionaryShell from './DictionaryShell';

type DictionaryWithContextProps = {
  config: DictionaryConfig;
};

const DictionaryWithContext = ({ config }: DictionaryWithContextProps) => {
  const { data, isFetching, isUninitialized, isLoading, isError, isSuccess } =
    useGetDictionaryQuery();
  const [dictionary, setDictionary] = useState<DataDictionary>({});

  useEffect(() => {
    if (isSuccess) {
      setDictionary(removeUnusedFieldsFromDictionaryObject(data));
    }
  }, [data, isSuccess]);

  if (isLoading || isFetching || isUninitialized || Object.keys(dictionary).length === 0) {
    return (
      <div className="relative flex w-full justify-center py-24">
        <Loader variant="dots" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative flex h-full w-full justify-center py-24">
        <Text size="xl">Error loading data dictionary</Text>
      </div>
    );
  }

  return (
    <DictionaryProvider config={config} dictionary={dictionary}>
      <DictionaryShell />
    </DictionaryProvider>
  );
};

export default DictionaryWithContext;
