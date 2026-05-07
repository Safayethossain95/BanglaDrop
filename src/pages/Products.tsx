import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  supplierPrice: number;
  suggestedRetailPrice: number;
  image: string;
  description: string;
  category: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Trending Dropshipping Products</h3>
          <p className="text-slate-500 text-sm mt-1">Find trending products, set your price, and start selling.</p>
        </div>
        <a href="#" className="hidden md:block text-teal-600 text-sm font-medium">View All Catalog →</a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden group">
              <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded z-10 shadow-sm uppercase">
                {product.category.split(" ")[0]}
              </span>
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 leading-tight">{product.name}</h4>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
              
              <div className="space-y-1.5 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Wholesale Cost:</span>
                  <span className="font-semibold text-slate-900">৳ {product.supplierPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Advised Selling:</span>
                  <span className="font-semibold text-slate-900">৳ {product.suggestedRetailPrice}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 mt-1 border-t border-dashed border-slate-200">
                  <span className="text-teal-700 font-bold">Est. Profit/Unit:</span>
                  <span className="text-teal-700 font-bold">৳ {product.suggestedRetailPrice - product.supplierPrice}</span>
                </div>
              </div>

              <Link 
                to={`/checkout/${product.id}`}
                className="w-full flex items-center justify-center gap-2 border border-teal-600 text-teal-600 font-medium py-2.5 rounded-lg hover:bg-teal-50 transition-colors"
                id={`sell-btn-${product.id}`}
              >
                <ShoppingCart className="w-4 h-4" />
                Place Order Action
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
