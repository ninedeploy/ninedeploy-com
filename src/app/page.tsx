import { FeatureRooms } from "@/components/home/feature-rooms";
import { Hero } from "@/components/home/hero";
import { InstallCta } from "@/components/home/install-cta";
import { Interfaces } from "@/components/home/interfaces";
import { PanelTour } from "@/components/home/panel-tour";
import { Pipeline } from "@/components/home/pipeline";
import { Comparison, DataPlate, Limits } from "@/components/home/sections";
import { TemplateMarquee } from "@/components/home/template-marquee";

export default function Home() {
  return (
    <>
      <Hero />
      <TemplateMarquee />
      <PanelTour />
      <Pipeline />
      <FeatureRooms />
      <Interfaces />
      <Comparison />
      <DataPlate />
      <Limits />
      <InstallCta />
    </>
  );
}
