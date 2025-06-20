<template>
  <div class="products-search" id="products-page">
    <ais-instant-search :search-client="searchClient" :index-name="productsIndex" :routing="routing">
      <ais-configure :hits-per-page.camel="12" :attributes-to-retrieve.camel="attributesToRetrieve" />

      <!-- Main Content -->
      <div class="search-content" :class="{ 'is-loading': isLoading }">
        <!-- Filters Sidebar -->
        <div class="filters-sidebar">
          <h3 class="filters-title">{{ t('Filters') }}</h3>

          <div class="filter-section">
            <h4 class="filter-title">{{ t('Brand') }}</h4>
            <div v-if="isLoading" class="filter-skeleton">
              <div class="skeleton-item" v-for="i in 5" :key="`brand-${i}`"></div>
            </div>
            <ais-refinement-list
              v-else
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
            <h4 class="filter-title">{{ t('Liner') }}</h4>
            <div v-if="isLoading" class="filter-skeleton">
              <div class="skeleton-item" v-for="i in 3" :key="`liner-${i}`"></div>
            </div>
            <ais-refinement-list
              v-else
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
          <!-- Search Box - positioned above products -->
          <div class="search-box-container">
            <!-- Search Box Skeleton -->
            <div v-if="isLoading" class="search-box-skeleton">
              <div class="skeleton-search-input"></div>
            </div>
            <!-- Actual Search Box -->
            <ais-search-box v-show="!isLoading" :placeholder="t('Search by SKU, Name, or Description')" />
          </div>

          <!-- Search Results -->
          <div class="hits-container">
            <!-- Loading Skeleton -->
            <div v-if="isLoading" class="hits-skeleton">
              <div class="skeleton-hit" v-for="i in 12" :key="`skeleton-${i}`">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                  <div class="skeleton-title"></div>
                  <div class="skeleton-description"></div>
                  <div class="skeleton-details">
                    <div class="skeleton-tag"></div>
                    <div class="skeleton-tag"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actual Results -->
            <ais-hits v-show="!isLoading">
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
                        <ais-highlight attribute="tagline" :hit="item" />
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
          </div>

          <!-- Pagination -->
          <ais-pagination v-show="!isLoading" />
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
  AisConfigure,
  AisHitsPerPage,
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
    AisHitsPerPage,
    AisConfigure,
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
  data() {
    return {
      attributesToRetrieve: [
        "product_name",
        "slug",
        "brand",
        "tagline",
        "liner",
        "sku_id",
        "series",
        "variations.product_images",
      ],
      isLoading: true,
      hasRendered: false,
    };
  },
  mounted() {
    // Set a minimum loading time to prevent flash
    const minLoadingTime = setTimeout(() => {
      if (!this.hasRendered) {
        this.isLoading = false;
      }
    }, 2000);

    // Listen for the first search render to ensure data is ready
    this.$nextTick(() => {
      // Wait for InstantSearch to be available
      setTimeout(() => {
        this.hasRendered = true;
        this.isLoading = false;
        clearTimeout(minLoadingTime);
      }, 600);
    });
  },
  setup() {
    const searchClient = instantMeiliSearch(
      import.meta.env.PUBLIC_MEILISEARCH_URL,
      import.meta.env.PUBLIC_MEILISEARCH_API_KEY
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

  // Search Box - positioned above products
  .search-box-container {
    padding: 24px;
    border-bottom: 1px solid #f1f5f9;
    position: relative;

    .ais-SearchBox {
      margin: 0;
      transition: opacity 0.3s ease;
    }

    .ais-SearchBox-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      background: #ffffff;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }

      &::placeholder {
        color: #94a3b8;
      }
    }
  }

  // Search Box Skeleton
  .search-box-skeleton {
    .skeleton-search-input {
      width: 100%;
      height: 42px; // Matches the actual input height (padding + content)
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
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

    .search-box-container {
      padding: 16px;
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

  // Loading States & Skeleton UI
  .search-content {
    transition: opacity 0.3s ease;
  }

  .search-content.is-loading {
    opacity: 0.9;
  }

  // Filter Skeleton
  .filter-skeleton {
    .skeleton-item {
      height: 32px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  // Hits Container
  .hits-container {
    position: relative;
    min-height: 600px;
  }

  // Hits Skeleton
  .hits-skeleton {
    padding: 24px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .skeleton-hit {
    display: flex;
    flex-direction: column;
    padding: 20px;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    background: white;
    height: 380px;
  }

  .skeleton-image {
    width: 90%;
    height: 180px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-title {
    height: 24px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
    width: 85%;
  }

  .skeleton-description {
    height: 16px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
    width: 95%;
  }

  .skeleton-details {
    display: flex;
    gap: 8px;
    margin-top: auto;
  }

  .skeleton-tag {
    height: 20px;
    width: 60px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
  }

  // Shimmer Animation
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  // Smooth transitions for content appearance
  .ais-Hits {
    transition: opacity 0.4s ease, transform 0.4s ease;
  }

  .ais-Hits[v-show="true"] {
    opacity: 1;
    transform: translateY(0);
  }

  .ais-Hits[v-show="false"] {
    opacity: 0;
    transform: translateY(10px);
  }

  // Responsive skeleton adjustments
  @media (max-width: 1200px) {
    .hits-skeleton {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  @media (max-width: 1024px) {
    .hits-skeleton {
      padding: 16px;
    }
  }

  @media (max-width: 768px) {
    .hits-skeleton {
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 16px;
    }

    .skeleton-hit {
      padding: 16px;
      height: 340px;
    }

    .skeleton-image {
      height: 160px;
    }
  }
}
.ais-SearchBox-submit {
  display: none;
}
.ais-SearchBox-reset {
  display: none;
}
.ais-RefinementList-list {
  // hide bullet ponist
  list-style-type: none;
}
</style>
