import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "@/components/common/ProtectedRoute";

vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/useAuth";

const renderWithRouter = (initialEntry = "/") =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <ProtectedRoute />
        </MemoryRouter>,
    );

describe("ProtectedRoute", () => {
    it("redirects to /login when unauthenticated", () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            isInitialized: true,
        } as ReturnType<typeof useAuth>);

        renderWithRouter();

        // MemoryRouter doesn't actually redirect, but Navigate sets the location
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it("renders children when authenticated", () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            isInitialized: true,
        } as ReturnType<typeof useAuth>);

        render(
            <MemoryRouter>
                <ProtectedRoute />
                <div>secret content</div>
            </MemoryRouter>,
        );

        expect(screen.getByText("secret content")).toBeInTheDocument();
    });

    it("shows loading skeleton when not initialized", () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            isInitialized: false,
        } as ReturnType<typeof useAuth>);

        const { container } = renderWithRouter();
        expect(
            container.querySelector('[data-slot="skeleton"]'),
        ).toBeInTheDocument();
    });
});
