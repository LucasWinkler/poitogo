import { ListPlus, Bookmark, Share2, MapPin, LucideIcon } from "lucide-react";

interface HomeFeatureProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const HomeFeatures = () => {
  const features: HomeFeatureProps[] = [
    {
      title: "Create Lists",
      description: "Organize places into custom collections for easy access",
      icon: ListPlus,
    },
    {
      title: "Save Favourites",
      description: "Keep track of places you love and want to visit",
      icon: Bookmark,
    },
    {
      title: "Share Places",
      description: "Share your discoveries with friends and family",
      icon: Share2,
    },
    {
      title: "Discover Local",
      description: "Find hidden gems and popular spots nearby",
      icon: MapPin,
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map(({ title, description, icon: Icon }, index) => (
          <div
            key={title}
            className="animate-fade-up group space-y-3 rounded-lg p-4 opacity-0 transition-colors hover:bg-muted/50"
            style={{ animationDelay: `${index * 100 + 500}ms` }}
          >
            <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
              <Icon className="size-6" />
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
