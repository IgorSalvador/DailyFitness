import DashboardHeader from "@/components/DashboardHeader";
import DaySummary from "@/components/DaySummary";
import DailyChallenges from "@/components/DailyChallenges";
import FeatureCards from "@/components/FeatureCards";

const Index = () => {
  return (
    <div className="min-h-screen px-4 md:px-[5%] py-5">
      <DashboardHeader />

      <main className="w-full max-w-6xl mx-auto space-y-6">
        {/* Day Summary */}
        <DaySummary />

        {/* Main Grid: Challenges + Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <DailyChallenges />
          </div>
          <div className="lg:col-span-8">
            <FeatureCards />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
