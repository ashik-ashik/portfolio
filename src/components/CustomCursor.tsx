import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = -999, my = -999;
    let rx = -999, ry = -999;

    const moveDot = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mx + "px";
        dotRef.current.style.top  = my + "px";
      }
      if (crossRef.current) {
        crossRef.current.style.left = mx + "px";
        crossRef.current.style.top  = my + "px";
      }
    };

    const lerpRing = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.left = rx + "px";
        ringRef.current.style.top  = ry + "px";
      }
      requestAnimationFrame(lerpRing);
    };

    const onClick = (e: MouseEvent) => {
      const burst = document.createElement("div");
      burst.className = "cur-burst";
      burst.style.left = e.clientX + "px";
      burst.style.top  = e.clientY + "px";
      document.body.appendChild(burst);
      burst.addEventListener("animationend", () => burst.remove());
    };

    const addHover = () => {
      document.querySelectorAll("a, button, [data-hover]").forEach(el => {
        el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hovering"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hovering"));
      });
    };

    document.addEventListener("mousemove", moveDot);
    document.addEventListener("click", onClick);
    const raf = requestAnimationFrame(lerpRing);
    addHover();

    return () => {
      document.removeEventListener("mousemove", moveDot);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}   className="cur-dot"   />
      <div ref={crossRef} className="cur-cross"  />
      <div ref={ringRef}  className="cur-ring"   />
    </>
  );
}