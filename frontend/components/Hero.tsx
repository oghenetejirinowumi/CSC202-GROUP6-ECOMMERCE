const Hero =() => {
  return (
    <section className="relative w-full h-[500px] flex items-center">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591105866700-cb5d708ccd93?q=80&w=907&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-lg">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
             Welcome to <br/>Teckvora </h1>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;