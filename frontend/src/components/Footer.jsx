import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  // Only show hiring CTA to signed-in normal users (not admin/agent, not guests)
  const isAgentHiringPage = location.pathname === "/agent-hiring";
  const showAgentHiringCTA = currentUser?.role === "normalUser" && !isAgentHiringPage;

  return (
    <div className="bg-[#cfe2dd] w-full py-0">

      {/* FULL WIDTH CARD */}
      <footer className="w-full bg-[#063940] text-gray-300 shadow-lg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg width="100%" height="100%">
            <path d="M 0 300 L 600 0" stroke="white" strokeWidth="1" />
            <path d="M 300 400 L 900 0" stroke="white" strokeWidth="1" />
            <path d="M 600 450 L 1200 0" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        {/* Inner content */}
        <div
          className={`px-10 py-14 grid grid-cols-1 ${
            showAgentHiringCTA ? "md:grid-cols-4" : "md:grid-cols-3"
          } gap-12 max-w-7xl mx-auto`}
        >

          {/* BRAND */}
          <div>
            <h2 className="text-2xl font-semibold text-white">PrimeWheels</h2>
            <p className="mt-4 text-gray-400 leading-relaxed">
              A trusted marketplace for high-quality second-hand cars.
              Buy and sell with confidence, transparency, and reliability.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { i: "facebook", url: "https://facebook.com" },
                { i: "instagram", url: "https://instagram.com" },
                { i: "linkedin", url: "https://linkedin.com" },
                { i: "twitter", url: "https://x.com" },
              ].map((s) => (
                <a
                  key={s.i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-gray-500 rounded-lg hover:bg-white hover:text-black transition"
                >
                  <i className={`fab fa-${s.i}`}></i>
                </a>
              ))}
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mt-6 px-4 py-2 border border-gray-500 rounded-lg text-sm hover:bg-gray-100 hover:text-black transition"
            >
              ↑ Back to Top
            </button>
          </div>

          {/* Site Map */}
          <div>
            <h3 className="text-lg text-white font-semibold mb-5">Site Map</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link to="/" className="hover:text-white">Homepage</Link></li>
              <li><Link to="/inventory" className="hover:text-white">Browse Cars</Link></li>
              <li><Link to="/sell-car" className="hover:text-white">Sell Your Car</Link></li>
              <li><Link to="/about-us" className="hover:text-white">About Us</Link></li>
              <li><Link to="/" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg text-white font-semibold mb-5">Legal</h3>
            <ul className="space-y-3 text-gray-300">
              <li><a className="hover:text-white">Privacy Policy</a></li>
              <li><a className="hover:text-white">Terms of Service</a></li>
              <li><a className="hover:text-white">Support &amp; Help</a></li>
            </ul>
          </div>

          {/* Hiring CTA (normal users only) */}
          {showAgentHiringCTA && (
            <div className="md:justify-self-end">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#d7a33c]/25 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-cyan-300/10 blur-2xl" />

                <p className="text-xs font-semibold tracking-widest text-[#d7a33c] uppercase">
                  We’re hiring
                </p>
                <h4 className="mt-2 text-xl font-semibold text-white leading-snug">
                  Become a PrimeWheels Agent
                </h4>
                <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                  Join our team and grow your career with PrimeWheels.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    to="/agent-hiring"
                    className="inline-flex items-center justify-center rounded-xl bg-[#d7a33c] px-4 py-2 text-sm font-semibold text-black hover:brightness-95 transition"
                  >
                    Apply Now
                  </Link>
                  <span className="text-xs text-gray-400">
                    Takes ~2 minutes
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom strip */}
        <div className="bg-[#d7a33c] text-black text-center py-3 text-sm font-medium w-full">
          © {new Date().getFullYear()} PrimeWheels — All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
