import { RefObject, useEffect } from "react";

/**
 * 가로 스크롤 컨테이너에 데스크톱 마우스 클릭+드래그 스크롤을 붙여준다.
 * 터치/트랙패드는 브라우저가 기본으로 지원하지만, 마우스는 기본적으로
 * 드래그해도 스크롤되지 않기 때문에 별도로 붙여줘야 한다.
 *
 * 사용법: const ref = useRef<HTMLDivElement>(null); useDragScroll(ref);
 */
export function useDragScroll<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;

    const onPointerDown = (e: PointerEvent) => {
      // 마우스에서만 드래그 스크롤을 활성화한다 — 터치/펜은 브라우저 기본 스크롤을 그대로 사용.
      if (e.pointerType !== "mouse") return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = startScrollLeft - dx;
    };

    const endDrag = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "grab";
      el.style.userSelect = previousUserSelect;
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };

    // 드래그로 살짝이라도 움직였다면, 그 직후 발생하는 click 이벤트(카드 클릭 등)를 막아
    // 드래그가 의도치 않게 카드 클릭으로 이어지지 않도록 한다.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    };

    const previousCursor = el.style.cursor;
    const previousUserSelect = el.style.userSelect;
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
      el.style.cursor = previousCursor;
      el.style.userSelect = previousUserSelect;
    };
  }, [ref]);
}
