<template>
  <div class="products-search" id="products-page">
    <ais-instant-search :search-client="searchClient" :index-name="productsIndex" :routing="routing">
      <!-- Search Box -->
      <ais-search-box placeholder="Search for products..." />

      <!-- Search Stats -->
      <ais-stats />

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

      <!-- Search Results -->
      <ais-hits>
        <template v-slot:item="{ item }">
          <div class="hit">
            <div class="hit-image">
              <img :src="getProductImage(item)" :alt="item.product_name" style="width: 100px; height: 100px; object-fit: contain;" />
            </div>
            <div class="hit-content">
              <h3>
                <a :href="`/${country}/${language}/products/${item.slug}`">
                  <ais-highlight attribute="product_name" :hit="item" />
                </a>
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
        </template>
      </ais-hits>

      <!-- Pagination -->
      <ais-pagination />
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
      "http://localhost:7700",
      "df7b16d3dda117c0e2118b283b1b3fe21f331daaec06d9eb993dc7eb8ab162ef"
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
  .products-search {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .ais-SearchBox {
    margin-bottom: 20px;
  }

  .ais-SearchBox-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }

  .ais-Stats {
    margin-bottom: 20px;
    color: #666;
  }

  .hit {
    display: flex;
    gap: 15px;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 15px;
    background: white;
  }

  .hit-image img {
    border-radius: 4px;
    border: 1px solid #eee;
  }

  .hit-content {
    flex: 1;
  }

  .hit-content h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
  }

  .hit-content h3 a {
    color: #333;
    text-decoration: none;
  }

  .hit-content h3 a:hover {
    color: #0066cc;
  }

  .hit-description {
    color: #666;
    margin: 0 0 10px 0;
    line-height: 1.4;
  }

  .hit-details {
    display: flex;
    gap: 15px;
    margin-bottom: 5px;
  }

  .hit-sku,
  .hit-series {
    font-size: 14px;
    color: #888;
  }

  .hit-variations {
    font-size: 14px;
    color: #0066cc;
  }

  .ais-Pagination {
    margin-top: 30px;
    text-align: center;
  }

  .ais-Pagination-list {
    display: flex;
    justify-content: center;
    gap: 5px;
    list-style: none;
    padding: 0;
  }

  .ais-Pagination-item {
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .ais-Pagination-link {
    display: block;
    padding: 8px 12px;
    text-decoration: none;
    color: #333;
  }

  .ais-Pagination-item--selected .ais-Pagination-link {
    background: #0066cc;
    color: white;
    border-color: #0066cc;
  }

  .ais-Highlight-highlighted {
    background: yellow;
    font-style: normal;
  }

  .counter {
    color: lightgrey !important;
    margin-left: 15px;
  }
}
</style>
