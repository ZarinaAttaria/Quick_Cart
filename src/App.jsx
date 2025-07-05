import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import Navbar from "./Navbar.jsx";
import ProductCard from "./ProductCard.jsx";
import ProductDetail from "./ProductDetail.jsx";
import Pagination from "./Pagination.jsx";
import Sort from "./Sort.jsx";
import Footer from "./Footer.jsx";
import Cart from "./Cart.jsx";
import { toast, Toaster } from "react-hot-toast";

function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [isCategoryFilter, setIsCategoryFilter] = useState(false);
  const [productsPerPage, setProductsPerPage] = useState(4);
  const [cart, setCart] = useState([]);
  const [isCartIcon, setIsCartIcon] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const existingCartItem = localStorage.getItem("cart");
    if (existingCartItem) setCart(JSON.parse(existingCartItem));
  }, []);

  const getData = async (page, sort, sortOrder) => {
    const skip = (page - 1) * productsPerPage;
    const sortType = sort ? `&sortBy=${sort}&order=${sortOrder}` : "";

    try {
      const response = await axios.get(
        `https://dummyjson.com/products?limit=${productsPerPage}&skip=${skip}${sortType}`
      );
      const data = response.data;
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const searchProduct = async (query) => {
    const sortType = sort ? `&sortBy=${sort}&order=${sortOrder}` : "";

    try {
      const response = await axios.get(
        `https://dummyjson.com/products/search?q=${query}&limit=${productsPerPage}&skip=${
          (page - 1) * productsPerPage
        }${sortType}`
      );
      const data = response.data;
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const categoryFilter = async (category) => {
    const skip = (page - 1) * productsPerPage;
    const sortType = sort ? `&sortBy=${sort}&order=${sortOrder}` : "";

    try {
      const response = await axios.get(
        `https://dummyjson.com/products/category/${category}?limit=${productsPerPage}&skip=${skip}${sortType}`
      );
      const data = response.data;
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (error) {
      console.error("Error fetching category results:", error);
    }
  };

  useEffect(() => {
    if (isSearch && searchQuery.length >= 3) {
      searchProduct(searchQuery);
    } else if (isCategoryFilter) {
      categoryFilter(filterCategory);
    } else {
      getData(page, sort, sortOrder);
    }
  }, [
    page,
    sort,
    sortOrder,
    productsPerPage,
    isSearch,
    isCategoryFilter,
    searchQuery,
  ]);

  const handleCategoryFilter = (category) => {
    setIsCategoryFilter(true);
    setIsSearch(false);
    setFilterCategory(category);
    setPage(1);
  };

  const debouncedSearch = _.debounce(() => searchProduct(searchQuery), 500);

  const handleSearch = (query) => {
    setIsSearch(true);
    setIsCategoryFilter(false);
    setSearchQuery(query);
    setPage(1);
    debouncedSearch();
  };

  const handleMoreDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product) => {
    const productIndex = cart?.findIndex((p) => p.id === product.id);
    if (productIndex > -1) {
      cart[productIndex].quantity += 1;
    } else {
      product.quantity = 1;
      cart.push(product);
    }

    const updatedCart = [...cart];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Item added to cart!");
  };

  const handleCart = () => {
    setIsCartIcon(true);
  };

  return (
    <>
      <div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
      <Navbar
        setProducts={setProducts}
        productsPerPage={productsPerPage}
        page={page}
        sort={sort}
        handleSearch={handleSearch}
        handleCategoryFilter={handleCategoryFilter}
        handleCart={handleCart}
        cart={cart}
      />
      <div className="d-flex align-items-center justify-content-end">
        <Sort setSort={setSort} setSortOrder={setSortOrder} />

        <Pagination
          totalProducts={totalProducts}
          productsPerPage={productsPerPage}
          setProductsPerPage={setProductsPerPage}
          page={page}
          setPage={setPage}
        />
      </div>

      <ProductCard
        products={products}
        handleMoreDetails={handleMoreDetails}
        handleAddToCart={handleAddToCart}
      />

      <ProductDetail
        selectedProduct={selectedProduct}
        handleAddToCart={handleAddToCart}
      />

      <Cart cart={cart} isCartIcon={isCartIcon} setCart={setCart} />

      <Footer />
    </>
  );
}

export default App;
