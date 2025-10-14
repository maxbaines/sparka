'use client';

import { useMemo, type DependencyList } from 'react';
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
} from '@tanstack/react-query';

type LocalQueryFn<Data> = () => Promise<Data> | Data;
type RemoteQueryFn<Data> = (...args: any[]) => Promise<Data> | Data;

type InferData<F> = F extends (...args: any[]) => Promise<infer D> ? D : never;
type InferRemoteData<R> = R extends { queryFn?: RemoteQueryFn<infer D> }
  ? D
  : never;
type InferLocalData<L> = L extends LocalQueryFn<infer D> ? D : never;

type WithSelect<Data, SelectFn> = SelectFn extends (input: Data) => infer Out
  ? Out
  : Data;

export function useDualQueryOptions<
  RemoteOpts extends { queryKey: QueryKey; queryFn?: unknown },
  LocalFn extends LocalQueryFn<unknown> | undefined,
  SelectFn extends ((input: unknown) => unknown) | undefined = undefined,
>({
  remote,
  local,
  shouldUseLocalAction,
  enabled,
  select,
  deps,
}: {
  remote: RemoteOpts;
  local?: LocalFn;
  shouldUseLocalAction: () => boolean;
  enabled?: boolean;
  select?: SelectFn;
  deps?: DependencyList;
}): UseQueryOptions<
  | unknown
  | (LocalFn extends LocalQueryFn<unknown> ? InferLocalData<LocalFn> : never),
  Error,
  WithSelect<
    | unknown
    | (LocalFn extends LocalQueryFn<unknown> ? InferLocalData<LocalFn> : never),
    NonNullable<SelectFn>
  >,
  RemoteOpts['queryKey']
> {
  return useMemo(() => {
    const base = remote as UseQueryOptions<
      unknown,
      Error,
      unknown,
      RemoteOpts['queryKey']
    >;

    const withLocalOverride =
      shouldUseLocalAction() && local
        ? { ...base, queryFn: local as LocalQueryFn<unknown> }
        : base;

    const withEnabled =
      typeof enabled === 'boolean'
        ? { ...withLocalOverride, enabled }
        : withLocalOverride;

    return select ? ({ ...withEnabled, select } as any) : (withEnabled as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ?? [remote, local, shouldUseLocalAction, enabled, select]);
}

export function useDualQuery<
  RemoteOpts extends { queryKey: QueryKey; queryFn?: RemoteQueryFn<unknown> },
  LocalFn extends LocalQueryFn<unknown> | undefined,
  SelectFn extends ((input: unknown) => unknown) | undefined = undefined,
>(args: {
  remote: RemoteOpts;
  local?: LocalFn;
  shouldUseLocalAction: () => boolean;
  enabled?: boolean;
  select?: SelectFn;
  deps?: DependencyList;
}): UseQueryResult<
  WithSelect<
    | InferRemoteData<RemoteOpts>
    | (LocalFn extends LocalQueryFn<unknown> ? InferLocalData<LocalFn> : never),
    NonNullable<SelectFn>
  >,
  Error
> {
  const options = useDualQueryOptions(args);
  return useQuery(options as any);
}
