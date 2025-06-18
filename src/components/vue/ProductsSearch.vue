<template>
  <div class="products-search" id="products-page">
    <ais-instant-search :search-client="searchClient" :index-name="productsIndex" :routing="routing">
      <!-- Search Header -->
      <div class="search-header">
        <ais-search-box placeholder="Search for products..." />
        <ais-stats />
      </div>

      <!-- Main Content -->
      <div class="search-content">
        <!-- Filters Sidebar -->
        <div class="filters-sidebar">
          <h3 class="filters-title">Filters</h3>

          <div class="filter-section">
            <h4 class="filter-title">Brand</h4>
            <ais-refinement-list
              :limit="1000"
              attribute="brand"
              :sort-by="['name:asc']"
              :class-names="{
                      'ais-RefinementList-label': 'filter-checkbox-container',
                      'ais-RefinementList-labelText': 'filter-label',
                      'ais-RefinementList-checkbox': 'filter-checkbox',
                      'ais-RefinementList-count': 'counter',
                  }"
            />
          </div>

          <div class="filter-section">
            <h4 class="filter-title">Liner</h4>
            <ais-refinement-list
              :limit="1000"
              attribute="liner"
              :sort-by="['name:asc']"
              :class-names="{
                      'ais-RefinementList-label': 'filter-checkbox-container',
                      'ais-RefinementList-labelText': 'filter-label',
                      'ais-RefinementList-checkbox': 'filter-checkbox',
                      'ais-RefinementList-count': 'counter',
                  }"
            />
          </div>
        </div>

        <!-- Results Area -->
        <div class="results-area">
          <!-- Search Results -->
          <ais-hits>
            <template v-slot:item="{ item }">
              <a :href="`/${country}/${language}/products/${item.slug}`">
                <div class="hit">
                  <div class="hit-image">
                    <img :src="getProductImage(item)" :alt="item.product_name" />
                  </div>
                  <div class="hit-content">
                    <h3>
                      <ais-highlight attribute="product_name" :hit="item" />
                    </h3>
                    <p class="hit-description">
                      <ais-highlight attribute="long_description" :hit="item" />
                    </p>
                    <div class="hit-details">
                      <span class="hit-sku">SKU: {{ item.sku_id }}</span>
                      <span v-if="item.series" class="hit-series">Series: {{ item.series }}</span>
                    </div>
                    <div v-if="item.variations && item.variations.length > 0" class="hit-variations">
                      <span>{{ item.variations.length }} variation{{ item.variations.length > 1 ? 's' : '' }} available</span>
                    </div>
                  </div>
                </div>
              </a>
            </template>
          </ais-hits>

          <!-- Pagination -->
          <ais-pagination />
        </div>
      </div>
    </ais-instant-search>
  </div>
</template>

<script>
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { simple } from "instantsearch.js/es/lib/stateMappings";
import { history } from "instantsearch.js/es/lib/routers";

import {
  AisInstantSearch,
  AisSearchBox,
  AisStats,
  AisHits,
  AisHighlight,
  AisPagination,
  AisRefinementList,
} from "vue-instantsearch/vue3/es";

export default {
  name: "ProductsSearch",
  components: {
    AisInstantSearch,
    AisSearchBox,
    AisStats,
    AisHits,
    AisHighlight,
    AisPagination,
    AisRefinementList,
  },
  props: {
    country: {
      type: String,
    },
    language: {
      type: String,
    },
    productsIndex: {
      type: String,
    },
  },
  setup() {
    const searchClient = instantMeiliSearch(
      // "http://localhost:7700",
      // "df7b16d3dda117c0e2118b283b1b3fe21f331daaec06d9eb993dc7eb8ab162ef"
      "https://ms-prd-prd.globusgroup.com",
      "de0eef89f10d34658c1938d82e2203b9f1940d91c043c2c1e5a90cfce9729ebf"
    ).searchClient;

    const routing = {
      router: history({
        cleanUrlOnDispose: false,
      }),
      stateMapping: simple(),
    };

    // Helper function to get product image
    function getProductImage(item) {
      const firstVariation = item.variations?.[0];
      const firstImage =
        firstVariation?.product_images?.[0]?.filename ??
        "no-img-transparent.png";
      return `https://res.cloudinary.com/globusgroup/image/upload/w_400,h_400,f_auto,c_pad/PIM/${firstImage}`;
    }

    return {
      searchClient,
      routing,
      getProductImage,
    };
  },
  methods: {
    t(key, ...args) {
      const langTranslations = window.translationsJSON;

      const str = langTranslations?.[key] || key;
      return str.replace(/{(\d+)}/g, (match, number) =>
        typeof args[number] !== "undefined" ? args[number] : match
      );
    },
    transformItems(items) {
      return items.map((item) => ({
        ...item,
        label: this.t(item.label),
      }));
    },
  },
};
</script>

