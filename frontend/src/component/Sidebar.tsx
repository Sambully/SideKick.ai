import { Home, Plus, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const Sidebar = () => {
    const navigation = useNavigate();
    const routes = [{
        icon: Home,
        href: "/Dashboard",
        label: "Home",
        pro:false
    }, {
        icon: Plus,
        href: "/companion/new",
        label: "Create",
        pro:true

        }, {
        icon: Settings,
        href: "/settings",
        label: "Settings",
        pro:false

        }]
    const onnavigation = (url: string, pro : boolean)=>{
        return navigation(url);
    }

    return <div className="space-y-4 flex flex-col bg-secondary text-primary h-full">
        <div className="p-3 flex flex-1 justify-center">
            <div className="space-y-2">
                {routes.map((route) => (
                    <div key={route.href} onClick={()=>onnavigation(route.href , route.pro)} className="text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-slate-400 rounded-lg transition">
                        <div className="flex flex-col gap-y-2 items-center">
                            <route.icon className="h-5 w-5" ></route.icon>
                            {route.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
}   