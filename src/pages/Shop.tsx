import { useEffect } from "react";
import { Link } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { ShoppingBag, Search, ArrowRight, Truck, ShieldCheck, Headset, CreditCard, CheckCircle } from "lucide-react";
import logoImage from "../assets/images/logo.png";
import { useProductsStore } from "../store/productsStore";

export default function Shop() {
  const products = useProductsStore((state) => state.products);
  const hasHydrated = useProductsStore((state) => state.hasHydrated);
  const loadProducts = useProductsStore((state) => state.loadProducts);

  useEffect(() => {
    if (!hasHydrated) {
      loadProducts().catch(() => undefined);
    }
  }, [hasHydrated, loadProducts]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* 1. Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="BanglaDrop logo" className="w-10 h-10 rounded-xl object-cover" />
              <span className="text-2xl font-bold tracking-tight text-slate-900">BanglaDrop</span>
            </div>
            <nav className="hidden md:flex items-center gap-10">
              <a href="#" className="font-medium text-slate-500 hover:text-slate-900 transition-colors">Home</a>
              <a href="#shop" className="font-medium text-slate-900 border-b-2 border-slate-900 py-1">Shop</a>
              <a href="#" className="font-medium text-slate-500 hover:text-slate-900 transition-colors">Categories</a>
              <a href="#" className="font-medium text-slate-500 hover:text-slate-900 transition-colors">About</a>
            </nav>
            <div className="flex items-center gap-5 text-slate-600">
              <button className="hover:text-slate-900 transition-colors"><Search className="w-5 h-5" /></button>
              <Link
                to="/login"
                aria-label="Login"
                className="hover:text-slate-900 transition-colors"
              >
                <UserCircleIcon className="w-6 h-6" />
              </Link>
              <button className="hover:text-slate-900 transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">0</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-40">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                  Elevate Your <br />
                  <span className="text-teal-600">Everyday Style.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
                  Discover our exclusive collection of premium lifestyle products designed for modern living. Now with seamless Cash on Delivery.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <a href="#shop" className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2">
                    Shop Collection <ArrowRight className="w-5 h-5" />
                  </a>
                  <a href="#" className="px-8 py-4 rounded-full font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                    Learn More
                  </a>
                </div>
              </div>
              <div className="relative lg:h-[600px] hidden md:block">
                {/* Decorative blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
                <img 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop" 
                  alt="Hero Summer Collection" 
                  className="relative z-10 w-full h-full object-cover rounded-[2.5rem] shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Value Propositions */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Fast Delivery</h3>
                <p className="text-slate-500 leading-relaxed">Swift nationwide delivery right to your doorstep within 24-48 hours.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Cash on Delivery</h3>
                <p className="text-slate-500 leading-relaxed">Pay securely with cash only when your order arrives at your door.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Premium Quality</h3>
                <p className="text-slate-500 leading-relaxed">Every item is strictly verified for authentic quality before shipping.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                  <Headset className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Support</h3>
                <p className="text-slate-500 leading-relaxed">Our dedicated team is always here to assist you anytime you need.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Products Section */}
        <section id="shop" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Latest Arrivals</h2>
              <p className="text-slate-500 text-lg">Curated essentials for the modern lifestyle.</p>
            </div>

            {!hasHydrated ? (
              <div className="flex h-64 items-center justify-center">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12">
                {products.map((product) => (
                  <Link key={product.id} to={`/shop/product/${product.id}`} className="group flex flex-col">
                    <div className="w-full relative overflow-hidden rounded-[2rem] bg-slate-200 aspect-[4/5] shadow-sm mb-6">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 w-[90%]">
                        <div className="bg-white/90 backdrop-blur shadow-lg text-slate-900 py-3 rounded-full text-center font-bold text-sm w-full">
                          Quick View
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 px-2 text-center">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{product.category}</h3>
                      <p className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">{product.name}</p>
                      <p className="text-xl font-semibold text-slate-600 mt-auto">৳ {product.suggestedRetailPrice}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 5. Promotional Section */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          {/* subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative aspect-[4/3] lg:aspect-square">
                <img 
                  src="https://images.unsplash.com/photo-1555529733-0e67056058e1?q=80&w=2000&auto=format&fit=crop" 
                  alt="Craftsmanship" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Designed for <br/><span className="text-teal-400">Durability.</span></h2>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                  Every product in our collection is carefully selected based on strict criteria for sustainability, craftsmanship, and longevity. We believe in buying better, and buying less.
                </p>
                <ul className="space-y-4 mb-10">
                  {['Ethically sourced materials', 'Lifetime quality guarantee', 'Carbon neutral shipping'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle className="w-6 h-6 text-teal-400 shrink-0" />
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="#shop" className="inline-block bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-full font-semibold text-lg transition-colors">
                  Explore The Collection
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Newsletter */}
        <section className="py-24 bg-teal-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Join Our Inner Circle</h2>
            <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals delivered directly to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-teal-200 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                required
              />
              <button 
                type="submit" 
                className="bg-white text-teal-700 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoImage} alt="BanglaDrop logo" className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-xl font-bold tracking-tight text-white">BanglaDrop</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
                Elevating your lifestyle through thoughtfully curated essentials. Made for the modern world.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Shop</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">All Products</a></li>
                <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; 2026 BanglaDrop. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

