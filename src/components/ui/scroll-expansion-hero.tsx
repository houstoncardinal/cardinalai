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

    const handleTouchEnd = (): void => {
      setTouchStartY(0);
    };

    const handleScroll = (): void => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel, {
      passive: false,
    });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY]);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

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
            transition={{ duration: 0.1 }}
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
            <div className='absolute inset-0 bg-black/10' />
          </motion.div>

          <div className='container mx-auto flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100dvh] relative'>
              
              {/* Floating orbs with trails */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute"
                  style={{
                    left: `${15 + (i * 7)}%`,
                    top: `${25 + (i % 4) * 18}%`,
                  }}
                >
                  <motion.div
                    className="w-3 h-3 rounded-full bg-primary/60 blur-[2px]"
                    animate={{
                      y: [0, -40, 0],
                      x: [0, Math.sin(i) * 20, 0],
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.8, 1],
                    }}
                    transition={{
                      duration: 4 + i * 0.4,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 w-3 h-3 rounded-full bg-primary-glow/40 blur-sm"
                    animate={{
                      y: [0, -40, 0],
                      x: [0, Math.sin(i) * 20, 0],
                      scale: [1.5, 2.5, 1.5],
                      opacity: [0.1, 0.4, 0.1],
                    }}
                    transition={{
                      duration: 4 + i * 0.4,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              ))}
              
              {/* Energy particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-primary-glow"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                  }}
                />
              ))}
              
              <div
                className='absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-none rounded-2xl'
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: `0px 0px ${80 + scrollProgress * 150}px hsl(var(--primary) / ${0.4 + scrollProgress * 0.6}), 0px 0px ${40 + scrollProgress * 80}px hsl(var(--primary-glow) / ${0.5 + scrollProgress * 0.5})`,
                }}
              >
                {/* Pulsing energy waves */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`wave-${i}`}
                    className="absolute inset-0 rounded-2xl border-2 border-primary/20"
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.8, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.75,
                      ease: "easeOut"
                    }}
                  />
                ))}
                {/* Multiple glowing border rings with rotation */}
                <motion.div
                  className="absolute -inset-4 rounded-3xl border-2 border-primary/40"
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.3, 0.8, 0.3],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute -inset-6 rounded-[2rem] border-2 border-primary-glow/30"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.2, 0.6, 0.2],
                    rotate: [360, 0]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute -inset-10 rounded-[2.5rem] border border-primary/20"
                  animate={{
                    scale: [1, 1.03, 1],
                    opacity: [0.1, 0.4, 0.1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Enhanced corner accents with glow */}
                {[0, 1, 2, 3].map((corner) => (
                  <motion.div
                    key={`corner-${corner}`}
                    className="absolute"
                    style={{
                      top: corner < 2 ? '-1.5rem' : 'auto',
                      bottom: corner >= 2 ? '-1.5rem' : 'auto',
                      left: corner % 2 === 0 ? '-1.5rem' : 'auto',
                      right: corner % 2 === 1 ? '-1.5rem' : 'auto',
                    }}
                  >
                    <motion.div
                      className="w-10 h-10 border-t-2 border-l-2 border-primary-glow relative"
                      style={{
                        transform: `rotate(${corner * 90}deg)`,
                        borderRadius: '0.75rem',
                        filter: 'drop-shadow(0 0 8px hsl(var(--primary-glow) / 0.8))'
                      }}
                      animate={{
                        opacity: [0.4, 1, 0.4],
                        scale: [1, 1.3, 1]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: corner * 0.6
                      }}
                    />
                    {/* Corner particle burst */}
                    <motion.div
                      className="absolute w-2 h-2 bg-primary-glow rounded-full"
                      style={{
                        top: '0',
                        left: '0',
                      }}
                      animate={{
                        scale: [0, 2, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: corner * 0.5
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
                        src={
                          mediaSrc.includes('embed')
                            ? mediaSrc +
                              (mediaSrc.includes('?') ? '&' : '?') +
                              'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1'
                            : mediaSrc.replace('watch?v=', 'embed/') +
                              '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' +
                              mediaSrc.split('v=')[1]
                        }
                        className='w-full h-full rounded-xl'
                        frameBorder='0'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                      />
                      <div
                        className='absolute inset-0 z-10'
                        style={{ pointerEvents: 'none' }}
                      ></div>

                       <motion.div
                        className='absolute inset-0 bg-black/30 rounded-xl'
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                      
                      {/* Enhanced scanning line effects */}
                      <motion.div
                        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                      >
                        {/* Horizontal scan */}
                        <motion.div
                          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary-glow to-transparent"
                          style={{ filter: 'blur(1px) drop-shadow(0 0 4px hsl(var(--primary-glow)))' }}
                          animate={{ top: ['0%', '100%'] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Vertical scan */}
                        <motion.div
                          className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent"
                          style={{ filter: 'blur(1px) drop-shadow(0 0 4px hsl(var(--primary)))' }}
                          animate={{ left: ['0%', '100%'] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1 }}
                        />
                        {/* Grid flash effect */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: 'linear-gradient(0deg, hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }}
                          animate={{
                            opacity: [0, 0.3, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </motion.div>
                    </div>
                  ) : (
                    <div className='relative w-full h-full pointer-events-none'>
                      <video
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload='auto'
                        className='w-full h-full object-cover rounded-xl'
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                      />
                      <div
                        className='absolute inset-0 z-10'
                        style={{ pointerEvents: 'none' }}
                      ></div>

                      <motion.div
                        className='absolute inset-0 bg-black/30 rounded-xl'
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                      
                      {/* Enhanced scanning line effects */}
                      <motion.div
                        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                      >
                        {/* Horizontal scan */}
                        <motion.div
                          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary-glow to-transparent"
                          style={{ filter: 'blur(1px) drop-shadow(0 0 4px hsl(var(--primary-glow)))' }}
                          animate={{ top: ['0%', '100%'] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Vertical scan */}
                        <motion.div
                          className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent"
                          style={{ filter: 'blur(1px) drop-shadow(0 0 4px hsl(var(--primary)))' }}
                          animate={{ left: ['0%', '100%'] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1 }}
                        />
                        {/* Grid flash effect */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: 'linear-gradient(0deg, hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }}
                          animate={{
                            opacity: [0, 0.3, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </motion.div>
                    </div>
                  )
                ) : (
                  <div className='relative w-full h-full'>
                    <img
                      src={mediaSrc}
                      alt={title || 'Media content'}
                      className='w-full h-full object-cover rounded-xl'
                    />

                    <motion.div
                      className='absolute inset-0 bg-black/30 rounded-xl'
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Enhanced scanning line effects */}
                    <motion.div
                      className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                    >
                      {/* Horizontal scan with glow */}
                      <motion.div
                        className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary-glow to-transparent"
                        style={{ filter: 'blur(1px) drop-shadow(0 0 6px hsl(var(--primary-glow)))' }}
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      />
                      {/* Vertical scan */}
                      <motion.div
                        className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent"
                        style={{ filter: 'blur(1px) drop-shadow(0 0 6px hsl(var(--primary)))' }}
                        animate={{ left: ['0%', '100%'] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1 }}
                      />
                      {/* Diagonal cross scan */}
                      <motion.div
                        className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary-glow/50 to-transparent origin-center"
                        style={{ 
                          filter: 'blur(2px)',
                          top: '50%',
                          transform: 'rotate(45deg)'
                        }}
                        animate={{ 
                          scale: [0, 2],
                          opacity: [0.8, 0]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                      {/* Grid overlay */}
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: 'linear-gradient(0deg, hsl(var(--primary) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)',
                          backgroundSize: '25px 25px'
                        }}
                        animate={{
                          opacity: [0, 0.4, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>
                )}

                <div className='flex flex-col items-center text-center relative z-10 mt-4 transition-none'>
                  {date && (
                    <motion.p
                      className='text-2xl text-primary-glow font-bold tracking-wider'
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                      animate={{
                        textShadow: [
                          '0 0 10px hsl(var(--primary) / 0.5)',
                          '0 0 30px hsl(var(--primary) / 0.8)',
                          '0 0 10px hsl(var(--primary) / 0.5)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {date}
                    </motion.p>
                  )}
                  {scrollToExpand && (
                    <motion.p
                      className='text-primary-glow font-medium text-center mt-2'
                      style={{ transform: `translateX(${textTranslateX}vw)` }}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        y: [0, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {scrollToExpand}
                    </motion.p>
                  )}
                </div>
              </div>

              <div
                className={`flex items-center justify-center text-center gap-4 w-full relative z-10 transition-none flex-col ${
                  textBlend ? 'mix-blend-difference' : 'mix-blend-normal'
                }`}
              >
                <motion.h2
                  className='text-4xl md:text-5xl lg:text-6xl font-bold text-primary-glow transition-none drop-shadow-2xl'
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                  animate={{
                    textShadow: [
                      '0 0 20px hsl(var(--primary) / 0.8)',
                      '0 0 40px hsl(var(--primary) / 1)',
                      '0 0 20px hsl(var(--primary) / 0.8)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className='text-4xl md:text-5xl lg:text-6xl font-bold text-center text-primary-glow transition-none drop-shadow-2xl'
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                  animate={{
                    textShadow: [
                      '0 0 20px hsl(var(--primary-glow) / 0.8)',
                      '0 0 40px hsl(var(--primary-glow) / 1)',
                      '0 0 20px hsl(var(--primary-glow) / 0.8)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  {restOfTitle}
                </motion.h2>
              </div>
            </div>

            <motion.section
              className='flex flex-col w-full px-8 py-10 md:px-16 lg:py-20'
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
