import React, { createContext, useRef } from "react";

export const ScrollContext = createContext();

export const ScrollProvider = ({ children }) => {
  const carouselRef = useRef(null);

  const scrollToCarousel = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <ScrollContext.Provider value={{ carouselRef, scrollToCarousel }}>
      {children}
    </ScrollContext.Provider>
  );
};
