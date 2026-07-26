// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

// Import Swiper styles
import 'swiper/css';
import { Pagination } from 'swiper/modules';

import { bannerLists } from '../../utils';
import { Link } from 'react-router-dom';
import { useRef, useCallback, useEffect } from 'react';

const colors = ["bg-banner-color1", "bg-banner-color2", "bg-banner-color3"];

const DELAY = 3000;

const HeroBanner = () => {
    const swiperRef = useRef(null);
    const intervalRef = useRef(null);
    const indexRef = useRef(0);

    const total = bannerLists.length;

    const goTo = useCallback((index) => {
        const swiper = swiperRef.current;
        if (!swiper) return;
        const realIndex = ((index % total) + total) % total;
        indexRef.current = realIndex;
        swiper.slideTo(realIndex);
    }, [total]);

    const startAutoplay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            goTo(indexRef.current + 1);
        }, DELAY);
    }, [goTo]);

    const nextSlide = useCallback(() => {
        goTo(indexRef.current + 1);
        startAutoplay();
    }, [goTo, startAutoplay]);

    const prevSlide = useCallback(() => {
        goTo(indexRef.current - 1);
        startAutoplay();
    }, [goTo, startAutoplay]);

    const handleSlideChange = useCallback(() => {
        const swiper = swiperRef.current;
        if (!swiper) return;
        indexRef.current = swiper.activeIndex;
    }, []);

    const handleSwiper = useCallback((swiper) => {
        swiperRef.current = swiper;
        indexRef.current = 0;
        startAutoplay();
    }, [startAutoplay]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div className='py-2 rounded-md relative'
            onMouseEnter={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
            onMouseLeave={startAutoplay}>
            <Swiper
                grabCursor={true}
                loop={false}
                modules={[Pagination]}
                pagination={{ clickable: true }}
                slidesPerView={1}
                speed={600}
                initialSlide={0}
                allowTouchMove={true}
                onSwiper={handleSwiper}
                onSlideChange={handleSlideChange}
                onTouchStart={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
                onTouchEnd={startAutoplay}>

                    {bannerLists.map((item, i) => (
                        <SwiperSlide key={item.id}>
                            <div className={`carousel-item rounded-md sm:h-[500px] h-96 ${colors[i]}`}>
                                <div className='flex items-center justify-center'>
                                    <div className='hidden lg:flex justify-center w-1/2 p-8'>
                                    <div className='text-center'>
                                        <h3 className='text-3xl text-white font-bold'>
                                            {item.title}
                                        </h3>
                                        <h1 className='text-5xl text-white font-bold mt-2'>
                                            {item.subtitle}
                                        </h1>
                                        <p className='text-white font-bold mt-4'>
                                            {item.description}
                                        </p>
                                        <Link 
                                            className='mt-6 inline-block bg-black text-white py-2 px-4 rounded-sm hover:bg-gray-800'
                                            to="/products">
                                        Shop
                                        </Link>
                                    </div>
                                </div>
                                <div className='w-full flex justify-center lg:w-1/2 p-4'>
                                    <img src={item?.image}></img>
                                </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
            </Swiper>

            <button type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md">
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md">
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}


export default HeroBanner;
