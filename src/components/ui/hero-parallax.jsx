"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

export const HeroParallax = ({
  products,
  onEnterApp,
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.1, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-300, 300]),
    springConfig
  );
  return (
    <div
      ref={ref}
      className="py-20 antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
      style={{ background: "#0F172A", overflowX: "hidden", overflowY: "hidden", minHeight: "200vh", paddingBottom: "120px" }}
    >
      <Header onEnterApp={onEnterApp} />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = ({ onEnterApp }) => {
  return (
    <div className="max-w-7xl relative mx-auto py-16 md:py-24 px-4 w-full left-0 top-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-7xl font-bold text-white leading-tight">
          The Intelligent <br /> People Infrastructure
        </h1>
        <p className="max-w-2xl text-base md:text-xl mt-8 text-slate-400">
          Empower your organization with Selfvora. A unified platform for biometric attendance, 
          AI-driven talent DNA, and automated payroll compliance. Designed for modern teams 
          who value precision and people.
        </p>
        <div className="flex flex-wrap gap-4 mt-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnterApp}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors"
          >
            Enter Platform
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
          >
            Watch Demo
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export const ProductCard = ({ product, translate }) => {
  return (
    <motion.div
      style={{
        x: translate,
        // 16:9 card — matches landscape screenshots perfectly, zero empty space
        width: "32rem",
        height: "18rem",
        position: "relative",
        flexShrink: 0,
      }}
      whileHover={{ y: -20, scale: 1.02 }}
      key={product.title}
      className="group/product"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          clipPath: "inset(0 round 14px)",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Screenshot fills the card completely — no gaps */}
        <img
          src={product.thumbnail}
          alt={product.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
          }}
        />

        {/* Permanent bottom gradient — title is always readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
            zIndex: 1,
          }}
        />

        {/* Hover full-overlay */}
        <div
          className="group-hover/product:opacity-40"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(99,102,241,0.15)",
            opacity: 0,
            transition: "opacity 0.3s",
            zIndex: 2,
          }}
        />
      </div>

      {/* Title — always visible on the gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 16,
          right: 16,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            margin: 0,
            letterSpacing: "-0.2px",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          {product.title}
        </h2>
      </div>
    </motion.div>
  );
};
