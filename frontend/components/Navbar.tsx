import { Menu, Search, ShoppingCart } from "lucide-react";

const Navbar = () => {
    return (
        <nav className="w-full h-25 bg-white border-b border-gray-200 shadow-lg px-6 flex items-center justify-between sticky top-0 z-50">

            {/* LEFT: Menu + Brand Name */}
            <div className="flex items-center gap-7">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Menu size={30} className="text-gray-800" />
                </button>
                <span className="text-5xl font-bold tracking-tight text-black">
                    Teckvora
                </span>
            </div>

            {/* CENTER: Search Bar */}
            <div className="flex-1 max-w-xl mx-10">
                <div className="flex items-center w-full h-15 bg-gray-100 rounded-full px-4 border border-gray-200 focus-within:border-gray-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-200 transition-all">
                    <Search size={25} className="text-gray-400 mr-2 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="bg-transparent border-none outline-none text-lg w-full text-gray-800 placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* RIGHT: Cart */}
            <div className="flex items-center gap-4">
                <div className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ShoppingCart size={30} className="text-gray-800" />
                    <div className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center p-2">
                        0
                    </div>
                </div>
            </div>

        </nav>
    );
};

export default Navbar;