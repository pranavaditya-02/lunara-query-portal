import "./Footer.css"

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <p className="footer-text">&copy; {new Date().getFullYear()} Lunara Event. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

