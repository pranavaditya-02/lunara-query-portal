import "./Footer.css"

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <p className="footer-text"> &copy; Lunara {new Date().getFullYear()} . All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

