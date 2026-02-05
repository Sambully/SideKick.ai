import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";


interface SubscriptionModelinterface {
    isOpen: boolean,
    isClosed: () => void
}

const Plans = [
    { name: "Pro", price: 10, limit: "+2 companions", desc: "For getting started" },
    { name: "Elite", price: 20, limit: "+5 companions", desc: "For Power users", recommended: true },
    { name: "Alpha", price: 25, limit: "+10 companions", desc: "For Ultimate users" }
];


export function SubscriptionModal({ isOpen, isClosed }: SubscriptionModelinterface) {
    const [loading, setloading] = useState(false);
    const { getToken } = useAuth();
    const { user } = useUser();

    const onSubscribe = async (plan: typeof Plans[0]) => {
        try {
            setloading(true);
            const token = await getToken();
            const { data: order } = await axios.post("http://localhost:3000/api/subscription/checkout",
                { planeName: plan.name, amount: plan.price },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const options = {
                key: process.env.RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: `SideKick ${plan.name}`,
                description: plan.desc,
                order_id: order.id,
                handler: async function (response: any) {
                    await axios.post("http:/?localhost:3000/api/subscription/verify", {
                        razorpay_subscription_id: response.razorpay_subscription_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        planName: plan.name,
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    toast.success("Plan upgraded successfully");
                    window.location.reload();
                },
                theme: { color: "#4f46e5" }
            };
            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setloading(false);
        }

    }

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={isClosed}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl">Upgrade your plan</DialogTitle>
                        <DialogDescription className="text-center">Choose a plan to upgrade your plan</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        {Plans.map((plan) => (
                            <div key={plan.name} className={`p-6 border rounded-xl flex flex-col justify-between ${plan.recommended ? 'border-indigo-500 bg-indigo-50/10 shadow-lg relative' : 'bg-card'}`}>
                                {plan.recommended && <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 bg-indigo-500 text-white text-xs rounded-full">Recommended</div>}
                                <div>
                                    <h3 className="font-bold text-xl">{plan.name}</h3>
                                    <div className="text-3xl font-bold mt-2">₹{plan.price}</div>
                                    <p className="text-muted-foreground text-sm mt-1">{plan.desc}</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium">{plan.limit}</span>
                                    </div>
                                </div>
                                <Button disabled={loading} onClick={() => onSubscribe(plan)} className="w-full mt-6" variant={plan.recommended ? "default" : "outline"}>
                                    Purchase
                                    <Zap className="w-4 h-4 ml-2 fill-current" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}