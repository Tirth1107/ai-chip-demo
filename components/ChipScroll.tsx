"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const TOTAL_FRAMES = 240;

function getFramePath(index: number): string {
    const num = String(index + 1).padStart(3, "0");
    return `/ezgif-frame-${num}.jpg`;
}

/* ───────────────────────── Loader ───────────────────────── */

function Loader({ progress }: { progress: number }) {
    const circumference = 2 * Math.PI * 40;
    const strokeOffset = circumference - (progress / 100) * circumference;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
            {/* Ambient glow */}
            <div className="absolute w-64 h-64 rounded-full bg-cyan-500/10 glow-pulse" />

            {/* Spinner ring */}
            <svg width="100" height="100" className="relative">
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="3"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(100,200,255,0.6)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    className="loader-ring"
                    style={{ transformOrigin: "center" }}
                />
            </svg>

            <p className="mt-6 text-sm tracking-[0.3em] uppercase text-white/40 font-light">
                Loading Experience
            </p>
            <p className="mt-2 text-2xl font-light text-white/70 tabular-nums">
                {Math.round(progress)}%
            </p>
        </div>
    );
}

/* ──────────────────── Text Overlay Section ──────────────── */

interface TextSectionProps {
    children: React.ReactNode;
    scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
    fadeIn: number;
    peakStart: number;
    peakEnd: number;
    fadeOut: number;
    align?: "center" | "left" | "right";
}

function TextSection({
    children,
    scrollYProgress,
    fadeIn,
    peakStart,
    peakEnd,
    fadeOut,
    align = "center",
}: TextSectionProps) {
    const opacity = useTransform(
        scrollYProgress,
        [fadeIn, peakStart, peakEnd, fadeOut],
        [0, 1, 1, 0]
    );
    const y = useTransform(
        scrollYProgress,
        [fadeIn, peakStart, peakEnd, fadeOut],
        [60, 0, 0, -40]
    );

    const springOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
    const springY = useSpring(y, { stiffness: 100, damping: 30 });

    const alignClass =
        align === "left"
            ? "items-start text-left pl-8 md:pl-20 lg:pl-32"
            : align === "right"
                ? "items-end text-right pr-8 md:pr-20 lg:pr-32"
                : "items-center text-center px-6";

    return (
        <motion.div
            style={{ opacity: springOpacity, y: springY }}
            className={`absolute inset-0 z-20 flex flex-col justify-center ${alignClass} pointer-events-none`}
        >
            {children}
        </motion.div>
    );
}

/* ───────────────────── Main Component ───────────────────── */

