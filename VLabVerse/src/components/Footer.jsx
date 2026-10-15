import './Footer.css'

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7h.01" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="m10 9 5 3-5 3z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5A22 22 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v8z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
    </svg>
  )
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4c2-2 5-2 6-2 0 1 0 4-2 6l-5 5-4-4z" />
      <path d="m9 9-4 1-3 4 6 1" />
      <path d="m14 14-1 5-4 3-1-6" />
      <path d="M7 17c-2 0-3 1-4 4 3-1 4-2 4-4" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="m3 8 9 6 9-6" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4c0 1-1 2-2 2C10 21 3 14 3 5c0-1 1-2 2-2z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="vlab-footer" id="kontak">
      <div className="footer-about">
        <h3>
          <InfoIcon />
          Tentang Kami
        </h3>
      </div>

      <div className="footer-socials">
        <a
          href="https://www.youtube.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="YouTube"
        >
          <YoutubeIcon />
          <span>Youtube</span>
        </a>

        <a
          href="https://www.facebook.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
        >
          <FacebookIcon />
          <span>Facebook</span>
        </a>

        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
        >
          <InstagramIcon />
          <span>Instagram</span>
        </a>
      </div>

      <div className="footer-intro">
        <h2>
          <RocketIcon />
          Jelajahi Sains Melalui Simulasi
        </h2>
        <p>
          Laboratorium virtual untuk simulasi laju bakar propelan.
          <br />
          Pelajari parameter pengujian, jalankan simulasi, dan pahami
          hasilnya dengan lebih mudah melalui V-LabVerse.
        </p>
      </div>

      <div className="footer-contact">
        <a href="mailto:anisyabrin12@gmail.com" className="footer-contact-item">
          <MailIcon />
          <span>anisyabrin12@gmail.com</span>
        </a>

        <a href="tel:+6282386396413" className="footer-contact-item">
          <PhoneIcon />
          <span>+62 (82386396413)</span>
        </a>

        <div className="footer-contact-item footer-address">
          <LocationIcon />
          <div>
            <span>Politeknik Negeri Batam</span>
            <p>
              Jl. Ahmad Yani, Batam Center,
              <br />
              Kec. Batam Kota, Kota Batam,
              <br />
              Kepulauan Riau 29461, Indonesia
            </p>
          </div>
        </div>
      </div>

      <div className="footer-copyright">
        © {new Date().getFullYear()} V-LabVerse. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  )
}