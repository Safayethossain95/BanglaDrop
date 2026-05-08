import { create } from "zustand";
import { apiFetch } from "../lib/api";

export type Product = {
  id: string;
  name: string;
  supplierPrice: number;
  suggestedRetailPrice: number;
  image: string;
  description: string;
  category: string;
  isActive?: boolean;
};

export type ProductInput = Omit<Product, "id">;

type BackendProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  supplierPrice: number;
  suggestedRetailPrice: number;
  isActive?: boolean;
};

type ProductsStore = {
  hasHydrated: boolean;
  isLoading: boolean;
  products: Product[];
  loadProducts: () => Promise<void>;
  createProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: string, input: ProductInput) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
};

function mapBackendProduct(product: BackendProduct): Product {
  return {
    id: product.id,
    name: product.name,
    supplierPrice: Number(product.supplierPrice),
    suggestedRetailPrice: Number(product.suggestedRetailPrice),
    image: product.imageUrl,
    description: product.description,
    category: product.category,
    isActive: product.isActive ?? true,
  };
}

export const useProductsStore = create<ProductsStore>()((set, get) => ({
  hasHydrated: false,
  isLoading: false,
  products: [],
  loadProducts: async () => {
    if (get().isLoading) return;

    set({ isLoading: true });

    try {
      const response = await apiFetch<{ products: BackendProduct[] }>("/api/products", {
        requireAuth: false,
      });

      set({
        products: response.products.map(mapBackendProduct),
        hasHydrated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        hasHydrated: true,
        isLoading: false,
      });
      throw error;
    }
  },
  createProduct: async (input) => {
    await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        supplierPrice: input.supplierPrice,
        suggestedRetailPrice: input.suggestedRetailPrice,
        imageUrl: input.image,
        description: input.description,
        category: input.category,
        isActive: input.isActive ?? true,
      }),
    });

    await get().loadProducts();
    return get().products[0];
  },
  updateProduct: async (id, input) => {
    await apiFetch(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: input.name,
        supplierPrice: input.supplierPrice,
        suggestedRetailPrice: input.suggestedRetailPrice,
        imageUrl: input.image,
        description: input.description,
        category: input.category,
        isActive: input.isActive ?? true,
      }),
    });

    await get().loadProducts();
    return get().products.find((product) => product.id === id) ?? null;
  },
  deleteProduct: async (id) => {
    await apiFetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    }));
  },
  getProductById: (id) => get().products.find((product) => product.id === id),
}));
