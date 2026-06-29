import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(ENDPOINTS.EMPLOYEES.BY_ID(id));
        },
        onSuccess: () => {
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
