"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react"

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
`

const mockCars = [
  {
    id: 1,
    name: "BMW X5 M Sport",
    price: "$68,500",
    image: "../src/assets/cars/bmw.jpg",
    year: "2024",
    mileage: "0 miles",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Mercedes C-Class AMG",
    price: "$52,900",
    image: "../src/assets/cars/mercedes-c-class-sedan.png",
    year: "2024",
    mileage: "0 miles",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Audi A4 Quattro",
    price: "$45,200",
    image: "../src/assets/cars/audi-a4-luxury-car.png",
    year: "2024",
    mileage: "0 miles",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Tesla Model 3 Performance",
    price: "$42,990",
    image: "../src/assets/cars/tesla-model-s.png",
    year: "2024",
    mileage: "0 miles",
    rating: 4.9,
  },
  {
    id: 5,
    name: "Porsche 911 Carrera",
    price: "$115,000",
    image: "../src/assets/cars/classic-porsche-911.png",
    year: "2024",
    mileage: "0 miles",
    rating: 5.0,
  },
  {
    id: 6,
    name: "Range Rover Evoque",
    price: "$89,500",
    image: "../src/assets/cars/range-rover-luxury-suv.png",
    year: "2024",
    mileage: "0 miles",
    rating: 4.6,
  },
  {
    id: 7,
    name: "Lexus ES Hybrid SUV",
    price: "$44,900",
    image: "../src/assets/cars/lexus.png",
    year: "2024",
    mileage: "0 miles",
    rating: 4.8,
  },
  {
    id: 8,
    name: "Ferrari F8 Tributo",
    price: "$295,000",
    image: "../src/assets/cars/ferrari.png",
    year: "2024",
    mileage: "0 miles",
    rating: 5.0,
  },
]

const carBrands = [
  [
    { name: "BMW", logo: "../src/assets/Brands/bmw-logo.png", href: "/inventory?brand=bmw" },
    { name: "Rolls Royce", logo: "../src/assets/Brands/rolls-royce.png", href: "/inventory?brand=rolls-royce" },
    { name: "Mercedes", logo: "../src/assets/Brands/benz.png", href: "/inventory?brand=mercedes" },
    { name: "Audi", logo: "../src/assets/Brands/audi.png", href: "/inventory?brand=audi" },
  ],
  [
    { name: "Volkswagen", logo: "../src/assets/Brands/volkswagen.png", href: "/inventory?brand=volkswagen" },
    { name: "Ford", logo: "../src/assets/Brands/ford.png", href: "/inventory?brand=ford" },
    { name: "Nissan", logo: "../src/assets/Brands/nissan.png", href: "/inventory?brand=nissan" },
    { name: "Chevrolet", logo: "../src/assets/Brands/chevrolet.png", href: "/inventory?brand=chevrolet" },
  ],
  [
    { name: "Toyota", logo: "../src/assets/Brands/toyota.png", href: "/inventory?brand=toyota" },
    { name: "Mini Cooper", logo: "../src/assets/Brands/mini.png", href: "/inventory?brand=mini-cooper" },
    { name: "Ferrari", logo: "../src/assets/Brands/ferrari.png", href: "/inventory?brand=ferrari" },
    { name: "Lexus", logo: "../src/assets/Brands/lexus.png", href: "/inventory?brand=lexus" },
  ],
]

const Button = ({ children, onClick, variant = "default", size = "default", className = "", ...props }) => {
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
  }

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
  }

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
  }

  const buttonStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
  }

  return (
    <button style={buttonStyle} onClick={onClick} className={className} {...props}>
      {children}
    </button>
  )
}

const Card = ({ children, className = "", style = {}, ...props }) => {
  const cardStyle = {
    background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "1rem",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    ...style,
  }

  return (
    <div style={cardStyle} className={className} {...props}>
      {children}
    </div>
  )
}

const CardContent = ({ children, className = "", style = {}, ...props }) => {
  return (
    <div style={style} className={className} {...props}>
      {children}
    </div>
  )
}

export default function Home() {
  const [currentCarSlide, setCurrentCarSlide] = useState(0)
  const [currentBrandSlide, setCurrentBrandSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const carsPerSlide = 4
  const totalCarSlides = Math.ceil(mockCars.length / carsPerSlide)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const nextCarSlide = () => {
    setCurrentCarSlide((prev) => (prev + 1) % totalCarSlides)
  }

  const prevCarSlide = () => {
    setCurrentCarSlide((prev) => (prev - 1 + totalCarSlides) % totalCarSlides)
  }

  const nextBrandSlide = () => {
    setCurrentBrandSlide((prev) => (prev + 1) % carBrands.length)
  }

  const prevBrandSlide = () => {
    setCurrentBrandSlide((prev) => (prev - 1 + carBrands.length) % carBrands.length)
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)" }}>
      <style>{styles}</style>

      <nav style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1, padding: "1.5rem", pointerEvents: "none" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 2rem",
            borderRadius: "1rem",
          }}

          // className="glass-effect"
        >
          {/* <div
            style={{
              fontSize: "1.75rem",
              fontWeight: "800",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            
          </div> */}

          <div style={{ display: "none", gap: "2.5rem", color: "white", fontWeight: "500" }} className="md:flex">
            <a
              href="#"
              style={{ color: "white", textDecoration: "none", transition: "all 0.3s", position: "relative" }}
              onMouseEnter={(e) => {
                e.target.style.color = "#667eea"
                e.target.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "white"
                e.target.style.transform = "translateY(0)"
              }}
            >
              Home
            </a>
            <a
              href="#"
              style={{ color: "white", textDecoration: "none", transition: "all 0.3s" }}
              onMouseEnter={(e) => {
                e.target.style.color = "#667eea"
                e.target.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "white"
                e.target.style.transform = "translateY(0)"
              }}
            >
              Inventory
            </a>
            <a
              href="#"
              style={{ color: "white", textDecoration: "none", transition: "all 0.3s" }}
              onMouseEnter={(e) => {
                e.target.style.color = "#667eea"
                e.target.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "white"
                e.target.style.transform = "translateY(0)"
              }}
            >
              About
            </a>
            <a
              href="#"
              style={{ color: "white", textDecoration: "none", transition: "all 0.3s" }}
              onMouseEnter={(e) => {
                e.target.style.color = "#667eea"
                e.target.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "white"
                e.target.style.transform = "translateY(0)"
              }}
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      <section
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at center, rgba(102, 126, 234, 0.15) 0%, transparent 70%), linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
          }}
        ></div>
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            transform: isVisible ? "translateY(0)" : "translateY(3rem)",
            opacity: isVisible ? 1 : 0,
            transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(3.5rem, 10vw, 9rem)",
              fontWeight: "900",
              background: "linear-gradient(135deg, #ffffff 0%, #667eea 50%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
            }}
            className="text-balance"
          >
            Find Your Dream{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              className="animate-pulse"
            >
              Ride
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.375rem",
              color: "rgba(255, 255, 255, 0.8)",
              marginBottom: "3rem",
              maxWidth: "36rem",
              margin: "0 auto 3rem auto",
              lineHeight: "1.6",
              fontWeight: "400",
            }}
            className="text-pretty"
          >
            Experience luxury, performance, and innovation with our curated collection of premium vehicles
          </p>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="premium"
              size="lg"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transform: "scale(1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05) translateY(-2px)"
                e.target.style.boxShadow = "0 12px 40px 0 rgba(240, 147, 251, 0.5)"
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1) translateY(0)"
                e.target.style.boxShadow = "0 8px 32px 0 rgba(240, 147, 251, 0.37)"
              }}
            >
              Explore Inventory
              <ArrowRight style={{ height: "1.25rem", width: "1.25rem" }} />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              style={{
                transform: "scale(1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                e.target.style.transform = "scale(1.05) translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent"
                e.target.style.transform = "scale(1) translateY(0)"
              }}
            >
              Learn More
            </Button>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "6rem",
            height: "6rem",
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)",
            borderRadius: "50%",
            filter: "blur(1px)",
          }}
          className="animate-bounce"
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            width: "5rem",
            height: "5rem",
            background: "linear-gradient(135deg, rgba(240, 147, 251, 0.3) 0%, rgba(245, 87, 108, 0.3) 100%)",
            borderRadius: "50%",
            filter: "blur(1px)",
          }}
          className="animate-pulse"
        ></div>
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "8%",
            width: "4rem",
            height: "4rem",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)",
            borderRadius: "50%",
            filter: "blur(1px)",
          }}
          className="animate-ping"
        ></div>
      </section>

      <section
        style={{
          padding: "6rem 0",
          background: "linear-gradient(180deg, rgba(12, 12, 12, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
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
              className={isVisible ? "animate-fadeInUp" : ""}
            >
              New Arrivals
            </h2>
            <p
              style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.7)", maxWidth: "32rem", margin: "0 auto" }}
              className={isVisible ? "animate-slideInLeft" : ""}
            >
              Discover our latest collection of premium vehicles, handpicked for excellence
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
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
                className={isVisible ? "animate-slideInLeft animate-glow" : ""}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(102, 126, 234, 0.2)"
                  e.target.style.transform = "scale(1.1) rotate(-5deg)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
                  e.target.style.transform = "scale(1) rotate(0deg)"
                }}
              >
                <ChevronLeft style={{ height: "1.75rem", width: "1.75rem" }} />
              </Button>

              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: `translateX(-${currentCarSlide * 100}%)`,
                  }}
                >
                  {Array.from({ length: totalCarSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} style={{ width: "100%", flexShrink: 0 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "1rem",
                          padding: "0 1rem",
                        }}
                      >
                        {mockCars
                          .slice(slideIndex * carsPerSlide, (slideIndex + 1) * carsPerSlide)
                          .map((car, index) => (
                            <Card
                              key={car.id}
                              style={{
                                transform: "scale(1)",
                                animationDelay: `${index * 200}ms`,
                              }}
                              className={isVisible ? `animate-scaleIn animate-float` : ""}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05) translateY(-12px) rotateY(5deg)"
                                e.currentTarget.style.boxShadow = "0 25px 80px 0 rgba(102, 126, 234, 0.4)"
                                e.currentTarget.style.background =
                                  "linear-gradient(145deg, rgba(102, 126, 234, 0.2) 0%, rgba(51, 65, 85, 0.8) 100%)"
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1) translateY(0) rotateY(0deg)"
                                e.currentTarget.style.boxShadow = "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                                e.currentTarget.style.background =
                                  "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)"
                              }}
                            >
                              <CardContent style={{ padding: 0 }}>
                                <div
                                  style={{
                                    position: "relative",
                                    overflow: "hidden",
                                    borderRadius: "1rem 1rem 0 0",
                                  }}
                                >
                                  <img
                                    src={car.image || "/placeholder.svg"}
                                    alt={car.name}
                                    style={{
                                      width: "100%",
                                      height: "14rem",
                                      objectFit: "cover",
                                      transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.15) rotate(2deg)")}
                                    onMouseLeave={(e) => (e.target.style.transform = "scale(1) rotate(0deg)")}
                                  />
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "1rem",
                                      right: "1rem",
                                      background: "rgba(0, 0, 0, 0.7)",
                                      backdropFilter: "blur(10px)",
                                      borderRadius: "0.5rem",
                                      padding: "0.5rem 0.75rem",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.25rem",
                                    }}
                                    className="animate-pulse"
                                  >
                                    <Star
                                      style={{
                                        height: "0.875rem",
                                        width: "0.875rem",
                                        fill: "#fbbf24",
                                        color: "#fbbf24",
                                      }}
                                    />
                                    <span style={{ color: "white", fontSize: "0.875rem", fontWeight: "600" }}>
                                      {car.rating}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ padding: "2rem" }}>
                                  <h3
                                    style={{
                                      fontSize: "1.375rem",
                                      fontWeight: "700",
                                      color: "white",
                                      marginBottom: "0.75rem",
                                      letterSpacing: "-0.01em",
                                    }}
                                  >
                                    {car.name}
                                  </h3>
                                  <p
                                    style={{
                                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                      WebkitBackgroundClip: "text",
                                      WebkitTextFillColor: "transparent",
                                      fontSize: "1.25rem",
                                      fontWeight: "800",
                                      marginBottom: "1rem",
                                    }}
                                    className="animate-shimmer"
                                  >
                                    {car.price}
                                  </p>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: "0.875rem",
                                      color: "rgba(255, 255, 255, 0.6)",
                                      marginBottom: "1.5rem",
                                    }}
                                  >
                                    <span style={{ fontWeight: "500" }}>{car.year}</span>
                                    <span style={{ fontWeight: "500" }}>{car.mileage}</span>
                                  </div>
                                  <Button
                                    style={{
                                      width: "100%",
                                      background:
                                        "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)",
                                      border: "1px solid rgba(102, 126, 234, 0.3)",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                      e.target.style.transform = "translateY(-3px) scale(1.02)"
                                      e.target.style.boxShadow = "0 10px 25px rgba(102, 126, 234, 0.4)"
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background =
                                        "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)"
                                      e.target.style.transform = "translateY(0) scale(1)"
                                      e.target.style.boxShadow = "none"
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                className={isVisible ? "animate-slideInRight animate-glow" : ""}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(102, 126, 234, 0.2)"
                  e.target.style.transform = "scale(1.1) rotate(5deg)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
                  e.target.style.transform = "scale(1) rotate(0deg)"
                }}
              >
                <ChevronRight style={{ height: "1.75rem", width: "1.75rem" }} />
              </Button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem", gap: "0.75rem" }}>
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
                    if (index !== currentCarSlide) e.target.style.background = "rgba(255, 255, 255, 0.5)"
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentCarSlide) e.target.style.background = "rgba(255, 255, 255, 0.3)"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "6rem 0",
          background: "linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2
              style={{
                fontSize: "3.5rem",
                fontWeight: "800",
                background: "linear-gradient(135deg, #ffffff 0%, #f093fb 50%, #f5576c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}
              className={isVisible ? "animate-fadeInUp" : ""}
            >
              Premium Brands
            </h2>
            <p
              style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.7)", maxWidth: "32rem", margin: "0 auto" }}
              className={isVisible ? "animate-slideInRight" : ""}
            >
              Explore vehicles from the world's most prestigious automotive manufacturers
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
                className={isVisible ? "animate-slideInLeft animate-float" : ""}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(240, 147, 251, 0.2)"
                  e.target.style.transform = "scale(1.1) rotate(-5deg)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
                  e.target.style.transform = "scale(1) rotate(0deg)"
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
                    <div key={slideIndex} style={{ width: "100%", flexShrink: 0 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "2.5rem",
                          padding: "0 1rem",
                        }}
                      >
                        {brandGroup.map((brand, index) => (
                          <a
                            key={brand.name}
                            href={brand.href}
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
                              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                              transform: "scale(1)",
                              textDecoration: "none",
                              animationDelay: `${index * 250}ms`,
                              opacity: 0,
                            }}
                            className={isVisible ? `animate-rotateIn animate-float` : ""}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(145deg, rgba(240, 147, 251, 0.3) 0%, rgba(245, 87, 108, 0.2) 100%)"
                              e.currentTarget.style.transform = "scale(1.08) translateY(-12px) rotateY(10deg)"
                              e.currentTarget.style.boxShadow = "0 25px 80px 0 rgba(240, 147, 251, 0.4)"
                              e.currentTarget.style.borderColor = "rgba(240, 147, 251, 0.5)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "linear-gradient(145deg, rgba(51, 65, 85, 0.6) 0%, rgba(71, 85, 105, 0.4) 100%)"
                              e.currentTarget.style.transform = "scale(1) translateY(0) rotateY(0deg)"
                              e.currentTarget.style.boxShadow = "none"
                              e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)"
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
                                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
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
                                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                                onMouseEnter={(e) => (e.target.style.transform = "scale(1.2) rotate(10deg)")}
                                onMouseLeave={(e) => (e.target.style.transform = "scale(1) rotate(0deg)")}
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
                className={isVisible ? "animate-slideInRight animate-float" : ""}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(240, 147, 251, 0.2)"
                  e.target.style.transform = "scale(1.1) rotate(5deg)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
                  e.target.style.transform = "scale(1) rotate(0deg)"
                }}
              >
                <ChevronRight style={{ height: "1.75rem", width: "1.75rem" }} />
              </Button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem", gap: "0.75rem" }}>
              {carBrands.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBrandSlide(index)}
                  style={{
                    width: index === currentBrandSlide ? "2rem" : "0.75rem",
                    height: "0.75rem",
                    borderRadius: "0.375rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    background:
                      index === currentBrandSlide
                        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                  className={index === currentBrandSlide ? "animate-glow" : ""}
                  onMouseEnter={(e) => {
                    if (index !== currentBrandSlide) e.target.style.background = "rgba(255, 255, 255, 0.5)"
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentBrandSlide) e.target.style.background = "rgba(255, 255, 255, 0.3)"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* <footer
        style={{
          background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)",
          borderTop: "1px solid rgba(102, 126, 234, 0.2)",
          padding: "4rem 0 2rem 0",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "3rem",
              marginBottom: "3rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "1.5rem",
                }}
              >
                AutoDealer
              </h3>
              <p style={{ color: "rgba(255, 255, 255, 0.7)", lineHeight: "1.6", fontSize: "1.125rem" }}>
                Your trusted partner in finding the perfect vehicle. Experience luxury, performance, and innovation.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: "700", color: "white", marginBottom: "1.5rem" }}>
                Quick Links
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {["Home", "Inventory", "About", "Contact"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        textDecoration: "none",
                        transition: "all 0.3s",
                        fontSize: "1.125rem",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#667eea"
                        e.target.style.transform = "translateX(8px)"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "rgba(255, 255, 255, 0.7)"
                        e.target.style.transform = "translateX(0)"
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: "700", color: "white", marginBottom: "1.5rem" }}>
                Services
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {["Buy", "Sell", "Finance", "Service"].map((service) => (
                  <li key={service}>
                    <a
                      href="#"
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        textDecoration: "none",
                        transition: "all 0.3s",
                        fontSize: "1.125rem",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#f093fb"
                        e.target.style.transform = "translateX(8px)"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "rgba(255, 255, 255, 0.7)"
                        e.target.style.transform = "translateX(0)"
                      }}
                    >
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: "700", color: "white", marginBottom: "1.5rem" }}>
                Contact
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "1.125rem",
                }}
              >
                <li style={{ fontWeight: "500" }}>123 Auto Street</li>
                <li style={{ fontWeight: "500" }}>Car City, CC 12345</li>
                <li style={{ fontWeight: "500" }}>(555) 123-4567</li>
                <li style={{ fontWeight: "500" }}>info@autodealer.com</li>
              </ul>
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(102, 126, 234, 0.2)",
              paddingTop: "2rem",
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "1.125rem",
            }}
          >
            <p>&copy; 2024 AutoDealer. All rights reserved. Crafted with passion for automotive excellence.</p>
          </div>
        </div>
      </footer> */}
    </div>
  )
}
