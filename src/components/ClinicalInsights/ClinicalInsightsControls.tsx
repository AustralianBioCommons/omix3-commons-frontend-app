import React, { useMemo, useState } from 'react';
import { ActionIcon, Collapse, Highlight, Input, Switch, Tooltip } from '@mantine/core';
import {
  MdChevronLeft,
  MdChevronRight,
  MdExpandLess,
  MdExpandMore,
  MdClose,
  MdSearch,
} from 'react-icons/md';

import type { ClinicalInsightsConfig } from './types';

type ClinicalInsightsControlsProps = {
  config: ClinicalInsightsConfig;
  activeFields: string[];
  onToggleField: (field: string) => void;
};

type GroupProps = {
  label: string;
  color: string;
  fields: ClinicalInsightsConfig['tabs'][number]['facets'];
  activeFields: string[];
  searchTerm: string;
  onToggleField: (field: string) => void;
};

const MAX_VISIBLE_FIELDS = 5;

const ControlGroup = ({
  label,
  color,
  fields,
  activeFields,
  searchTerm,
  onToggleField,
}: GroupProps) => {
  const [groupOpen, setGroupOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const filteredFields = useMemo(() => {
    if (!searchTerm) return fields;
    const term = searchTerm.toLowerCase();
    return fields.filter(
      (field) =>
        field.label.toLowerCase().includes(term) ||
        field.field.toLowerCase().includes(term) ||
        field.description?.toLowerCase().includes(term),
    );
  }, [fields, searchTerm]);

  const visibleFields = expanded ? filteredFields : filteredFields.slice(0, MAX_VISIBLE_FIELDS);

  if (filteredFields.length === 0) return null;

  return (
    <div className="rounded-2xl border border-base-lighter bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-t-2xl bg-[#1f1d3a] px-4 py-3 text-left text-primary-contrast"
        onClick={() => setGroupOpen((value) => !value)}
      >
        {groupOpen ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
        <span className="font-heading text-[1rem] font-semibold">{label}</span>
      </button>

      <Collapse in={groupOpen}>
        <div className="px-4 py-3">
          <ul className="space-y-2">
            {visibleFields.map((field) => (
              <li key={field.field}>
                <Switch
                  checked={activeFields.includes(field.field)}
                  onChange={() => onToggleField(field.field)}
                  label={
                    searchTerm ? (
                      <Highlight highlight={searchTerm}>{field.label}</Highlight>
                    ) : (
                      <Tooltip
                        label={field.description || field.field}
                        withArrow
                        multiline
                        w={260}
                      >
                        <span>{field.label}</span>
                      </Tooltip>
                    )
                  }
                  labelPosition="left"
                  color={color}
                  classNames={{
                    root: 'py-1',
                    body: 'flex justify-between items-center',
                    label: 'cursor-pointer text-[0.98rem] text-black font-content font-medium',
                    track: 'cursor-pointer',
                  }}
                />
              </li>
            ))}
          </ul>

          {filteredFields.length > MAX_VISIBLE_FIELDS ? (
            <button
              type="button"
              className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary"
              onClick={() => setExpanded((value) => !value)}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                +
              </span>
              {expanded ? 'Show less' : `${filteredFields.length - MAX_VISIBLE_FIELDS} more`}
            </button>
          ) : null}
        </div>
      </Collapse>
    </div>
  );
};

const ClinicalInsightsControls = ({
  config,
  activeFields,
  onToggleField,
}: ClinicalInsightsControlsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(true);

  const allFields = useMemo(() => config.tabs.flatMap((tab) => tab.facets), [config.tabs]);

  const fieldsWithValues = useMemo(() => allFields.length, [allFields]);

  return (
    <div className={expanded ? 'min-w-[22rem] max-w-[24rem]' : 'w-10'}>
      <div className="sticky top-4">
        <ActionIcon
          variant="subtle"
          color="blue"
          aria-label={expanded ? 'Hide Control Panel' : 'Show Control Panel'}
          onClick={() => setExpanded((value) => !value)}
          className="mb-2"
        >
          {expanded ? <MdChevronLeft size={22} /> : <MdChevronRight size={22} />}
        </ActionIcon>

        {expanded ? (
          <div>
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              leftSection={<MdSearch size={18} />}
              rightSection={
                searchTerm ? (
                  <ActionIcon variant="subtle" onClick={() => setSearchTerm('')}>
                    <MdClose size={16} />
                  </ActionIcon>
                ) : undefined
              }
              className="mb-3"
            />
            <p className="mb-4 px-2 font-heading text-[1.05rem]">
              <strong>{fieldsWithValues}</strong> of <strong>{allFields.length}</strong> fields with
              values
            </p>
            <div className="space-y-4">
              {config.tabs.map((tab) => (
                <ControlGroup
                  key={tab.label}
                  label={tab.label}
                  color={tab.color}
                  fields={tab.facets}
                  activeFields={activeFields}
                  searchTerm={searchTerm}
                  onToggleField={onToggleField}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ClinicalInsightsControls;
