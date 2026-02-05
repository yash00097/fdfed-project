export default function NotFound() {
  return (
    <div style={styles.container}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn’t exist.</p>
      <a href="/" style={styles.link}>Go Home</a>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "#fff"
  },
  link: {
    marginTop: "16px",
    color: "#38bdf8",
    textDecoration: "none",
    fontSize: "18px"
  }
};