
import Miku, {useState, useEffect} from "Miku";
import { workLoop } from "../../src/render/render.ts";
const aa = document.body.querySelector("#app");
export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [ballPosition, setBallPosition] = useState({ x: 67, y: 67 })

  useEffect(() => {
    setIsVisible(true)

    // Animated ping pong ball
    const interval = setInterval(() => {
      setBallPosition((prev) => ({
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
      }))
    }, 2000)

    return () => {
      console.log("Clearing interval for ball position")
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 3000)

    return () => {
        console.log("Clearing interval")
        clearInterval(interval)
    }
  }, [])

  const features = [
    {
      title: "Real-time Multiplayer",
      description: "Play against opponents worldwide with zero lag",
      icon: "⚡",
    },
    {
      title: "Tournament Mode",
      description: "Compete in ranked tournaments and climb the leaderboard",
      icon: "🏆",
    },
    {
      title: "Custom Tables",
      description: "Design your own ping pong tables and environments",
      icon: "🎨",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-bounce"></div>

        {/* Animated Ping Pong Ball */}
        <div
          className="absolute w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg transition-all duration-2000 ease-in-out"
          style={{
            left: `${ballPosition.x}%`,
            top: `${ballPosition.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏓</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              PingPong Pro
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Play
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Tournaments
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Leaderboard
            </a>
            <button className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105">
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center py-20 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                PING PONG
              </span>
              <br />
              <span className="text-white">REVOLUTION</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the most realistic ping pong simulation ever created. Challenge players worldwide in real-time
              multiplayer matches.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="bg-gradient-to-r from-orange-500 to-pink-500 px-12 py-4 rounded-full text-xl font-bold hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl">
                Play Now
              </button>
              <button className="border-2 border-gray-400 px-12 py-4 rounded-full text-xl font-bold hover:border-white hover:bg-white hover:text-gray-900 transition-all">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-t border-gray-700">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-2">
                1M+
              </div>
              <div className="text-gray-400">Matches Played</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-400">Online Tournaments</div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                Game Features
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-2xl transition-all duration-500 cursor-pointer ${
                    activeFeature === index
                      ? "bg-gradient-to-br from-orange-500/20 to-pink-500/20 border-2 border-orange-500/50 transform scale-105"
                      : "bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-20 border-t border-gray-700">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to{" "}
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                Dominate
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of players in the ultimate ping pong experience. Your journey to becoming a champion starts
              now.
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-pink-500 px-16 py-5 rounded-full text-2xl font-bold hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl">
              Start Playing
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700 px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">🏓</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              PingPong Pro
            </span>
          </div>
          <p className="text-gray-400">© 2024 PingPong Pro. All rights reserved. | The future of ping pong is here.</p>
        </div>
      </footer>
    </div>
  )
}


if (aa) Miku.render(<HomePage />, aa);


requestIdleCallback(workLoop)