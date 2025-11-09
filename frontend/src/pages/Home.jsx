import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Crown } from "lucide-react";
import Card from "../components/Card.jsx";
import homeBgImage from "../assets/images/homeBgImage.jpeg";

const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .7;
    }
  }

  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes rotateIn {
    from {
      opacity: 0;
      transform: rotate(-10deg) scale(0.9);
    }
    to {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(102, 126, 234, 0.6);
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.6s ease-out forwards;
  }

  .animate-slideInRight {
    animation: slideInRight 0.6s ease-out forwards;
  }

  .animate-scaleIn {
    animation: scaleIn 0.7s ease-out forwards;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-rotateIn {
    animation: rotateIn 0.8s ease-out forwards;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }

  .animate-bounce {
    animation: bounce 2s infinite;
  }

  .animate-pulse {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-ping {
    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200px 100%;
  }

  .text-balance {
    text-wrap: balance;
  }

  .text-pretty {
    text-wrap: pretty;
  }

  .glass-effect {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .new-arrivals-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    width: 100%;
  }

  @media (max-width: 1200px) {
    .new-arrivals-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 992px) {
    .new-arrivals-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 576px) {
    .new-arrivals-grid {
      grid-template-columns: repeat(1, 1fr);
    }
  }
`;

const carBrands = [
  [
    {
      name: "BMW",
      logo: "../src/assets/Brands/bmw-logo.png",
      href: "/inventory?brand=bmw",
    },
    {
      name: "Rolls Royce",
      logo: "../src/assets/Brands/rolls-royce.png",
      href: "/inventory?brand=rolls-royce",
    },
    {
      name: "Mercedes",
      logo: "../src/assets/Brands/benz.png",
      href: "/inventory?brand=mercedes",
    },
    {
      name: "Audi",
      logo: "../src/assets/Brands/audi.png",
      href: "/inventory?brand=audi",
    },
  ],
  [
    {
      name: "Volkswagen",
      logo: "../src/assets/Brands/volkswagen.png",
      href: "/inventory?brand=volkswagen",
    },
    {
      name: "Ford",
      logo: "../src/assets/Brands/ford.png",
      href: "/inventory?brand=ford",
    },
    {
      name: "Nissan",
      logo: "../src/assets/Brands/nissan.png",
      href: "/inventory?brand=nissan",
    },
    {
      name: "Chevrolet",
      logo: "../src/assets/Brands/chevrolet.png",
      href: "/inventory?brand=chevrolet",
    },
  ],
  [
    {
      name: "Toyota",
      logo: "../src/assets/Brands/toyota.png",
      href: "/inventory?brand=toyota",
    },
    {
      name: "Mini Cooper",
      logo: "../src/assets/Brands/mini.png",
      href: "/inventory?brand=mini-cooper",
    },
    {
      name: "Ferrari",
      logo: "../src/assets/Brands/ferrari.png",
      href: "/inventory?brand=ferrari",
    },
    {
      name: "Lexus",
      logo: "../src/assets/Brands/lexus.png",
      href: "/inventory?brand=lexus",
    },
  ],
];

const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.75rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    border: "none",
    outline: "none",
    position: "relative",
    overflow: "hidden",
  };

  const variants = {
    default: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      boxShadow: "0 4px 15px 0 rgba(102, 126, 234, 0.4)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "inherit",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    premium: {
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "white",
      boxShadow: "0 8px 32px 0 rgba(240, 147, 251, 0.37)",
    },
  };

  const sizes = {
    default: {
      height: "2.75rem",
      paddingLeft: "1.5rem",
      paddingRight: "1.5rem",
    },
    lg: {
      height: "3.5rem",
      paddingLeft: "2.5rem",
      paddingRight: "2.5rem",
      fontSize: "1.125rem",
    },
    icon: {
      height: "2.75rem",
      width: "2.75rem",
      padding: "0",
    },
  };

  const buttonStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};


export default function Home() {
  const [currentCarSlide, setCurrentCarSlide] = useState(0);
  const [currentBrandSlide, setCurrentBrandSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topBrands, setTopBrands] = useState([]);
  const [topBrandsLoading, setTopBrandsLoading] = useState(false);
  const [topBrandsError, setTopBrandsError] = useState(null);
  // Scroll-triggered section visibility
  const heroRef = useRef(null);
  const newRef = useRef(null);
  const brandsRef = useRef(null);
  const [sectionVisible, setSectionVisible] = useState({ hero: false, new: false, brands: false });

 const carsPerSlide = 3;
const limitedCars = cars.slice(0, 9);
const totalCarSlides = Math.ceil(limitedCars.length / carsPerSlide);


  useEffect(() => {
    setIsVisible(true);
    fetchNewArrivals();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          if (entry.target === heroRef.current) {
            setSectionVisible((prev) => ({ ...prev, hero: isIntersecting }));
          } else if (entry.target === newRef.current) {
            setSectionVisible((prev) => ({ ...prev, new: isIntersecting }));
          } else if (entry.target === brandsRef.current) {
            setSectionVisible((prev) => ({ ...prev, brands: isIntersecting }));
          }
        });
      },
      { threshold: 0.6 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (newRef.current) observer.observe(newRef.current);
    if (brandsRef.current) observer.observe(brandsRef.current);

    return () => observer.disconnect();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/backend/cars/inventory`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        // Get first 9 cars, already sorted by newest first from backend
        setCars(data.cars.slice(0, 9));
      } else {
        console.error('API returned success: false', data.message);
        setCars([]);
      }
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch top-selling brands (past 12 months, up to 9 brands)
  useEffect(() => {
    const fetchTopBrands = async () => {
      try {
        setTopBrandsLoading(true);
        const res = await fetch('/backend/cars/top-brands?months=12&limit=5');
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Top brands failed ${res.status}: ${txt}`);
        }
        const json = await res.json();
        setTopBrands(Array.isArray(json.brands) ? json.brands : []);
      } catch (err) {
        console.error('Error fetching top brands:', err);
        setTopBrandsError(err.message);
      } finally {
        setTopBrandsLoading(false);
      }
    };
    fetchTopBrands();
  }, []);



  const nextCarSlide = () => {
    if (totalCarSlides > 1) {
      setCurrentCarSlide((prev) => (prev + 1) % totalCarSlides);
    }
  };

  const prevCarSlide = () => {
    if (totalCarSlides > 1) {
      setCurrentCarSlide((prev) => (prev - 1 + totalCarSlides) % totalCarSlides);
    }
  };

  const nextBrandSlide = () => {
    setCurrentBrandSlide((prev) => (prev + 1) % carBrands.length);
  };

  const prevBrandSlide = () => {
    setCurrentBrandSlide(
      (prev) => (prev - 1 + carBrands.length) % carBrands.length
    );
  };

  return (
    <div>
      <style>{styles}</style>


{/* hero section */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          height: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          paddingLeft: "2rem",
          paddingTop: "10rem",
          backgroundImage: `url(${homeBgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "left",
            transform: sectionVisible.hero ? "translateY(0)" : "translateY(3rem)",
            opacity: sectionVisible.hero ? 1 : 0,
            transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            maxWidth: "1000px",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.5rem, 8vw, 6rem)",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #ffffff 0%, #667eea 50%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
            }}
            className="text-balance"
          >
            Find Your Dream
            <br />
            <span
              style={{
                display: "block",
                background: "linear-gradient(135deg,rgb(228, 40, 6) 0%, #f5576c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              className={`animate-pulse ${sectionVisible.hero ? "animate-glow" : ""}`}
            >
              RIDE
            </span>
          </h1>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
          </div>
        </div>
      </section>

      {/* Most Selling Brands — Leaderboard (last 12 months, top 9) */}
      <section

      >

      </section>
{/* new section */}
      <section
        ref={newRef}
        style={{
          padding: "6rem 0",
          background:
            "linear-gradient(180deg, rgba(12, 12, 12, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)",
          scrollSnapAlign: "start",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <h2
              style={{
                fontSize: "3.5rem",
                fontWeight: "800",
                background: "linear-gradient(135deg, #ffffff 0%, #667eea 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}
              className={sectionVisible.new ? "animate-fadeInUp" : ""}
            >
              New Arrivals
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "rgba(255, 255, 255, 0.7)",
                maxWidth: "32rem",
                margin: "0 auto",
              }}
              className={sectionVisible.new ? "animate-slideInLeft" : ""}
            >
              Discover our latest collection of premium vehicles, handpicked for
              excellence
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {!loading && cars.length > 0 && totalCarSlides > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevCarSlide}
                  style={{
                    color: "white",
                    marginRight: "1.5rem",
                    height: "3.5rem",
                    width: "3.5rem",
                    borderRadius: "50%",
                    backdropFilter: "blur(10px)",
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
                  className={sectionVisible.new ? "animate-slideInLeft animate-glow" : ""}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(102, 126, 234, 0.2)";
                    e.target.style.transform = "scale(1.1) rotate(-5deg)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    e.target.style.transform = "scale(1) rotate(0deg)";
                  }}
                >
                  <ChevronLeft style={{ height: "1.75rem", width: "1.75rem" }} />
                </Button>
              )}

              <div style={{ flex: 1, overflow: "hidden" }}>
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "4rem",
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        border: "4px solid rgba(102, 126, 234, 0.3)",
                        borderTop: "4px solid #667eea",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : cars.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: `translateX(-${currentCarSlide * 100}%)`,
                    }}
                  >
                    {Array.from({ length: totalCarSlides }).map(
                      (_, slideIndex) => (
                        <div
                          key={slideIndex}
                          style={{ width: "100%", flexShrink: 0 }}
                        >
                          <div className="new-arrivals-grid">
                            {limitedCars
                               .slice(
                                slideIndex * carsPerSlide,
                                (slideIndex + 1) * carsPerSlide
                              )
                              .map((car, index) => (
                                <div
                                  key={car._id}
                                  style={{
                                    animationDelay: `${index * 200}ms`,
                                  }}
                                  className={sectionVisible.new ? `animate-scaleIn` : ""}
                                >
                                  <Card car={car} />
                                </div>
                              ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "4rem",
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "1.125rem",
                    }}
                  >
                    No new arrivals at the moment. Check back soon!
                  </div>
                )}
              </div>

              {!loading && cars.length > 0 && totalCarSlides > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextCarSlide}
                  style={{
                    color: "white",
                    marginLeft: "1.5rem",
                    height: "3.5rem",
                    width: "3.5rem",
                    borderRadius: "50%",
                    backdropFilter: "blur(10px)",
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
                  className={sectionVisible.new ? "animate-slideInRight animate-glow" : ""}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(102, 126, 234, 0.2)";
                    e.target.style.transform = "scale(1.1) rotate(5deg)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    e.target.style.transform = "scale(1) rotate(0deg)";
                  }}
                >
                  <ChevronRight style={{ height: "1.75rem", width: "1.75rem" }} />
                </Button>
              )}
            </div>

            {!loading && cars.length > 0 && totalCarSlides > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "3rem",
                  gap: "0.75rem",
                }}
              >
                {Array.from({ length: totalCarSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCarSlide(index)}
                    style={{
                      width: index === currentCarSlide ? "2rem" : "0.75rem",
                      height: "0.75rem",
                      borderRadius: "0.375rem",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      background:
                        index === currentCarSlide
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "rgba(255, 255, 255, 0.3)",
                    }}
                    className={index === currentCarSlide ? "animate-pulse" : ""}
                    onMouseEnter={(e) => {
                      if (index !== currentCarSlide)
                        e.target.style.background = "rgba(255, 255, 255, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                      if (index !== currentCarSlide)
                        e.target.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
{/* brands section */}
      <section
        ref={brandsRef}
        style={{
          padding: "6rem 0",
          background:
            "linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)",
          scrollSnapAlign: "start",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2
              style={{
                fontSize: "3.5rem",
                fontWeight: "800",
                background:
                  "linear-gradient(135deg, #ffffff 0%, #f093fb 50%, #f5576c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}
              className={sectionVisible.brands ? "animate-fadeInUp" : ""}
            >
              Premium Brands
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "rgba(255, 255, 255, 0.7)",
                maxWidth: "32rem",
                margin: "0 auto",
              }}
              className={sectionVisible.brands ? "animate-slideInRight" : ""}
            >
              Explore vehicles from the world's most prestigious automotive
              manufacturers
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevBrandSlide}
                style={{
                  color: "white",
                  marginRight: "1.5rem",
                  height: "3.5rem",
                  width: "3.5rem",
                  borderRadius: "50%",
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.05)",
                }}
                className={sectionVisible.brands ? "animate-slideInLeft animate-float" : ""}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(240, 147, 251, 0.2)";
                  e.target.style.transform = "scale(1.1) rotate(-5deg)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  e.target.style.transform = "scale(1) rotate(0deg)";
                }}
              >
                <ChevronLeft style={{ height: "1.75rem", width: "1.75rem" }} />
              </Button>

              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: `translateX(-${currentBrandSlide * 100}%)`,
                  }}
                >
                  {carBrands.map((brandGroup, slideIndex) => (
                    <div
                      key={slideIndex}
                      style={{ width: "100%", flexShrink: 0 }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "2.5rem",
                          padding: "0 1rem",
                        }}
                      >
                        {brandGroup.map((brand, index) => (
                          <a
                            key={brand.name}
                            href={brand.href}
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = brand.href;
                            }}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "2.5rem 2rem",
                              borderRadius: "1.25rem",
                              background:
                                "linear-gradient(145deg, rgba(51, 65, 85, 0.6) 0%, rgba(71, 85, 105, 0.4) 100%)",
                              backdropFilter: "blur(20px)",
                              border: "1px solid rgba(148, 163, 184, 0.2)",
                              transition:
                                "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                              transform: "scale(1)",
                              textDecoration: "none",
                              animationDelay: `${index * 250}ms`,
                              opacity: 0,
                            }}
                            className={sectionVisible.brands ? `animate-rotateIn animate-float` : ""}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(145deg, rgba(240, 147, 251, 0.3) 0%, rgba(245, 87, 108, 0.2) 100%)";
                              e.currentTarget.style.transform =
                                "scale(1.08) translateY(-12px) rotateY(10deg)";
                              e.currentTarget.style.boxShadow =
                                "0 25px 80px 0 rgba(240, 147, 251, 0.4)";
                              e.currentTarget.style.borderColor =
                                "rgba(240, 147, 251, 0.5)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(145deg, rgba(51, 65, 85, 0.6) 0%, rgba(71, 85, 105, 0.4) 100%)";
                              e.currentTarget.style.transform =
                                "scale(1) translateY(0) rotateY(0deg)";
                              e.currentTarget.style.boxShadow = "none";
                              e.currentTarget.style.borderColor =
                                "rgba(148, 163, 184, 0.2)";
                            }}
                          >
                            <div
                              style={{
                                width: "7rem",
                                height: "7rem",
                                marginBottom: "1.5rem",
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition:
                                  "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                              }}
                              className="animate-pulse"
                            >
                              <img
                                src={brand.logo || "/placeholder.svg"}
                                alt={brand.name}
                                style={{
                                  width: "4.5rem",
                                  height: "4.5rem",
                                  objectFit: "contain",
                                  transition:
                                    "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.transform =
                                    "scale(1.2) rotate(10deg)")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.transform =
                                    "scale(1) rotate(0deg)")
                                }
                              />
                            </div>
                            <span
                              style={{
                                color: "white",
                                fontWeight: "600",
                                fontSize: "1.125rem",
                                transition: "all 0.4s ease",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {brand.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextBrandSlide}
                style={{
                  color: "white",
                  marginLeft: "1.5rem",
                  height: "3.5rem",
                  width: "3.5rem",
                  borderRadius: "50%",
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.05)",
                }}
                className={sectionVisible.brands ? "animate-slideInRight animate-float" : ""}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(240, 147, 251, 0.2)";
                  e.target.style.transform = "scale(1.1) rotate(5deg)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  e.target.style.transform = "scale(1) rotate(0deg)";
                }}
              >
                <ChevronRight style={{ height: "1.75rem", width: "1.75rem" }} />
              </Button>
            </div>

            {/* Removed premium brands carousel scroll indicator */}
          </div>
        </div>
      </section>

{/* Most Selling Brands section*/}
   <div style={{ backgroundColor: "rgba(18, 24, 38, 0.95)" }}>
    <motion.section
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      style={{
        padding: "4rem 0",
        background:
          "linear-gradient(180deg, rgba(18, 24, 38, 0.95) 0%, rgba(15, 23, 36, 0.95) 100%)",
        scrollSnapAlign: "start",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "2.25rem",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #facc15 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Most Selling Brands
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.75)" }}>
            Top 5 Selling brands.
          </p>
        </div>

        {topBrandsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-yellow-400 border-gray-600"></div>
          </div>
        ) : topBrandsError ? (
          <div style={{ textAlign: "center", color: "#fca5a5" }}>
            Failed to load leaderboard: {topBrandsError}
          </div>
        ) : (
          <div
            style={{
              maxWidth: "560px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {topBrands.map((b, idx) => {
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const baseStyle = {
                padding: "1rem 1.5rem",
                borderRadius: "1rem",
                border: "1px solid rgba(148,163,184,0.25)",
                background:
                  "linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.7) 100%)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                transition: "all 0.3s ease-out",
              };
              const top1Style = {
                background:
                  "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(250, 204, 21, 0.2))",
                borderColor: "rgba(250, 204, 21, 0.6)",
                boxShadow: "0 0 22px rgba(234,179,8,0.25)",
                transform: "scale(1.03)",
              };
              const top2Style = {
                background:
                  "linear-gradient(135deg, rgba(203, 213, 225, 0.25), rgba(147, 197, 253, 0.2))",
                borderColor: "rgba(147, 197, 253, 0.6)",
                boxShadow: "0 0 20px rgba(147,197,253,0.25)",
                transform: "scale(1.01)",
              };
              const style = isTop1
                ? { ...baseStyle, ...top1Style }
                : isTop2
                ? { ...baseStyle, ...top2Style }
                : baseStyle;

              return (
                <motion.div
                  key={b.brand || idx}
                  style={style}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.15,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                >
                  <div
                    style={{
                      width: isTop1 ? "3rem" : isTop2 ? "2.75rem" : "2.5rem",
                      height: isTop1 ? "3rem" : isTop2 ? "2.75rem" : "2.5rem",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isTop1 ? "#000" : isTop2 ? "#000" : "#fff",
                      background: isTop1
                        ? "linear-gradient(135deg, #fde047, #f59e0b)"
                        : isTop2
                        ? "linear-gradient(135deg, #e0f2fe, #93c5fd)"
                        : "#1e293b",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "1.2rem",
                        }}
                      >
                        {b.brand}
                      </span>
                      {isTop1 && <Crown width={22} height={22} color="#facc15" />}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem" }}>
                      Sold:{" "}
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        }}
                      >
                        {b.soldCount}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
    </div>


    </div>
  );
}
