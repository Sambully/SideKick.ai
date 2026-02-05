import { Navbar } from "@/component/Navbar";
import { Sidebar } from "@/component/Sidebar";

export function Settings() {
    return <div> <Navbar />
        <div className="hidden md:flex mt-16 w-20 flex-col insert-y-0 fixed h-full">
            <Sidebar />
        </div>
        <div className="md:pl-22 pt-18 h-full">
            <div className="flex flex-col gap-y-4 flex-1">
                <div className="px-4">
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>
            </div>
        </div>
    </div>
}