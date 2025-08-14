import React from "react";
import Button from "../ui/Button";
import { ThreeDMarquee } from "../../components/ui/3d-marquee";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";

const HeroSection = () => {
  const images = [
    "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
    "https://assets.aceternity.com/animated-modal.png",
    "https://assets.aceternity.com/animated-testimonials.webp",
    "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
    "https://assets.aceternity.com/github-globe.png",
    "https://assets.aceternity.com/glare-card.png",
    "https://assets.aceternity.com/layout-grid.png",
    "https://assets.aceternity.com/flip-text.png",
    "https://assets.aceternity.com/hero-highlight.png",
    "https://assets.aceternity.com/carousel.webp",
    "https://assets.aceternity.com/placeholders-and-vanish-input.png",
    "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
    "https://assets.aceternity.com/signup-form.png",
    "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
    "https://assets.aceternity.com/spotlight-new.webp",
    "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
    "https://assets.aceternity.com/cloudinary_bkp/Parallax_Scroll_pzlatw_anfkh7.png",
    "https://assets.aceternity.com/tabs.png",
    "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
    "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
    "https://assets.aceternity.com/glowing-effect.webp",
    "https://assets.aceternity.com/hover-border-gradient.png",
    "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
    "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
    "https://assets.aceternity.com/macbook-scroll.png",
    "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
    "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
    "https://assets.aceternity.com/multi-step-loader.png",
    "https://assets.aceternity.com/vortex.png",
    "https://assets.aceternity.com/wobble-card.png",
    "https://assets.aceternity.com/world-map.webp",
  ];

  const words = [
    {
      text: "Document",
    },
    {
      text: "Analysis",
    },
  ];

  const scrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section
      id="home"
      className="min-h-screen pt-24 pb-10 flex items-center justify-center px-4 bg-black"
    >
      <div className="mx-auto dark:bg-neutral-800 absolute top-20 scale-110 max-w-[90.5vw] opacity-65">
        <ThreeDMarquee images={images} />
      </div>
      <div className="max-w-6xl mx-auto text-center z-10">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="text-white">Intelligent PDF</span>
            <div className="flex flex-col items-center justify-center text-red">
              <TypewriterEffectSmooth words={words} className={'text-red-700  '}/>
            </div>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Advanced artificial intelligence technology for comprehensive
            document analysis and content extraction. Professional-grade
            insights tailored to your specific requirements and use cases.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button variant="primary" size="lg" onClick={scrollToUpload}>
              <span>Begin Analysis</span>
            </Button>

            <Button variant="secondary" size="lg" onClick={scrollToAbout}>
              <span>Learn More</span>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16 border-t border-gray-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Enterprise</div>
              <div className="text-sm text-gray-400">Grade Security</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">AI</div>
              <div className="text-sm text-gray-400">Powered Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Multi</div>
              <div className="text-sm text-gray-400">Persona Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
