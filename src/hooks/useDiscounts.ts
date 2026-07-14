import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { discountKeys } from "@/lib/query-keys";
import type {
    AdminDiscount,
    CreateDiscountPayload,
    UpdateDiscountPayload,
} from "@/types/admin";

const fetchDiscounts = async (): Promise<AdminDiscount[]> => {
    const { data } = await api.get<AdminDiscount[]>(ENDPOINTS.DISCOUNTS.BASE);
    return data;
};

export const useDiscounts = () => {
    return useQuery({
        queryKey: discountKeys.all,
        queryFn: fetchDiscounts,
    });
};

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: discountKeys.all });
    queryClient.invalidateQueries({ queryKey: discountKeys.active });
};

export const useCreateDiscount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateDiscountPayload) => {
            const { data } = await api.post(ENDPOINTS.DISCOUNTS.BASE, payload);
            return data;
        },
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: discountKeys.all });
            const previous = queryClient.getQueryData<AdminDiscount[]>(
                discountKeys.all,
            );
            queryClient.setQueryData<AdminDiscount[]>(
                discountKeys.all,
                (old) => {
                    const optimistic: AdminDiscount = {
                        id: `temp-${Date.now()}`,
                        name: payload.name,
                        type: payload.type,
                        value:
                            payload.value != null
                                ? String(payload.value)
                                : null,
                        maxDiscountAmount:
                            payload.max_discount_amount != null
                                ? String(payload.max_discount_amount)
                                : null,
                        appliesTo: payload.applies_to ?? "order",
                        itemId: payload.item_id ?? null,
                        buyItemId: payload.buy_item_id,
                        freeItemId: payload.free_item_id,
                        isActive: payload.is_active ?? true,
                        startsAt: payload.starts_at ?? null,
                        endsAt: payload.ends_at ?? null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    return [optimistic, ...(old ?? [])];
                },
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(discountKeys.all, context.previous);
            }
        },
        onSettled: () => invalidateAll(queryClient),
    });
};

export const useUpdateDiscount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: UpdateDiscountPayload & { id: string }) => {
            const { data } = await api.patch(
                ENDPOINTS.DISCOUNTS.BY_ID(id),
                payload,
            );
            return data;
        },
        onMutate: async ({ id, ...payload }) => {
            await queryClient.cancelQueries({ queryKey: discountKeys.all });
            const previous = queryClient.getQueryData<AdminDiscount[]>(
                discountKeys.all,
            );
            queryClient.setQueryData<AdminDiscount[]>(
                discountKeys.all,
                (old) =>
                    old?.map((d) =>
                        d.id === id
                            ? {
                                  ...d,
                                  ...(payload.name !== undefined && {
                                      name: payload.name,
                                  }),
                                  ...(payload.type !== undefined && {
                                      type: payload.type,
                                  }),
                                  ...(payload.value !== undefined && {
                                      value:
                                          payload.value != null
                                              ? String(payload.value)
                                              : null,
                                  }),
                                  ...(payload.max_discount_amount !==
                                      undefined && {
                                      maxDiscountAmount:
                                          payload.max_discount_amount != null
                                              ? String(
                                                    payload.max_discount_amount,
                                                )
                                              : null,
                                  }),
                                  ...(payload.applies_to !== undefined && {
                                      appliesTo: payload.applies_to,
                                  }),
                                  ...(payload.item_id !== undefined && {
                                      itemId: payload.item_id ?? null,
                                  }),
                                  ...(payload.buy_item_id !== undefined && {
                                      buyItemId: payload.buy_item_id,
                                  }),
                                  ...(payload.free_item_id !== undefined && {
                                      freeItemId: payload.free_item_id,
                                  }),
                                  ...(payload.is_active !== undefined && {
                                      isActive: payload.is_active,
                                  }),
                                  ...(payload.starts_at !== undefined && {
                                      startsAt: payload.starts_at,
                                  }),
                                  ...(payload.ends_at !== undefined && {
                                      endsAt: payload.ends_at,
                                  }),
                                  updatedAt: new Date().toISOString(),
                              }
                            : d,
                    ) ?? [],
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(discountKeys.all, context.previous);
            }
        },
        onSettled: () => invalidateAll(queryClient),
    });
};

export const useDeleteDiscount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.DISCOUNTS.BY_ID(id));
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: discountKeys.all });
            const previous = queryClient.getQueryData<AdminDiscount[]>(
                discountKeys.all,
            );
            queryClient.setQueryData<AdminDiscount[]>(
                discountKeys.all,
                (old) => old?.filter((d) => d.id !== id) ?? [],
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(discountKeys.all, context.previous);
            }
        },
        onSettled: () => invalidateAll(queryClient),
    });
};
