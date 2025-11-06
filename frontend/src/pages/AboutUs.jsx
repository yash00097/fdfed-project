import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';
import ReviewModal from '../components/ReviewModal';
import { 
  Car, Shield, Heart, DollarSign, Search, CheckCircle2, FileText, Truck, 
  Mail, Phone, MessageCircle, Star, ArrowRight, Sparkles, Award, Users,
  TrendingUp, Clock, MapPin, Zap, Target, ThumbsUp
} from 'lucide-react';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);
      
      if (progress < 1) {
        setCount(Math.floor(end * progress));
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// 3D Tilt Card Component
const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]));
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]));

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Floating Particle Component
const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-2 h-2 bg-red-500/30 rounded-full"
    initial={{ y: 0, opacity: 0 }}
    animate={{
      y: [-20, -100],
      opacity: [0, 1, 0],
      x: [0, Math.random() * 100 - 50]
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay,
      ease: 'easeOut'
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: '100%'
    }}
  />
);

export default function About() {
  const [isVisible, setIsVisible] = useState({});
  const [reviews, setReviews] = useState([]);
  const [eligiblePurchases, setEligiblePurchases] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:3000/backend/reviews');
        if (response.data.success) {
          setReviews(response.data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const fetchEligiblePurchases = async () => {
      if (!currentUser) return;
      try {
        const response = await axios.get('http://localhost:3000/backend/reviews/eligible', {
          withCredentials: true
        });
        if (response.data.success) {
          setEligiblePurchases(response.data.purchases);
          setCanReview(response.data.canReview);
        }
      } catch (error) {
        console.error('Error fetching eligible purchases:', error);
      }
    };
    fetchEligiblePurchases();
  }, [currentUser]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.observe-section');
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const stats = [
    { icon: Car, value: 5000, suffix: '+', label: 'Cars Sold', color: 'from-red-500 to-orange-500' },
    { icon: Users, value: 10000, suffix: '+', label: 'Happy Customers', color: 'from-blue-500 to-cyan-500' },
    { icon: Award, value: 98, suffix: '%', label: 'Satisfaction Rate', color: 'from-green-500 to-emerald-500' },
    { icon: Clock, value: 24, suffix: '/7', label: 'Support Available', color: 'from-purple-500 to-pink-500' }
  ];

  const values = [
    { icon: Shield, title: "Trust & Transparency", description: "Every car is thoroughly inspected by certified agents to ensure quality and reliability.", color: 'from-blue-500 to-cyan-500' },
    { icon: Heart, title: "Customer-Centric", description: "We prioritize a hassle-free experience with personalized service at every step.", color: 'from-red-500 to-pink-500' },
    { icon: DollarSign, title: "Affordability & Quality", description: "Competitive pricing without compromising on vehicle quality and condition.", color: 'from-green-500 to-emerald-500' }
  ];

  const processes = [
    { number: 1, icon: FileText, title: "List Your Car", description: "Submit car details with photos through our secure platform." },
    { number: 2, icon: Search, title: "Agent Verification", description: "Certified agents inspect your car within 1-10 days." },
    { number: 3, icon: CheckCircle2, title: "Approval & Listing", description: "Your verified car appears in our premium inventory." },
    { number: 4, icon: Truck, title: "Purchase & Delivery", description: "Secure transactions and smooth delivery to buyers." }
  ];

  const timeline = [
    { year: '2020', title: "The Beginning", description: "Founded with the vision of transforming the second-hand car industry.", icon: Sparkles },
    { year: '2022', title: "Innovation & Growth", description: "Introduced our unique agent verification system for quality assurance.", icon: TrendingUp },
    { year: '2024', title: "Today", description: "Leading the used car marketplace with technology and trust.", icon: Target }
  ];

  const team = [
    { name: 'Yashwanth', role: 'Full Stack Developer', avatar: '👨‍💻', email: 'yashwanth@primewheels.com', github: 'https://github.com/yashwanth' },
    { name: 'Siddeshwer Reddy', role: 'Backend Developer', avatar: '👨‍💼', email: 'siddeshwer@primewheels.com', github: 'https://github.com/siddeshwer' },
    { name: 'Sandeep', role: 'Frontend Developer', avatar: '👨‍🎨', email: 'sandeep@primewheels.com', github: 'https://github.com/sandeep' },
    { name: 'Dileep', role: 'UI/UX Designer', avatar: '🎨', email: 'dileep@primewheels.com', github: 'https://github.com/dileep' },
    { name: 'Rakesh', role: 'DevOps Engineer', avatar: '⚙️', email: 'rakesh@primewheels.com', github: 'https://github.com/rakesh' }
  ];

  const displayedReviews = reviews.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-gray-100 font-sans overflow-x-hidden">
      {/* Hero Section with Particles */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(255, 78, 80, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(249, 212, 35, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(255, 78, 80, 0.15) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.2} />
        ))}

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Animated Logo */}
            <motion.div
              className="inline-block mb-8"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-400 blur-3xl opacity-50" />
                <Car className="relative w-20 h-20 text-red-500" strokeWidth={1.5} />
              </div>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-tight">
              About{' '}
              <motion.span 
                className="inline-block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Prime Wheels
              </motion.span>
            </h1>
            
            <motion.div
              className="flex items-center justify-center gap-4 mb-6"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.div 
                className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent w-32"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Sparkles className="w-7 h-7 text-yellow-400" />
              <motion.div 
                className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent w-32"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              Your trusted marketplace for premium pre-owned vehicles
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.button
                className="px-7 py-3.5 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full font-semibold text-base flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 78, 80, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Cars <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="px-7 py-3.5 bg-slate-700 border border-slate-600 rounded-full font-semibold text-base hover:bg-slate-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1 h-2 bg-red-500 rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <TiltCard className="bg-gradient-to-br from-slate-800/80 to-slate-700/50 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className={`inline-block p-3 bg-gradient-to-br ${stat.color} bg-opacity-20 rounded-xl mb-3`}>
                    <stat.icon className="w-8 h-8 text-gray-100" strokeWidth={1.5} />
                  </div>
                  <div className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-400 font-medium text-sm">{stat.label}</div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section with Split Design */}
      <section id="about" className="observe-section py-16 px-6 bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-10 items-center"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.about ? 'visible' : 'hidden'}
          >
            <motion.div variants={itemVariants} className="space-y-5">
              <motion.h2 
                className="text-4xl md:text-5xl font-black leading-tight"
                initial={{ opacity: 0, x: -50 }}
                animate={isVisible.about ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                Welcome to{' '}
                <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                  Prime Wheels
                </span>
              </motion.h2>
              <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full" />
              <p className="text-lg text-gray-300 leading-relaxed">
                Your trusted marketplace for high-quality pre-owned cars. We are dedicated to providing 
                a seamless and secure car buying & selling experience.
              </p>
              <p className="text-base text-gray-400 leading-relaxed">
                Our platform connects buyers and sellers while ensuring every vehicle meets strict quality 
                standards through our professional agent verification system.
              </p>
              <div className="flex gap-4 pt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300 text-sm">Verified Sellers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300 text-sm">Quality Assured</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <TiltCard>
                <div className="relative aspect-square bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl overflow-hidden border border-slate-600">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-yellow-400/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent"
                    />
                    <Car className="w-40 h-40 text-red-500 relative z-10" strokeWidth={1} />
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="observe-section py-16 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.reviews ? { opacity: 1, y: 0 } : {}}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              What Our{' '}
              <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                Customers Say
              </span>
            </h2>
            <div className="flex items-center justify-center gap-3 mt-5">
              <motion.div 
                className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent w-28"
                animate={{ scaleX: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <motion.div 
                className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent w-28"
                animate={{ scaleX: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {loadingReviews ? (
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Car className="w-12 h-12 text-red-500 mx-auto" />
              </motion.div>
              <p className="mt-4 text-gray-400 text-sm">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <>
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
                variants={containerVariants}
                initial="hidden"
                animate={isVisible.reviews ? 'visible' : 'hidden'}
              >
                {displayedReviews.map((review) => (
                  <motion.div key={review._id} variants={itemVariants}>
                    <ReviewCard
                      review={review}
                      isOwner={currentUser && review.user?._id === currentUser._id}
                      onEdit={(review) => { setEditingReview(review); setShowReviewModal(true); }}
                      onDelete={async (reviewId) => {
                        if (!window.confirm('Are you sure?')) return;
                        try {
                          const response = await axios.delete(`http://localhost:3000/backend/reviews/${reviewId}`, { withCredentials: true });
                          if (response.data.success) {
                            setReviews(reviews.filter(r => r._id !== reviewId));
                            alert('Review deleted successfully!');
                          }
                        } catch (error) {
                          alert(error.response?.data?.error || 'Failed to delete review');
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {reviews.length > 4 && (
                <motion.div className="text-center">
                  <motion.button
                    onClick={() => navigate('/reviews')}
                    className="group relative inline-flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full font-semibold text-base overflow-hidden shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">View All Reviews</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <p className="mt-3 text-gray-400 text-sm">Showing 4 of {reviews.length} reviews</p>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-lg text-gray-400">No reviews yet. Be the first!</p>
            </motion.div>
          )}

          {currentUser && canReview && (
            <motion.div className="text-center mt-10">
              <motion.button
                onClick={() => { setEditingReview(null); setShowReviewModal(true); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full font-semibold text-sm shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ➕ Add Your Review
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Values with 3D Cards */}
      <section id="values" className="observe-section py-16 px-6 bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              Our Core{' '}
              <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.values ? 'visible' : 'hidden'}
          >
            {values.map((value, index) => (
              <motion.div key={index} variants={itemVariants}>
                <TiltCard className="h-full">
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 hover:border-slate-500 transition-colors h-full group">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-yellow-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="relative z-10">
                      <motion.div
                        className={`inline-block p-3 bg-gradient-to-br ${value.color} bg-opacity-20 rounded-xl mb-4`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <value.icon className="w-10 h-10 text-gray-100" strokeWidth={1.5} />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-3 text-gray-100">{value.title}</h3>
                      <p className="text-gray-400 leading-relaxed text-sm">{value.description}</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works with Animation */}
      <section id="howitworks" className="observe-section py-16 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              How It{' '}
              <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.howitworks ? 'visible' : 'hidden'}
          >
            {processes.map((process, index) => (
              <motion.div key={index} variants={itemVariants}>
                <TiltCard className="h-full">
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-5 border border-slate-600 hover:border-red-500/50 transition-all duration-300 h-full group overflow-hidden">
                    {/* Top gradient bar */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-yellow-400"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    />
                    
                    {/* Number badge */}
                    <div className="absolute top-3 right-3 w-9 h-9 bg-gradient-to-br from-red-500 to-yellow-400 rounded-full flex items-center justify-center font-bold text-base shadow-lg">
                      {process.number}
                    </div>

                    <motion.div
                      className="inline-block p-3 bg-gradient-to-br from-red-500/20 to-yellow-400/20 rounded-xl mb-4 mt-7"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <process.icon className="w-10 h-10 text-red-500" strokeWidth={1.5} />
                    </motion.div>

                    <h3 className="text-lg font-bold mb-2 text-gray-100">{process.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{process.description}</p>

                    {/* Connection line for non-last items */}
                    {index < processes.length - 1 && (
                      <motion.div
                        className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-red-500 to-transparent"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                      />
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section id="journey" className="observe-section py-16 px-6 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              Our{' '}
              <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500/20 via-red-500/60 to-red-500/20 hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col gap-6`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Timeline dot with icon */}
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-red-500 to-yellow-400 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-xl z-10 hidden md:flex cursor-pointer"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setActiveTimeline(index)}
                  >
                    <item.icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </motion.div>

                  {/* Content card */}
                  <motion.div
                    className={`w-full md:w-[calc(50%-3.5rem)] ${
                      index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TiltCard>
                      <div className={`bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border-2 ${
                        activeTimeline === index ? 'border-red-500' : 'border-slate-600'
                      } transition-colors cursor-pointer`}
                      onClick={() => setActiveTimeline(index)}
                      >
                        <motion.div
                          className="inline-block px-3 py-1 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full text-xs font-bold mb-3"
                          animate={activeTimeline === index ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {item.year}
                        </motion.div>
                        <h3 className="text-xl font-bold mb-3 text-red-500">{item.title}</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">{item.description}</p>
                      </div>
                    </TiltCard>
                  </motion.div>

                  {/* Spacer */}
                  <div className="hidden md:block w-[calc(50%-3.5rem)]" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              Meet Our{' '}
              <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                Team
              </span>
            </h2>
            <p className="text-base text-gray-400 mt-3">The talented developers behind Prime Wheels</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {team.map((member, index) => (
              <motion.div key={index} variants={itemVariants}>
                <TiltCard>
                  <motion.div
                    className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-5 border border-slate-600 hover:border-red-500/50 transition-all text-center group cursor-pointer"
                    whileHover={{ y: -8 }}
                  >
                    <motion.div
                      className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-red-500/20 to-yellow-400/20 rounded-full flex items-center justify-center text-4xl border-2 border-slate-600 group-hover:border-red-500/50 transition-colors"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {member.avatar}
                    </motion.div>
                    <h3 className="text-base font-bold mb-1 text-gray-100">{member.name}</h3>
                    <p className="text-gray-400 text-xs mb-3">{member.role}</p>
                    <motion.div
                      className="pt-3 border-t border-slate-600 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <motion.a
                        href={`mailto:${member.email}`}
                        className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors text-sm"
                        whileHover={{ scale: 1.15 }}
                        title="Email"
                      >
                        ✉️
                      </motion.a>
                      <motion.a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors text-sm"
                        whileHover={{ scale: 1.15 }}
                        title="GitHub"
                      >
                        💻
                      </motion.a>
                    </motion.div>
                  </motion.div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Achievement Badges */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              Our{' '}
              <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                Achievements
              </span>
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Award, label: 'Best Platform 2024', color: 'from-yellow-500 to-orange-500' },
              { icon: ThumbsUp, label: 'Top Rated Service', color: 'from-green-500 to-emerald-500' },
              { icon: Zap, label: 'Fastest Growing', color: 'from-blue-500 to-cyan-500' },
              { icon: Target, label: 'Customer Choice', color: 'from-purple-500 to-pink-500' }
            ].map((badge, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-5 border border-slate-600 text-center">
                  <motion.div
                    className={`inline-block p-3 bg-gradient-to-br ${badge.color} bg-opacity-20 rounded-xl mb-3`}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <badge.icon className="w-9 h-9 text-gray-100" strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-xs font-semibold text-gray-300">{badge.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section with Animation */}
      <section id="contact" className="observe-section py-16 px-6 bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.contact ? { opacity: 1, y: 0 } : {}}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              Get in{' '}
              <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.contact ? 'visible' : 'hidden'}
          >
            {[
              { icon: Mail, title: "Email Us", value: "support@primewheels.com", href: "mailto:support@primewheels.com", color: 'from-red-500 to-orange-500' },
              { icon: Phone, title: "Call Us", value: "+91 9876543210", href: "tel:+919876543210", color: 'from-green-500 to-emerald-500' },
              { icon: MessageCircle, title: "Live Chat", value: "Available 24/7", href: null, color: 'from-blue-500 to-cyan-500' }
            ].map((method, index) => (
              <motion.div key={index} variants={itemVariants}>
                <TiltCard>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 hover:border-red-500/50 transition-all text-center h-full group">
                    <motion.div
                      className={`inline-block p-3 bg-gradient-to-br ${method.color} bg-opacity-20 rounded-xl mb-4`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <method.icon className="w-10 h-10 text-gray-100" strokeWidth={1.5} />
                    </motion.div>

                    <h3 className="text-xl font-bold mb-3 text-gray-100">{method.title}</h3>

                    {method.href ? (
                      <motion.a
                        href={method.href}
                        className="text-base text-red-500 font-semibold hover:text-yellow-400 transition-colors inline-block"
                        whileHover={{ scale: 1.05 }}
                      >
                        {method.value}
                      </motion.a>
                    ) : (
                      <p className="text-gray-400 text-sm">{method.value}</p>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="mt-16 text-center bg-gradient-to-r from-red-500/10 to-yellow-400/10 rounded-2xl p-10 border border-red-500/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-100">Ready to Find Your Dream Car?</h3>
            <p className="text-base text-gray-400 mb-7 max-w-2xl mx-auto">
              Join thousands of satisfied customers who found their perfect vehicle with Prime Wheels
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.button
                className="px-7 py-3.5 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full font-semibold text-base flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 78, 80, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Cars <Car className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="px-7 py-3.5 bg-slate-700 border border-slate-600 rounded-full font-semibold text-base hover:bg-slate-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sell Your Car
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-4 gap-10 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-3xl font-black mb-3">
                <span className="bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                  Prime Wheels
                </span>
              </h3>
              <p className="text-gray-400 mb-5 max-w-md text-sm">
                Your trusted marketplace for premium pre-owned vehicles. Quality assured, verified sellers, transparent pricing.
              </p>
              <div className="flex gap-3">
                {['📱', '📸', '🐦', '💼'].map((icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-lg hover:border-red-500 transition-colors"
                    whileHover={{ y: -5, scale: 1.1 }}
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base font-bold mb-3 text-gray-200">Quick Links</h4>
              <ul className="space-y-2">
                {['About Us', 'How It Works', 'Our Team', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-base font-bold mb-3 text-gray-200">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-xs">Srikalahasti, India</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-xs">+91 9876543210</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-xs">support@primewheels.com</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-800 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Prime Wheels. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        eligiblePurchases={eligiblePurchases}
        onReviewSubmitted={(newReview) => {
          if (editingReview) {
            setReviews(reviews.map(r => r._id === newReview._id ? newReview : r));
          } else {
            setReviews([newReview, ...reviews]);
            setCanReview(false);
          }
        }}
        editReview={editingReview}
      />
    </div>
  );
}