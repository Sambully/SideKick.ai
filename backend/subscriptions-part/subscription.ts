import prismadb from "../db";
const DAY_IN_MS = 86_400_000;
export const check_subscription = async (userId: string) => {
    if (!userId) return false;
    const user_subscription = await prismadb.usersubscription.findUnique({
        where: { userId: userId },
        select: {
            razorpayCurrentPeriodEnd: true,
            razorpayCustomerId: true,
            razorpaySubscriptionId: true,
            razorpayPlanId: true
        }

    })
    if (!user_subscription) return false;
    const validity = user_subscription.razorpayCurrentPeriodEnd && user_subscription.razorpayCurrentPeriodEnd.getTime()! + DAY_IN_MS > Date.now();
    return !!validity;
}

export const companionList = async (userId: string) => {
    if (!userId) return 2;
    const user_subscription = await prismadb.usersubscription.findUnique({
        where: {
            userId: userId
        },
        select: {
            razorpayCurrentPeriodEnd: true,
            razorpayCustomerId: true,
            razorpaySubscriptionId: true,
            razorpayPlanId: true,
            maxCompanions: true
        }
    })

    if (!user_subscription || (user_subscription.razorpayCurrentPeriodEnd && user_subscription.razorpayCurrentPeriodEnd.getTime() + DAY_IN_MS < Date.now())) return 2;
    const companionList = await prismadb.companion.findMany({
        where: {
            userId: userId
        }
    })
    return user_subscription.maxCompanions;

}