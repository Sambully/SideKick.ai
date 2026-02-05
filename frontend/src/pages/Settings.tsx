import { Navbar } from "@/component/Navbar";
import { Sidebar } from "@/component/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { SubscriptionModal } from "@/component/SubscriptionModal";
export function Settings() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ isPro: false, limit: 2, count: 0, planName: "" });
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get("http://localhost:3000/api/settings");
            setData(res.data);
            setLoading(false);
        }
        fetch();
    }, [])
    if (loading) return (
        <div className="md:25 pt-10 flex flex-col items-center justify-center space-y-3">
            <div className="relative flex flex-col items-center justify-center w-100 h-60">
                <h1 className="text-2xl text-gray-500 font-semibold">Loading...</h1>
            </div>
        </div>
    )
    return <div> <Navbar />
        <div className="hidden md:flex mt-16 w-20 flex-col insert-y-0 fixed h-full">
            <Sidebar />
        </div>
        <div className="md:pl-22 pt-18 h-full">
            <div className="p-4 space-y-6">
                <h2 className="text-2xl font-bold">Settings</h2>

                <div className="border rounded-lg p-6 bg-card space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg">Subscription Plan</h3>
                            <p className="text-muted-foreground text-sm">
                                {data.isPro
                                    ? `You are currently on the ${data.planName} Plan.`
                                    : "Currently you have no plan."}
                            </p>
                        </div>

                        <Button onClick={() => setShowModal(true)} variant={data.isPro ? "outline" : "default"}>
                            {data.isPro ? "Change Plan" : "Upgrade"}
                            <Sparkles className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-md">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Companions Created</span>
                            <span className="font-bold">{data.count} / {data.limit}</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-primary h-full transition-all"
                                style={{ width: `${((parseInt(data.count as any) || 0) / (parseInt(data.limit as any) || 1)) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            {(parseInt(data.limit as any) || 0) - (parseInt(data.count as any) || 0)} creations remaining
                        </p>
                    </div>
                </div>

                <SubscriptionModal isOpen={showModal} isClosed={() => setShowModal(false)} />
            </div>
        </div>
    </div>
}