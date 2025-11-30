const API_BASE_URL = 'https://charity-api.daira.website/api';
const API_PUBLIC_BASE_URL = 'https://charity-api.daira.website/api/public';

/**
 * Fetch home page data
 * @returns {Promise<Object>} Home page data including slider campaigns, featured campaigns, categories, and subcategories
 */
export const fetchHomeData = async () => {
  try {
    const response = await fetch(`${API_PUBLIC_BASE_URL}/home`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // معالجة خاصة لخطأ 429
      if (response.status === 429) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = 429;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching home data:', error);
    throw error;
  }
};

/**
 * Fetch campaigns with optional category filter
 * @param {number|string|null} categoryId - Category ID for filtering (null for all campaigns)
 * @returns {Promise<Object>} Campaigns data with pagination
 */
export const fetchCampaigns = async (categoryId = null) => {
  try {
    const url = categoryId 
      ? `${API_PUBLIC_BASE_URL}/campaigns?category_id=${categoryId}`
      : `${API_PUBLIC_BASE_URL}/campaigns`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // معالجة خاصة لخطأ 429
      if (response.status === 429) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = 429;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

/**
 * Fetch campaign details by ID
 * @param {number|string} campaignId - Campaign ID
 * @param {number} contributionsPage - Page number for contributions (default: 1)
 * @param {number} contributionsPerPage - Number of contributions per page (default: 10)
 * @returns {Promise<Object>} Campaign details
 */
export const fetchCampaignDetails = async (campaignId, contributionsPage = 1, contributionsPerPage = 10) => {
  try {
    const url = `${API_BASE_URL}/campaigns/${campaignId}?contributions_page=${contributionsPage}&contributions_per_page=${contributionsPerPage}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // معالجة خاصة لخطأ 429
      if (response.status === 429) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = 429;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    throw error;
  }
};

