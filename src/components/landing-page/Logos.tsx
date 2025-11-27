"use client";
import { Marquee } from "./marquee";
import Image from "next/image";

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Netflix",
  "YouTube",
  "Instagram",
  "Uber",
  "Spotify",
];

export function Logos() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8 text-gray-500 mb-8">
          يثق بنا أكثر من 2000+ مستقل وشركة
        </h2>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
          <Marquee pauseOnHover className="[--duration:30s]">
            {companies.map((company) => (
              <div
                key={company}
                className="mx-8 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                {/* 
                  Note: In a real production app, these would be actual SVGs.
                  For this demo, we'll use text or placeholders if SVGs aren't available, 
                  but optimally we should have logo assets. 
                  Since I don't have company logos, I will simulate them with nice typography 
                  or simple placeholders if I had them. 
                  For now, I'll use a styled text representation to avoid broken images.
                */}
                <span className="text-2xl font-bold text-gray-400 font-sans">
                  {company}
                </span>
              </div>
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
        </div>
      </div>
    </section>
  );
}