export default function ChipScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const currentFrameRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const frameIndex = useTransform(
        scrollYProgress,
        [0, 1],
        [0, TOTAL_FRAMES - 1]
    );

    /* ── Preload images ── */
    useEffect(() => {
        let loadedCount = 0;
        const images: HTMLImageElement[] = [];

        const onLoad = () => {
            loadedCount++;
            setLoadProgress((loadedCount / TOTAL_FRAMES) * 100);
            if (loadedCount === TOTAL_FRAMES) {
                imagesRef.current = images;
                setLoaded(true);
            }
        };

        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = onLoad;
            img.onerror = onLoad; // count errors too so we don't stall
            images[i] = img;
        }

        return () => {
            // cleanup
            images.forEach((img) => {
                img.onload = null;
                img.onerror = null;
            });
        };
    }, []);

    /* ── Draw to canvas ── */
    const drawFrame = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = imagesRef.current[index];
        if (!canvas || !ctx || !img || !img.complete || !img.naturalWidth) return;

        const dpr = window.devicePixelRatio || 1;
        const displayW = canvas.clientWidth;
        const displayH = canvas.clientHeight;

        if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
            canvas.width = displayW * dpr;
            canvas.height = displayH * dpr;
            ctx.scale(dpr, dpr);
        }

        ctx.clearRect(0, 0, displayW, displayH);

        // "cover" fit — fill the entire screen, crop overflow
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = displayW / displayH;

        let drawW: number, drawH: number, drawX: number, drawY: number;

        if (imgAspect > canvasAspect) {
            // Image is wider — match height, crop sides
            drawH = displayH;
            drawW = displayH * imgAspect;
            drawX = (displayW - drawW) / 2;
            drawY = 0;
        } else {
            // Image is taller — match width, crop top/bottom
            drawW = displayW;
            drawH = displayW / imgAspect;
            drawX = 0;
            drawY = (displayH - drawH) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }, []);

    /* ── Subscribe to scroll-driven frame changes ── */
    useEffect(() => {
        if (!loaded) return;

        // draw initial frame
        drawFrame(0);

        const unsubscribe = frameIndex.on("change", (latest) => {
            const idx = Math.max(0, Math.min(Math.round(latest), TOTAL_FRAMES - 1));
            if (idx !== currentFrameRef.current) {
                currentFrameRef.current = idx;
                drawFrame(idx);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [loaded, frameIndex, drawFrame]);

    /* ── Handle resize ── */
    useEffect(() => {
        if (!loaded) return;

        const handleResize = () => {
            drawFrame(currentFrameRef.current);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [loaded, drawFrame]);

    return (
        <>
            {!loaded && <Loader progress={loadProgress} />}

            <div
                ref={containerRef}
                className="relative h-[800vh] scroll-container"
            >
                {/* ── Sticky canvas ── */}
                <div className="sticky top-0 h-screen w-full overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                        style={{ background: "#0a0a0a" }}
                    />

                    {/* ── Gradient overlays for text readability ── */}
                    <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/40" />

                    {/* ── Text Section 1 — Hero (0% → 20%) ── */}
                    <TextSection
                        scrollYProgress={scrollYProgress}
                        fadeIn={0}
                        peakStart={0.02}
                        peakEnd={0.12}
                        fadeOut={0.2}
                        align="center"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white/90 text-glow leading-[1.1]">
                            Tirth Joshi
                        </h1>
                        <p className="mt-3 md:mt-5 text-base sm:text-lg md:text-2xl font-light tracking-wide text-white/50">
                            A Demo By Tirth Joshi
                        </p>
                        <div className="mt-8 flex items-center gap-2 text-white/30">
                            <svg
                                className="w-5 h-5 animate-bounce"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                            </svg>
                            <span className="text-xs tracking-[0.25em] uppercase">
                                Scroll to Explore
                            </span>
                        </div>
                    </TextSection>

                    {/* ── Text Section 2 — Parameters (25% → 45%) ── */}
                    <TextSection
                        scrollYProgress={scrollYProgress}
                        fadeIn={0.22}
                        peakStart={0.28}
                        peakEnd={0.38}
                        fadeOut={0.46}
                        align="left"
                    >
                        <p className="text-sm md:text-base tracking-[0.3em] uppercase text-cyan-400/70 font-medium mb-3">
                            Architecture
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white/90 text-glow-strong leading-[1.1]">
                            256 Billion
                            <br />
                            <span className="text-white/60">Parameters.</span>
                        </h2>
                        <p className="mt-4 md:mt-6 max-w-md text-sm md:text-base text-white/40 font-light leading-relaxed">
                            Unprecedented neural density packed into a single chip.
                            Every transistor purpose-built for intelligence.
                        </p>
                    </TextSection>

                    {/* ── Text Section 3 — Speed & Scale (50% → 70%) ── */}
                    <TextSection
                        scrollYProgress={scrollYProgress}
                        fadeIn={0.48}
                        peakStart={0.54}
                        peakEnd={0.64}
                        fadeOut={0.72}
                        align="right"
                    >
                        <p className="text-sm md:text-base tracking-[0.3em] uppercase text-cyan-400/70 font-medium mb-3">
                            Performance
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white/90 text-glow-strong leading-[1.1]">
                            Built for Speed.
                            <br />
                            <span className="text-white/60">Designed for Scale.</span>
                        </h2>
                        <p className="mt-4 md:mt-6 max-w-md text-sm md:text-base text-white/40 font-light leading-relaxed ml-auto">
                            10x faster inference. 100x more efficient training.
                            Scale from edge to cloud seamlessly.
                        </p>
                    </TextSection>

                    {/* ── Text Section 4 — CTA (80% → 100%) ── */}
                    <TextSection
                        scrollYProgress={scrollYProgress}
                        fadeIn={0.76}
                        peakStart={0.82}
                        peakEnd={0.92}
                        fadeOut={1.0}
                        align="center"
                    >
                        <p className="text-sm md:text-base tracking-[0.3em] uppercase text-cyan-400/70 font-medium mb-3">
                            Get Started
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white/90 text-glow-strong leading-[1.1]">
                            Power Your Next
                            <br />
                            <span className="text-white/60">Breakthrough.</span>
                        </h2>
                        <p className="mt-4 md:mt-6 max-w-lg text-sm md:text-base text-white/40 font-light leading-relaxed">
                            Join the next generation of AI builders. NeuralCore X1 is ready
                            for your most ambitious projects.
                        </p>
                        <div className="mt-8 pointer-events-auto flex flex-col sm:flex-row gap-4">
                            <button className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-sm tracking-wide transition-all duration-300 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                                    Pre-Order Now
                                </span>
                            </button>
                            <button className="px-8 py-4 rounded-full border border-white/20 text-white/70 font-medium text-sm tracking-wide hover:border-white/40 hover:text-white transition-all duration-300">
                                Learn More →
                            </button>
                        </div>
                    </TextSection>
                </div>
            </div>
        </>
    );
}
