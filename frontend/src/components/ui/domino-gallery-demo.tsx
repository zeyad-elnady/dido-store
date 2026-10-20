"use client";

import { DominoGallery } from "@/components/ui/domino-gallery";
import type { DominoItem } from "@/components/ui/domino-gallery";

const settings = {
  autoplay: true,
  standAngle: 94,
  cardWidth: 220,
  cardHeight: 590,
};

const PHOTOS = [
  { id: "photo-1662532577856-e8ee8b138a8b", title: "Linen & light" },
  { id: "photo-1715541448446-3369e1cc0ee9", title: "Studio noir" },
  { id: "photo-1515886657613-9f3515b0c78f", title: "Crosswalk" },
  { id: "photo-1580478491436-fd6a937acc9e", title: "Red thread" },
  { id: "photo-1768696083080-15d4218ce844", title: "Soft focus" },
];

const ITEMS: DominoItem[] = PHOTOS.map(({ id, title }) => ({
  src: `https://images.unsplash.com/${id}?w=440&h=1180&fit=crop&q=80&auto=format`,
  alt: title,
  title,
}));

const CCGATHER_URL = "https://ccgather.com/?utm_source=21st&utm_medium=component&utm_campaign=domino_gallery";

export default function Demo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <div className="w-full bg-background text-foreground">
      <header className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-6 pt-16 pb-6 text-center">
        <h2 className="text-lg font-semibold">Scroll to topple</h2>
        <p className="text-sm text-muted-foreground">Cards stand like dominoes and fall one after another as you scroll; scroll back up and they rise.</p>
      </header>
      <DominoGallery items={ITEMS} autoplay={s.autoplay} standAngle={s.standAngle} cardWidth={s.cardWidth} cardHeight={s.cardHeight} />
      <footer className="mx-auto max-w-3xl px-6 pb-16 pt-6 text-center text-xs text-muted-foreground">
        Fashion gallery from the{" "}
        <a href={CCGATHER_URL} target="_blank" rel="noreferrer" className="underline underline-offset-4 transition-colors hover:text-foreground">
          CCgather
        </a>{" "}
        team
      </footer>
    </div>
  );
}
