const Hero =() => {
  return (
    <section className="relative w-full h-[500px] flex items-center">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-lg">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Website Catchphrase
          </h1>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;