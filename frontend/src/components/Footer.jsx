export default function Footer(){

    return(
        <footer
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
      </footer> 
        
    );
}

