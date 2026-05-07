import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Product = {
  id: string;
  name: string;
  supplierPrice: number;
  suggestedRetailPrice: number;
  image: string;
  description: string;
  category: string;
};

export type ProductInput = Omit<Product, "id">;

const defaultProducts: Product[] = [
  {
    id: "p1",
    name: "Wireless Earbuds Pro",
    supplierPrice: 800,
    suggestedRetailPrice: 1500,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600",
    description: "High-quality wireless earbuds with noise cancellation.",
    category: "Electronics",
  },
  {
    id: "p2",
    name: "Orthopedic Memory Foam Pillow",
    supplierPrice: 450,
    suggestedRetailPrice: 1200,
    image: "https://images.unsplash.com/photo-1583088580009-88bfc5d677d2?auto=format&fit=crop&q=80&w=600",
    description: "Ergonomic pillow for better sleep and neck support.",
    category: "Home & Lifestyle",
  },
  {
    id: "p3",
    name: "Smart Fitness Watch",
    supplierPrice: 1200,
    suggestedRetailPrice: 2500,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=600",
    description: "Tracks heart rate, steps, and sleep patterns.",
    category: "Electronics",
  },
  {
    id: "p4",
    name: "Anti-Theft Backpack",
    supplierPrice: 600,
    suggestedRetailPrice: 1400,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    description: "Water-resistant backpack with hidden zippers and USB charging port.",
    category: "Fashion & Accessories",
  },
];

type ProductsStore = {
  hasHydrated: boolean;
  products: Product[];
  setHasHydrated: (value: boolean) => void;
  createProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, input: ProductInput) => Product | null;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
};

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      products: defaultProducts,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      createProduct: (input) => {
        const product: Product = {
          id: `p${Math.random().toString(36).slice(2, 8)}`,
          ...input,
        };

        set((state) => ({ products: [product, ...state.products] }));
        return product;
      },
      updateProduct: (id, input) => {
        let updatedProduct: Product | null = null;

        set((state) => ({
          products: state.products.map((product) => {
            if (product.id !== id) return product;
            updatedProduct = { id, ...input };
            return updatedProduct;
          }),
        }));

        return updatedProduct;
      },
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        })),
      getProductById: (id) => get().products.find((product) => product.id === id),
    }),
    {
      name: "bangladrop-products",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
