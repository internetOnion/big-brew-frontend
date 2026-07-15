import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { terminalKeys } from "@/lib/query-keys";

export interface Terminal {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
}

export interface CreateTerminalPayload {
    name: string;
    email: string;
    password: string;
}

export interface UpdateTerminalPayload {
    id: string;
    name?: string;
    password?: string;
    isActive?: boolean;
}

const fetchTerminals = async (): Promise<Terminal[]> => {
    const { data } = await api.get<Terminal[]>(ENDPOINTS.TERMINALS.BASE);
    return data;
};

export const useTerminals = () => {
    return useQuery({
        queryKey: terminalKeys.all,
        queryFn: fetchTerminals,
    });
};

export const useCreateTerminal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateTerminalPayload) => {
            const { data } = await api.post(ENDPOINTS.TERMINALS.BASE, payload);
            return data;
        },
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: terminalKeys.all });
            const previous = queryClient.getQueryData<Terminal[]>(
                terminalKeys.all,
            );
            queryClient.setQueryData<Terminal[]>(
                terminalKeys.all,
                (old) => {
                    const optimistic: Terminal = {
                        id: `temp-${Date.now()}`,
                        name: payload.name,
                        email: payload.email,
                        isActive: true,
                    };
                    return [optimistic, ...(old ?? [])];
                },
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    terminalKeys.all,
                    context.previous,
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: terminalKeys.all });
        },
    });
};

export const useUpdateTerminal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...payload }: UpdateTerminalPayload) => {
            const { data } = await api.patch(
                ENDPOINTS.TERMINALS.BY_ID(id),
                payload,
            );
            return data;
        },
        onMutate: async ({ id, ...payload }) => {
            await queryClient.cancelQueries({ queryKey: terminalKeys.all });
            const previous = queryClient.getQueryData<Terminal[]>(
                terminalKeys.all,
            );
            queryClient.setQueryData<Terminal[]>(
                terminalKeys.all,
                (old) =>
                    old?.map((t) =>
                        t.id === id
                            ? {
                                  ...t,
                                  ...(payload.name !== undefined && {
                                      name: payload.name,
                                  }),
                                  ...(payload.isActive !== undefined && {
                                      isActive: payload.isActive,
                                  }),
                              }
                            : t,
                    ) ?? [],
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    terminalKeys.all,
                    context.previous,
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: terminalKeys.all });
        },
    });
};

export const useDeleteTerminal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.TERMINALS.BY_ID(id));
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: terminalKeys.all });
            const previous = queryClient.getQueryData<Terminal[]>(
                terminalKeys.all,
            );
            const terminal = previous?.find((t) => t.id === id);
            queryClient.setQueryData<Terminal[]>(
                terminalKeys.all,
                (old) => old?.filter((t) => t.id !== id) ?? [],
            );
            return { previous, terminalName: terminal?.name ?? "Terminal" };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(terminalKeys.all, context.previous);
            }
            toast.error("Failed to delete terminal");
        },
        onSuccess: (_data, _id, context) => {
            toast.success(`${context?.terminalName ?? "Terminal"} deleted`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: terminalKeys.all });
        },
    });
};
