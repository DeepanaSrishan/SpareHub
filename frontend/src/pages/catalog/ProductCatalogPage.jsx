import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Filter,
    PackageSearch,
    RotateCcw,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import catalogService from "../../services/catalogService";
import ProductCard from "../../components/catalog/ProductCard";
import EngineAssemblyBackground from "../../components/catalog/EngineAssemblyBackground";
import { useAutoScrollReveal } from "../../hooks/useScrollReveal";
import "../../styles/catalog.css";

const initialFilters = {
    search: "",
    categoryId: "",
    brand: "",
    minimumPrice: "",
    maximumPrice: "",
    available: "",
    sort: "name-asc",
};

export default function ProductCatalogPage() {
    const pageRef = useRef(null);
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const initialBrand = searchParams.get("brand") || "";

    const [filters, setFilters] = useState({
        ...initialFilters,
        search: initialSearch,
        brand: initialBrand,
    });

    const [appliedFilters, setAppliedFilters] = useState({
        ...initialFilters,
        search: initialSearch,
        brand: initialBrand,
    });

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [page, setPage] = useState(0);

    useAutoScrollReveal([products]);

    useEffect(() => {
        const paramSearch = searchParams.get("search") || "";
        const paramBrand = searchParams.get("brand") || "";
        if (paramSearch !== appliedFilters.search || paramBrand !== appliedFilters.brand) {
            setFilters((prev) => ({
                ...prev,
                search: paramSearch,
                brand: paramBrand,
            }));
            setAppliedFilters((prev) => ({
                ...prev,
                search: paramSearch,
                brand: paramBrand,
            }));
            setPage(0);
        }
    }, [searchParams]);
    const [totalPages, setTotalPages] =
        useState(0);
    const [totalElements, setTotalElements] =
        useState(0);

    const [loading, setLoading] = useState(true);
    const [filterDataLoading, setFilterDataLoading] =
        useState(true);

    const [error, setError] = useState("");

    useEffect(() => {
        loadFilterData();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [appliedFilters, page]);

    const loadFilterData = async () => {
        try {
            setFilterDataLoading(true);

            const [categoryData, brandData] =
                await Promise.all([
                    catalogService.getCategories(),
                    catalogService.getBrands(),
                ]);

            setCategories(
                Array.isArray(categoryData)
                    ? categoryData
                    : []
            );

            setBrands(
                Array.isArray(brandData)
                    ? brandData
                    : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Product filters load කිරීම අසාර්ථකයි."
            );
        } finally {
            setFilterDataLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const [sortBy, direction] =
                appliedFilters.sort.split("-");

            const data =
                await catalogService.searchProducts({
                    search: appliedFilters.search,
                    categoryId:
                    appliedFilters.categoryId,
                    brand: appliedFilters.brand,
                    minimumPrice:
                    appliedFilters.minimumPrice,
                    maximumPrice:
                    appliedFilters.maximumPrice,
                    available:
                    appliedFilters.available,
                    page,
                    size: 12,
                    sortBy,
                    direction,
                });

            if (Array.isArray(data)) {
                setProducts(data);
                setTotalElements(data.length);
                setTotalPages(data.length > 0 ? 1 : 0);
            } else {
                setProducts(data?.content ?? []);
                setTotalElements(
                    data?.totalElements ?? 0
                );
                setTotalPages(data?.totalPages ?? 0);
            }
        } catch (err) {
            setProducts([]);
            setTotalElements(0);
            setTotalPages(0);

            setError(
                err.response?.data?.message ||
                "Products load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const minimumPrice =
            filters.minimumPrice === ""
                ? ""
                : Number(filters.minimumPrice);

        const maximumPrice =
            filters.maximumPrice === ""
                ? ""
                : Number(filters.maximumPrice);

        if (
            minimumPrice !== "" &&
            maximumPrice !== "" &&
            minimumPrice > maximumPrice
        ) {
            setError(
                "Minimum price එක maximum price එකට වඩා වැඩි වෙන්න බැහැ."
            );
            return;
        }

        setError("");
        setPage(0);
        setAppliedFilters(filters);
    };

    const handleReset = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setPage(0);
        setError("");
    };

    return (
        <div className="catalog-page-root" ref={pageRef}>
            {/* Full-Screen 3D Exploded Engine Assembly Canvas Background */}
            <EngineAssemblyBackground targetRef={pageRef} />

            <main className="catalog-page">
                <section className="catalog-hero">
                <div>
          <span className="catalog-eyebrow">
            SpareHub Product Catalog
          </span>

                    <h1>Find the right spare part</h1>

                    <p>
                        Search by name, category, part number,
                        brand or vehicle compatibility.
                    </p>
                </div>

                <PackageSearch size={78} />
            </section>

            <section className="catalog-filter-panel">
                <div className="catalog-filter-heading">
                    <div>
                        <SlidersHorizontal size={21} />
                        <h2>Search and Filters</h2>
                    </div>

                    <button
                        type="button"
                        className="catalog-reset-button"
                        onClick={handleReset}
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </div>

                <form
                    className="catalog-filter-form"
                    onSubmit={handleSubmit}
                >
                    <div className="catalog-search-field">
                        <Search size={19} />

                        <input
                            type="search"
                            name="search"
                            value={filters.search}
                            onChange={handleInputChange}
                            placeholder="Search name, part number, category..."
                        />
                    </div>

                    <select
                        name="categoryId"
                        value={filters.categoryId}
                        onChange={handleInputChange}
                        disabled={filterDataLoading}
                    >
                        <option value="">All Categories</option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="brand"
                        value={filters.brand}
                        onChange={handleInputChange}
                        disabled={filterDataLoading}
                    >
                        <option value="">All Brands</option>

                        {brands.map((brand) => (
                            <option key={brand} value={brand}>
                                {brand}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        name="minimumPrice"
                        value={filters.minimumPrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="Minimum price"
                    />

                    <input
                        type="number"
                        name="maximumPrice"
                        value={filters.maximumPrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="Maximum price"
                    />

                    <select
                        name="available"
                        value={filters.available}
                        onChange={handleInputChange}
                    >
                        <option value="">
                            All Availability
                        </option>
                        <option value="true">
                            Available Only
                        </option>
                        <option value="false">
                            Out of Stock
                        </option>
                    </select>

                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleInputChange}
                    >
                        <option value="name-asc">
                            Name: A–Z
                        </option>
                        <option value="name-desc">
                            Name: Z–A
                        </option>
                        <option value="sellingPrice-asc">
                            Price: Low to High
                        </option>
                        <option value="sellingPrice-desc">
                            Price: High to Low
                        </option>
                        <option value="createdAt-desc">
                            Newest Products
                        </option>
                    </select>

                    <button
                        type="submit"
                        className="catalog-search-button"
                    >
                        <Filter size={18} />
                        Apply Filters
                    </button>
                </form>
            </section>

            {error && (
                <div className="catalog-alert-error">
                    {error}
                </div>
            )}

            <section className="catalog-result-heading">
                <div>
                    <h2>Spare Parts</h2>
                    <p>
                        {totalElements} product(s) found
                    </p>
                </div>
            </section>

            {loading ? (
                <div className="catalog-loading-grid">
                    {Array.from({ length: 8 }).map(
                        (_, index) => (
                            <div
                                className="catalog-skeleton-card"
                                key={index}
                            >
                                <div className="catalog-skeleton-image" />
                                <div className="catalog-skeleton-line" />
                                <div className="catalog-skeleton-line short" />
                                <div className="catalog-skeleton-line" />
                            </div>
                        )
                    )}
                </div>
            ) : products.length === 0 ? (
                <section className="catalog-empty-state">
                    <PackageSearch size={58} />
                    <h2>No spare parts found</h2>
                    <p>
                        Try changing your search keyword or
                        filters.
                    </p>

                    <button
                        className="catalog-search-button"
                        onClick={handleReset}
                    >
                        Reset Filters
                    </button>
                </section>
            ) : (
                <section className="catalog-product-grid scroll-reveal is-revealed scroll-stagger">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </section>
            )}

            {totalPages > 1 && (
                <nav className="catalog-pagination">
                    <button
                        disabled={page === 0 || loading}
                        onClick={() =>
                            setPage((current) => current - 1)
                        }
                    >
                        Previous
                    </button>

                    <span>
            Page {page + 1} of {totalPages}
          </span>

                    <button
                        disabled={
                            page + 1 >= totalPages || loading
                        }
                        onClick={() =>
                            setPage((current) => current + 1)
                        }
                    >
                        Next
                    </button>
                </nav>
            )}
        </main>
    </div>
);
}