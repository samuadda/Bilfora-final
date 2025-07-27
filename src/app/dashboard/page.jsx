import { DashboardLayout } from "../../components/dashboard/SideBar";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="flex h-screen w-full items-center justify-center bg-indigo-50">
                <h1 className="text-2xl font-bold text-slate-800">Welcome to the Dashboard</h1>
            </div>
        </DashboardLayout>
    );
}
