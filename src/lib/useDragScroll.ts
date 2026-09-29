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
    let capturedId: number | null = null;
    const previousUserSelect = el.style.userSelect;

    const onPointerDown = (e: PointerEvent) => {
      // 마우스에서만 드래그 스크롤을 활성화한다 — 터치/펜은 브라우저 기본 스크롤을 그대로 사용.
      if (e.pointerType !== "mouse") return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      capturedId = null;
      // 주의: 여기서 바로 setPointerCapture 하면 이후 click 이벤트의 대상이 링크가 아닌
      // 컨테이너로 바뀌어 카드/공연정보 링크가 눌리지 않는다. 실제로 드래그가 시작된 뒤에만 캡처한다.
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        capturedId = e.pointerId;
        try { el.setPointerCapture(e.pointerId); } catch {}
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      }
      if (!moved) return;
      el.scrollLeft = startScrollLeft - dx;
    };

    const endDrag = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "grab";
      el.style.userSelect = previousUserSelect;
      if (capturedId !== null) { try { el.releasePointerCapture(capturedId); } catch {} capturedId = null; }
      // 드래그가 아니었다면 moved 는 false 이므로 일반 클릭은 그대로 통과한다.
      // 드래그였다면 직후 click 을 막은 뒤 다음 틱에 초기화한다(click 이 발생하지 않는 경우 대비).
      if (moved) setTimeout(() => { moved = false; }, 0);
    };

    // 드래그로 살짝이라도 움직였다면, 그 직후 발생하는 click 이벤트(카드 클릭 등)를 막아
    // 드래그가 의도치 않게 카드 클릭으로 이어지지 않도록 한다.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    };

    const onDragStart = (e: DragEvent) => e.preventDefault();

    const previousCursor = el.style.cursor;
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);
    // 링크·이미지를 잡고 끌 때 브라우저 기본 드래그(고스트 이미지)가 시작되어 스크롤이 끊기는 것을 방지
    el.addEventListener("dragstart", onDragStart);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("dragstart", onDragStart);
      el.style.cursor = previousCursor;
      el.style.userSelect = previousUserSelect;
    };
  }, [ref]);
}
