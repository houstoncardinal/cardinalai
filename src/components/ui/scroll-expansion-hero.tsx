import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.0009;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005;
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }

        setTouchStartY(touchY);
      }
    };

    const handleTouchEnd = () => {
      setTouchStartY(0);
    };

    const ref = sectionRef.current;
    if (!mediaFullyExpanded && ref) {
      ref.addEventListener('wheel', handleWheel, { passive: false });
      ref.addEventListener('touchstart', handleTouchStart, { passive: true });
      ref.addEventListener('touchmove', handleTouchMove, { passive: false });
      ref.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (ref) {
        ref.removeEventListener('wheel', handleWheel);
        ref.removeEventListener('touchstart', handleTouchStart);
        ref.removeEventListener('touchmove', handleTouchMove);
        ref.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [scrollProgress, touchStartY, mediaFullyExpanded]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileState(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculateMediaSize = () => {
    const isMobile = window.innerWidth < 768;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    const minWidth = isMobile ? vw * 0.7 : vw * 0.4;
    const minHeight = isMobile ? vh * 0.3 : vh * 0.5;
    
    const maxWidth = vw;
    const maxHeight = vh;

    const width = minWidth + (maxWidth - minWidth) * scrollProgress;
    const height = minHeight + (maxHeight - minHeight) * scrollProgress;

    return { width, height };
  };

  const { width: mediaWidth, height: mediaHeight } = calculateMediaSize();

  return (
    <div
      ref={sectionRef}
      className='transition-colors duration-700 ease-in-out overflow-x-hidden'
    >
      <section className='relative flex flex-col items-center justify-start min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100dvh]'>
          <motion.div
            className='absolute inset-0 z-0 h-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={bgImageSrc}
              alt='Background'
              className='w-screen h-screen'
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
            <div className='absolute inset-0 bg-black/20' />
          </motion.div>

          <div className='container mx-auto flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100dvh] relative'>
              
              {/* Subtle floating particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-primary/40"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
              
              <div
                className='absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out rounded-3xl'
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: `0 ${8 + scrollProgress * 32}px ${48 + scrollProgress * 80}px hsla(0 0% 0% / ${0.3 + scrollProgress * 0.5})`,
                }}
              >
                {/* Minimal border accent */}
                <motion.div
                  className="absolute -inset-[1px] rounded-3xl border border-primary/30"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Subtle glow */}
                <motion.div
                  className="absolute -inset-2 rounded-3xl"
                  style={{
                    background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.15), transparent 70%)',
                  }}
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Corner indicators - minimal */}
                {[0, 1, 2, 3].map((corner) => (
                  <motion.div
                    key={`corner-${corner}`}
                    className="absolute w-6 h-6"
                    style={{
                      top: corner < 2 ? '-0.75rem' : 'auto',
                      bottom: corner >= 2 ? '-0.75rem' : 'auto',
                      left: corner % 2 === 0 ? '-0.75rem' : 'auto',
                      right: corner % 2 === 1 ? '-0.75rem' : 'auto',
                    }}
                  >
                    <motion.div
                      className="w-full h-full border-t-2 border-l-2 border-primary/50 rounded-tl-lg"
                      style={{
                        transform: `rotate(${corner * 90}deg)`,
                      }}
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: corner * 0.5,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                ))}

                {mediaType === 'video' ? (
                  mediaSrc.includes('youtube.com') ? (
                    <div className='relative w-full h-full pointer-events-none'>
                      <iframe
                        width='100%'
                        height='100%'
                        src={mediaSrc}
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                        className='rounded-3xl'
                        style={{
                          pointerEvents: mediaFullyExpanded ? 'auto' : 'none',
                        }}
                      />
                    </div>
                  ) : (
                    <video
                      src={mediaSrc}
                      poster={posterSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className='w-full h-full object-cover rounded-3xl'
                      style={{
                        pointerEvents: mediaFullyExpanded ? 'auto' : 'none',
                      }}
                    />
                  )
                ) : (
                  <img
                    src={mediaSrc}
                    alt='Hero media'
                    className='w-full h-full object-cover rounded-3xl'
                  />
                )}
              </div>

              <motion.div
                className='absolute z-20 text-center pointer-events-none'
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1 - scrollProgress * 2,
                  y: 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <h1
                  className={`text-5xl lg:text-7xl font-bold mb-6 ${
                    textBlend
                      ? 'bg-gradient-to-r from-primary via-white to-accent bg-clip-text text-transparent'
                      : 'text-white'
                  }`}
                  style={{
                    textShadow: textBlend
                      ? 'none'
                      : '0 4px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  {title}
                </h1>
                <p
                  className={`text-lg lg:text-xl ${
                    textBlend ? 'text-muted-foreground' : 'text-white/90'
                  } mb-12`}
                  style={{
                    textShadow: textBlend
                      ? 'none'
                      : '0 2px 12px rgba(0,0,0,0.5)',
                  }}
                >
                  {date}
                </p>
                {scrollToExpand && (
                  <motion.div
                    className='flex flex-col items-center gap-3'
                    animate={{
                      y: [0, 8, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <p
                      className={`text-sm ${
                        textBlend
                          ? 'text-muted-foreground'
                          : 'text-white/80'
                      }`}
                      style={{
                        textShadow: textBlend
                          ? 'none'
                          : '0 2px 8px rgba(0,0,0,0.5)',
                      }}
                    >
                      {scrollToExpand}
                    </p>
                    <svg
                      className={`w-6 h-6 ${
                        textBlend ? 'text-primary' : 'text-white'
                      }`}
                      fill='none'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path d='M19 14l-7 7m0 0l-7-7m7 7V3'></path>
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {showContent && children}
      </motion.div>
    </div>
  );
};

export default ScrollExpandMedia;