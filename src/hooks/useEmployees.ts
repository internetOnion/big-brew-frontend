import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { employeeKeys } from "@/lib/query-keys";
import type {
    AdminEmployee,
    CreateEmployeePayload,
    UpdateEmployeePayload,
} from "@/types/admin";

const fetchEmployees = async (): Promise<AdminEmployee[]> => {
    const { data } = await api.get<AdminEmployee[]>(ENDPOINTS.EMPLOYEES.BASE);
    return data;
};

export const useEmployees = () => {
    return useQuery({
        queryKey: employeeKeys.all,
        queryFn: fetchEmployees,
    });
};

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateEmployeePayload) => {
            const { data } = await api.post(ENDPOINTS.AUTH.SIGNUP, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
};

export const useUpdateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: UpdateEmployeePayload & { id: string }) => {
            const { data } = await api.patch(
                ENDPOINTS.EMPLOYEES.BY_ID(id),
                payload,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
};

export const useDeactivateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.patch(ENDPOINTS.EMPLOYEES.BY_ID(id), {
                isActive: false,
            });
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: employeeKeys.all });
            const previous = queryClient.getQueryData<AdminEmployee[]>(
                employeeKeys.all,
            );
            queryClient.setQueryData<AdminEmployee[]>(
                employeeKeys.all,
                (old) =>
                    old?.map((e) =>
                        e.id === id ? { ...e, isActive: false } : e,
                    ) ?? [],
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(employeeKeys.all, context.previous);
            }
            toast.error("Failed to deactivate");
        },
        onSuccess: (_data, id) => {
            const employees = queryClient.getQueryData<AdminEmployee[]>(
                employeeKeys.all,
            );
            const name =
                employees?.find((e) => e.id === id)?.name ?? "Employee";
            toast.success(`${name} deactivated`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
};

export const useReactivateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.patch(ENDPOINTS.EMPLOYEES.BY_ID(id), { isActive: true });
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: employeeKeys.all });
            const previous = queryClient.getQueryData<AdminEmployee[]>(
                employeeKeys.all,
            );
            queryClient.setQueryData<AdminEmployee[]>(
                employeeKeys.all,
                (old) =>
                    old?.map((e) =>
                        e.id === id ? { ...e, isActive: true } : e,
                    ) ?? [],
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(employeeKeys.all, context.previous);
            }
            toast.error("Failed to reactivate");
        },
        onSuccess: (_data, id) => {
            const employees = queryClient.getQueryData<AdminEmployee[]>(
                employeeKeys.all,
            );
            const name =
                employees?.find((e) => e.id === id)?.name ?? "Employee";
            toast.success(`${name} reactivated`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
};

export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.EMPLOYEES.BY_ID(id));
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: employeeKeys.all });
            const previous = queryClient.getQueryData<AdminEmployee[]>(
                employeeKeys.all,
            );
            queryClient.setQueryData<AdminEmployee[]>(
                employeeKeys.all,
                (old) => old?.filter((e) => e.id !== id) ?? [],
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(employeeKeys.all, context.previous);
            }
            toast.error("Failed to delete employee");
        },
        onSuccess: (_data, id) => {
            const employees = queryClient.getQueryData<AdminEmployee[]>(
                employeeKeys.all,
            );
            const name =
                employees?.find((e) => e.id === id)?.name ?? "Employee";
            toast.success(`${name} deleted`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
};

export const useResetEmployeePin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, pin }: { id: string; pin: string }) => {
            const { data } = await api.patch(ENDPOINTS.EMPLOYEES.BY_ID(id), {
                pin,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
};
