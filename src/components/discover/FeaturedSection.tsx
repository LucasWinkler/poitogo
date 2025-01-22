"use client";

import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PlaceCard } from "./PlaceCard";
import type { Place } from "@/types";
import { useEffect, useState } from "react";

type FeaturedSectionProps = {
  title: string;
  places: Place[] | null;
  emptyMessage?: string;
};

export const FeaturedSection = ({
  title,
  places,
  emptyMessage = "No places found",
}: FeaturedSectionProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateSnapPoints = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    };

    updateSnapPoints();

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    api.on("resize", updateSnapPoints);

    return () => {
      api.off("select", () => {
        setCurrent(api.selectedScrollSnap() + 1);
      });
      api.off("resize", updateSnapPoints);
    };
  }, [api]);

  if (!places || places.length === 0) {
    return (
      <section className="py-4">
        <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
        <Card className="flex h-48 items-center justify-center text-muted-foreground">
          {emptyMessage}
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {places.map((place, index) => (
              <CarouselItem
                key={place.id}
                className="basis-full pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3"
              >
                <PlaceCard place={place} priority={index < 3} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background" />
          <CarouselNext className="absolute -right-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background" />
        </Carousel>
      </div>
      <div className="flex justify-start gap-1 px-4 py-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === current - 1
                ? "w-4 bg-zinc-800 dark:bg-zinc-200"
                : "w-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