<style lang="scss">
#products-page {
  padding: 40px;
  .products-search {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    background: #f8fafc;
    min-height: 100vh;
  }

  // Search Header
  .search-header {
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
  }

  .ais-SearchBox {
    margin-bottom: 16px;
  }

  .ais-SearchBox-input {
    width: 100%;
    padding: 16px 20px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 16px;
    background: #ffffff;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  .ais-Stats {
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
  }

  // Main Content Layout
  .search-content {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
    align-items: start;
  }

  // Filters Sidebar
  .filters-sidebar {
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    position: sticky;
    top: 24px;
  }

  .filters-title {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 24px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid #e2e8f0;
  }

  .filter-section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .filter-title {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px 0;
  }

  // Filter Checkboxes
  .filter-checkbox-container {
    display: flex !important;
    align-items: center;
    padding: 8px 0;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;
    margin: 0 -8px;
    padding: 8px;

    &:hover {
      background: #f1f5f9;
    }
  }

  .filter-checkbox {
    width: 16px !important;
    height: 16px !important;
    margin-right: 12px !important;
    accent-color: #3b82f6;
  }

  .filter-label {
    flex: 1;
    font-size: 14px;
    color: #475569;
    font-weight: 500;
  }

  .counter {
    color: #94a3b8 !important;
    font-size: 12px;
    font-weight: 600;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 12px;
    margin-left: 8px !important;
  }

  // Results Area
  .results-area {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  // Hits Container - Grid Layout
  .ais-Hits {
    padding: 24px;
  }

  .ais-Hits-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .ais-Hits-item {
    height: 100%;
  }

  // Product Cards - Link wrapper
  .ais-Hits-item a {
    display: block;
    text-decoration: none;
    color: inherit;
    height: 100%;
  }

  .hit {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    background: white;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .ais-Hits-item a:hover .hit {
    background: #fafbfc;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #e2e8f0;
  }

  .ais-Hits-item a:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 12px;
  }

  .hit-image {
    width: 90%;
    margin-bottom: 16px;

    img {
      width: 100%;
      height: 180px;
      object-fit: contain;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      padding: 12px;
      transition: all 0.2s ease;
    }
  }

  .ais-Hits-item a:hover .hit-image img {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .hit-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .hit-content h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    color: #1e293b;
    transition: color 0.2s ease;
  }

  .ais-Hits-item a:hover .hit-content h3 {
    color: #3b82f6;
  }

  .hit-description {
    color: #64748b;
    margin: 0 0 12px 0;
    line-height: 1.4;
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .hit-details {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }

  .hit-sku,
  .hit-series {
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    background: #f3f4f6;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .hit-variations {
    font-size: 12px;
    color: #3b82f6;
    font-weight: 600;
    background: #eff6ff;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid #dbeafe;
    margin-top: auto;
  }

  // Pagination
  .ais-Pagination {
    padding: 32px;
    text-align: center;
    background: #fafbfc;
    border-top: 1px solid #f1f5f9;
  }

  .ais-Pagination-list {
    display: flex;
    justify-content: center;
    gap: 8px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .ais-Pagination-item {
    border-radius: 8px;
    overflow: hidden;
  }

  .ais-Pagination-link {
    display: block;
    padding: 12px 16px;
    text-decoration: none;
    color: #64748b;
    background: white;
    border: 1px solid #e2e8f0;
    font-weight: 500;
    transition: all 0.2s ease;
    min-width: 44px;

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #374151;
    }
  }

  .ais-Pagination-item--selected .ais-Pagination-link {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;

    &:hover {
      background: #2563eb;
    }
  }

  .ais-Pagination-item--disabled .ais-Pagination-link {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background: white;
      border-color: #e2e8f0;
      color: #64748b;
    }
  }

  // Highlight styling
  .ais-Highlight-highlighted {
    background: #fef3c7;
    color: #92400e;
    font-style: normal;
    font-weight: 600;
    padding: 2px 4px;
    border-radius: 4px;
  }

  // Responsive Design
  @media (max-width: 1200px) {
    .ais-Hits-list {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  @media (max-width: 1024px) {
    .search-content {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .filters-sidebar {
      position: static;
      order: 2;
    }

    .results-area {
      order: 1;
    }
  }

  @media (max-width: 768px) {
    .products-search {
      padding: 16px;
    }

    .search-header {
      padding: 20px;
    }

    .filters-sidebar {
      padding: 16px;
    }

    .ais-Hits {
      padding: 16px;
    }

    .ais-Hits-list {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .hit {
      padding: 16px;
    }

    .hit-image img {
      height: 160px;
    }

    .hit-details {
      justify-content: flex-start;
    }
  }
}
.ais-SearchBox-submit {
  display: none;
}
.ais-SearchBox-reset {
  display: none;
}
</style>
