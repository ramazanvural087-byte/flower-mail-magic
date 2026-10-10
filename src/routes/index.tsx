import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type PointerEvent, type CSSProperties } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import garden from "@/assets/garden-background.png";
import original from "@/assets/letter-reference.asset.json";
import envelope from "@/assets/envelope.asset.json";
import f0 from "@/assets/flower-0.asset.json";
import f1 from "@/assets/flower-1.asset.json";
import f2 from "@/assets/flower-2.asset.json";
import f3 from "@/assets/flower-3.asset.json";
import f4 from "@/assets/flower-4.asset.json";
import f5 from "@/assets/flower-5.asset.json";
import f6 from "@/assets/flower-6.asset.json";
import f7 from "@/assets/flower-7.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "A letter for you — Çiçekli mektup" },
    { name: "description", content: "Çiçeklerle süslenen ve gül bahçesindeki posta kutusuna gönderilen bir mektup." },
    { property: "og:title", content: "A letter for you — Çiçekli mektup" },
    { property: "og:description", content: "Gül, zambak ve papatyayla hazırlanan özel bir mektup." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const flowers = [f0, f1, f2, f3, f4, f5, f6, f7];
const names = ["Lale", "Papatya", "Unutmabeni", "Ayçiçeği", "Zambak", "Gül", "Sarı çiçek", "Lavanta"];
const slots: Record<number, number> = { 5: 29, 4: 52, 1: 75 };
type Drag = { id: number; x: number; y: number; startX: number; startY: number };

function Index() {
  const stage = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [phase, setPhase] = useState<"ready" | "sending" | "sent">("ready");
  useEffect(() => {
    if (placed.length !== 3) return;
    const start = setTimeout(() => setPhase("sending"), 450);
    const end = setTimeout(() => setPhase("sent"), 2050);
    return () => { clearTimeout(start); clearTimeout(end); };
  }, [placed]);

  function begin(event: PointerEvent<HTMLButtonElement>, id: number) {
    if (phase !== "ready" || placed.includes(id)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ id, x: 0, y: 0, startX: event.clientX, startY: event.clientY });
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    setDrag({ ...drag, x: event.clientX - drag.startX, y: event.clientY - drag.startY });
  }
  function release(event: PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    const bounds = stage.current?.getBoundingClientRect();
    if (bounds) {
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      if (x >= 0.39 && x <= 0.61 && y >= 0.50 && y <= 0.72 && slots[drag.id] !== undefined) {
        setPlaced(previous => previous.includes(drag.id) ? previous : [...previous, drag.id]);
      }
    }
    setDrag(null);
  }

  return (
    <main className="letter-page">
      <div ref={stage} className="garden" aria-label="Çiçekli mektup bahçesi">
        <img className="garden-backdrop" src={garden} alt="Güller ve lavantalar arasında bir posta kutusu" draggable={false} />
        <img className={`mailbox-layer ${phase === "sent" ? "delivered" : ""}`} src={original.url} alt="" draggable={false} />
        <div className={`envelope ${phase}`} aria-label="Zarf" data-accepted={placed.length}>
          <img className="envelope-base" src={envelope.url} alt="Gül, zambak ve papatya pullu zarf" draggable={false} />
          {placed.map(id => <div key={id} className="envelope-stamp" style={{ left: `${slots[id]}%` }}><img src={flowers[id].url} alt={names[id]} /></div>)}
        </div>
        {flowers.map((flower, id) => {
          const active = drag?.id === id;
          const style: CSSProperties = {
            left: `${(570 + (id % 4) * 62) / 1376 * 100}%`,
            top: `${(id < 4 ? 576 : 654) / 784 * 100}%`,
            transform: active ? `translate(${drag.x}px, ${drag.y}px)` : "translate(0, 0)",
            opacity: placed.includes(id) ? 0 : 1,
          };
          return <Button key={id} variant="ghost" className={`flower-tile ${active ? "dragging" : ""} ${placed.includes(id) ? "placed" : ""}`} style={style} aria-label={names[id]} disabled={phase !== "ready" || placed.includes(id)} onPointerDown={event => begin(event, id)} onPointerMove={move} onPointerUp={release} onPointerCancel={() => setDrag(null)}>
            <img src={flower.url} alt="" draggable={false} />
          </Button>;
        })}
        {phase === "sent" && <Button className="replay" variant="ghost" size="icon" title="Yeniden başlat" aria-label="Yeniden başlat" onClick={() => { setPlaced([]); setPhase("ready"); }}><RotateCcw /></Button>}
      </div>
    </main>
  );
}
