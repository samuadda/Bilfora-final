import { ReactNode } from "react";
import { DashboardLayout } from "../../components/dashboard/SideBar";

interface DashboardLayoutWrapperProps {
    children: ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
