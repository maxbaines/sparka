'use client';

import {
  useMutation,
  type UseMutationResult,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

type MutationFn<Vars, Data> = (vars: Vars) => Promise<Data>;
type ExtractVars<F> = F extends (vars: infer V) => Promise<any> ? V : never;
type ExtractData<F> = F extends (vars: any) => Promise<infer D> ? D : never;
type InferRemoteFn<R> = R extends { mutationFn?: infer F }
  ? NonNullable<F>
  : never;
type InferVars<R, L> = [InferRemoteFn<R>] extends [never]
  ? ExtractVars<L>
  : ExtractVars<InferRemoteFn<R>>;
type InferData<R, L> = [InferRemoteFn<R>] extends [never]
  ? ExtractData<L>
  : ExtractData<InferRemoteFn<R>>;

export function useDualMutation<
  Remote extends { mutationFn?: MutationFn<any, any> } | undefined,
  Local extends MutationFn<any, any>,
  TContext = undefined,
>({
  remote,
  local,
  shouldUseLocalAction,
  onMutateAction,
  onErrorAction,
  onSuccessAction,
  onSettledAction,
}: {
  remote?: Remote;
  local: Local;
  shouldUseLocalAction: () => boolean;
  onMutateAction?: (
    vars: InferVars<Remote, Local>,
    queryClient: QueryClient,
  ) => Promise<TContext> | TContext;
  onErrorAction?: (
    error: Error,
    vars: InferVars<Remote, Local>,
    context: TContext | undefined,
    queryClient: QueryClient,
  ) => void;
  onSuccessAction?: (
    data: InferData<Remote, Local>,
    vars: InferVars<Remote, Local>,
    context: TContext | undefined,
    queryClient: QueryClient,
  ) => void;
  onSettledAction?: (
    data: InferData<Remote, Local> | undefined,
    error: Error | null,
    vars: InferVars<Remote, Local>,
    context: TContext | undefined,
    queryClient: QueryClient,
  ) => void;
}): UseMutationResult<
  InferData<Remote, Local>,
  Error,
  InferVars<Remote, Local>,
  TContext | undefined
> {
  const queryClient = useQueryClient();

  return useMutation<
    InferData<Remote, Local>,
    Error,
    InferVars<Remote, Local>,
    TContext | undefined
  >({
    mutationFn: async (vars) => {
      if (!shouldUseLocalAction()) {
        const remoteFn = remote?.mutationFn as
          | ((v: InferVars<Remote, Local>) => Promise<InferData<Remote, Local>>)
          | undefined;
        if (!remoteFn) throw new Error('Remote mutationFn missing');
        return remoteFn(vars);
      }
      const localFn = local as (
        v: InferVars<Remote, Local>,
      ) => Promise<InferData<Remote, Local>>;
      return localFn(vars);
    },
    onMutate: async (vars) =>
      onMutateAction
        ? onMutateAction(vars as InferVars<Remote, Local>, queryClient)
        : undefined,
    onError: (error, vars, context) =>
      onErrorAction?.(
        error,
        vars as InferVars<Remote, Local>,
        context as TContext | undefined,
        queryClient,
      ),
    onSuccess: (data, vars, context) =>
      onSuccessAction?.(
        data as InferData<Remote, Local>,
        vars as InferVars<Remote, Local>,
        context as TContext | undefined,
        queryClient,
      ),
    onSettled: (data, error, vars, context) =>
      onSettledAction?.(
        (data as InferData<Remote, Local>) ?? undefined,
        error ?? null,
        vars as InferVars<Remote, Local>,
        context as TContext | undefined,
        queryClient,
      ),
  });
}
