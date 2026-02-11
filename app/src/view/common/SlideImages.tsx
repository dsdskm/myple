import { useEffect, useRef, useState } from "react";
import { Asset } from "@toss/tds-mobile";
import { PUBLIC_IMAGES } from "../../common/constants";

const SlideImages = () => {
  const images = [
    PUBLIC_IMAGES.SHOT_MAP,
    PUBLIC_IMAGES.SHOT_LIST,
    PUBLIC_IMAGES.SHOT_PLACE,
    PUBLIC_IMAGES.SHOT_CATEGORY,
  ];

  // 마지막에 첫 장을 하나 더 붙여서 "3 -> (클론1)"로 자연스럽게 넘김
  const slides = [...images, images[0]];

  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const DURATION_MS = 700; // transition 시간
  const INTERVAL_MS = 2000; // 전환 주기(transition보다 반드시 길게)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onEnd = () => {
      // 클론(마지막)까지 도달했으면 애니메이션 없이 0으로 순간 이동
      if (index === images.length) {
        track.style.transition = "none";
        track.style.transform = `translateX(0%)`;

        // 다음 프레임에 transition 다시 켜서 이후 슬라이드는 정상 애니메이션
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            track.style.transition = `transform ${DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            setIndex(0);
          });
        });
      }
    };

    track.addEventListener("transitionend", onEnd);
    return () => track.removeEventListener("transitionend", onEnd);
  }, [index, images.length]);

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div
        ref={trackRef}
        style={{
          display: "flex",
          transform: `translateX(-${index * 100}%)`,
          transition: `transform ${DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          willChange: "transform",
        }}
      >
        {slides.map((src, i) => (
          <Asset.Image key={i} as="img" src={src} alt={`slide-${i}`} style={{ width: "100%", flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
};

export default SlideImages;
