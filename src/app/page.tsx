import { BackgroundDecor } from "@/components/layout/BackgroundDecor";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { LotSelectionProvider } from "@/components/providers/LotSelectionProvider";
import { Catalog } from "@/components/sections/Catalog";
import { Hero } from "@/components/sections/Hero";
import { Location } from "@/components/sections/Location";
import { Pillars } from "@/components/sections/Pillars";
import { Simulator } from "@/components/sections/Simulator";
import { VisitForm } from "@/components/sections/VisitForm";
import { getUf } from "@/lib/uf";

export default async function Home() {
  // getUf está cacheada por un día, así que la página se regenera con la UF vigente.
  const uf = await getUf();

  return (
    <LotSelectionProvider>
      <BackgroundDecor />
      <Header />
      <main>
        <Hero ufValue={uf.value} />
        <Pillars />
        <Catalog ufValue={uf.value} />
        <Simulator uf={uf} />
        <Location />
        <VisitForm />
      </main>
      <Footer />
      <WhatsAppFab />
    </LotSelectionProvider>
  );
}
