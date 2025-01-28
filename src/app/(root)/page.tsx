import type { Metadata } from "next";
import HomeHero from "@/components/home/HomeHero";
import FeaturedSections from "@/components/home/FeaturedSections";
import { LocationProvider } from "@/contexts/LocationContext";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Discover your next adventure",
};

const Home = () => {
  return (
    <LocationProvider>
      <HomeHero />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <FeaturedSections />
      </div>
    </LocationProvider>
  );
};

export default Home;
