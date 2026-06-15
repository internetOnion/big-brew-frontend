import { IconContext } from "@phosphor-icons/react";

export const IconProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <IconContext.Provider
            value={{
                weight: "duotone",
                size: 24,
                mirrored: false,
            }}
        >
            {children}
        </IconContext.Provider>
    );
};
