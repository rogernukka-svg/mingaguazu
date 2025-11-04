import Navbar from './components/Navbar.jsx'
import HeroSection from './components/HeroSection.jsx'
import EjesGrid from './components/EjesGrid.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <section id="ejes" className="bg-white text-slate-900 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-jaha-red">
              Ejes del Plan de Gobierno
            </h2>
            <EjesGrid />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
