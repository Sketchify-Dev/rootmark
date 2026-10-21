"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import { shortHash } from "@/lib/format";

export interface Filters {
  vm: "all" | "evm" | "wasm";
  contract: string;
  event: string;
  address: string;
  fromBlock: string;
  toBlock: string;
}

export const EMPTY_FILTERS: Filters = {
  vm: "all",
  contract: "",
  event: "",
  address: "",
  fromBlock: "",
  toBlock: "",
};

export interface FilterErrors {
  address?: string;
  fromBlock?: string;
  toBlock?: string;
}

const ADDRESS_PATTERN = /^(0x[0-9a-fA-F]{40}|[1-9A-HJ-NP-Za-km-z]{46,48})$/;

export function validateFilters(filters: Filters): FilterErrors {
  const errors: FilterErrors = {};
  if (filters.address && !ADDRESS_PATTERN.test(filters.address.trim())) {
    errors.address = "Enter a 20 byte hex address (0x...) or a 32 byte SS58 address.";
  }
  const from = filters.fromBlock.trim();
  const to = filters.toBlock.trim();
  if (from && (!/^\d+$/.test(from) || Number(from) < 0)) {
    errors.fromBlock = "Block numbers are whole numbers.";
  }
  if (to && (!/^\d+$/.test(to) || Number(to) < 0)) {
    errors.toBlock = "Block numbers are whole numbers.";
  }
  if (!errors.fromBlock && !errors.toBlock && from && to && Number(from) > Number(to)) {
    errors.toBlock = "The end block must be at or after the start block.";
  }
  return errors;
}

export function filtersToQuery(filters: Filters) {
  return {
    vm: filters.vm === "all" ? undefined : filters.vm,
    contract: filters.contract || undefined,
    event: filters.event || undefined,
    address: filters.address.trim() || undefined,
    fromBlock: filters.fromBlock.trim() ? Number(filters.fromBlock) : undefined,
    toBlock: filters.toBlock.trim() ? Number(filters.toBlock) : undefined,
  };
}

export function QueryPanel({
  filters,
  onChange,
  onRun,
  onReset,
  running,
  facets,
  errors,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onRun: () => void;
  onReset: () => void;
  running: boolean;
  facets: {
    contracts: { contract: string; vm: string; count: number }[];
    events: { event: string; vm: string; count: number }[];
  } | null;
  errors: FilterErrors;
}) {
  const ids = {
    vm: useId(),
    event: useId(),
    contract: useId(),
    address: useId(),
    from: useId(),
    to: useId(),
  };

  const contracts = (facets?.contracts ?? []).filter(
    (item) => filters.vm === "all" || item.vm === filters.vm,
  );
  const events = (facets?.events ?? []).filter(
    (item) => filters.vm === "all" || item.vm === filters.vm,
  );

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <form
      className="rounded-[var(--radius-panel)] border border-line bg-surface p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onRun();
      }}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-12">
        <Field label="Environment" htmlFor={ids.vm} className="xl:col-span-2">
          <Select
            id={ids.vm}
            value={filters.vm}
            onChange={(event) => {
              onChange({ ...filters, vm: event.target.value as Filters["vm"], contract: "", event: "" });
            }}
          >
            <option value="all">Both VMs</option>
            <option value="evm">EVM (solidity)</option>
            <option value="wasm">WASM (ink!)</option>
          </Select>
        </Field>

        <Field label="Event" htmlFor={ids.event} className="xl:col-span-3">
          <Select
            id={ids.event}
            value={filters.event}
            onChange={(event) => set("event", event.target.value)}
          >
            <option value="">Any event</option>
            {events.map((item) => (
              <option key={`${item.vm}:${item.event}`} value={item.event}>
                {item.event} ({item.count})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Contract" htmlFor={ids.contract} className="col-span-2 xl:col-span-3">
          <Select
            id={ids.contract}
            value={filters.contract}
            onChange={(event) => set("contract", event.target.value)}
          >
            <option value="">Any contract</option>
            {contracts.map((item) => (
              <option key={`${item.vm}:${item.contract}`} value={item.contract}>
                {shortHash(item.contract, 6)} ({item.vm}, {item.count})
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Address"
          htmlFor={ids.address}
          error={errors.address}
          className="col-span-2 xl:col-span-2"
        >
          <TextInput
            id={ids.address}
            value={filters.address}
            placeholder="0x... or 5..."
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => set("address", event.target.value)}
          />
        </Field>

        <Field label="From block" htmlFor={ids.from} error={errors.fromBlock}>
          <TextInput
            id={ids.from}
            value={filters.fromBlock}
            inputMode="numeric"
            placeholder="earliest"
            className="tnum"
            onChange={(event) => set("fromBlock", event.target.value)}
          />
        </Field>

        <Field label="To block" htmlFor={ids.to} error={errors.toBlock}>
          <TextInput
            id={ids.to}
            value={filters.toBlock}
            inputMode="numeric"
            placeholder="latest"
            className="tnum"
            onChange={(event) => set("toBlock", event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <Button type="submit" variant="primary" loading={running}>
          {running ? "Querying" : "Run query"}
        </Button>
        <Button variant="ghost" onClick={onReset} disabled={running}>
          Reset
        </Button>
        <p className="hidden text-[12px] leading-[1.35] text-muted sm:block">
          Results come from the indexer, and every row can be checked against the chain.
        </p>
      </div>
    </form>
  );
}
