import { LandingContent } from "@/component/landing-content";
import { LandingHero } from "@/component/landing-hero";
import { LandingNavbar } from "@/component/landing-navbar";

const LandingPage = () => {
    return (
        <div className="h-full w-full bg-[#111827] overflow-auto">
            <div className="mx-auto max-w-screen-xl h-full w-full">
                <LandingNavbar />
                <LandingHero />
                <LandingContent />
            </div>
        </div>
    );
};

export default LandingPage;