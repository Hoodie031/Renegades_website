/**
 * Main JavaScript file for the Zurich Renegades Website
 *
 * This script handles:
 * 1. Asynchronously loading HTML components (header, footer).
 * 2. Fetching data from the WordPress CMS.
 * 3. Initializing dynamic components like sliders and news grids.
 */

// --- 1. CONFIGURATION ---
// Centralize API endpoints and IDs.
const WP_API_BASE = 'http://renegades-cms.local/wp-json/wp/v2';
const CATEGORY_IDS = {
    featured: 2,
    regular: 4,
};
const API_ENDPOINTS = {
    featuredPosts: `${WP_API_BASE}/posts?_embed=true&per_page=3&categories=${CATEGORY_IDS.featured}`,
    regularNews: `${WP_API_BASE}/posts?_embed=true&per_page=6&categories=${CATEGORY_IDS.regular}&categories_exclude=${CATEGORY_IDS.featured}`,
};


// --- 2. MAIN APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Load reusable HTML components first
    includeHTML('components/header.html', 'header-placeholder');
    includeHTML('components/footer.html', 'footer-placeholder');
    
    // Initialize dynamic sections of the page
    initJumbotronSlider();
    initNewsBoard();
});


// --- 3. DYNAMIC CONTENT MODULES ---

/**
 * Initializes the Jumbotron Swiper slider with featured posts.
 */
async function initJumbotronSlider() {
    const jumbotronContainer = document.getElementById('jumbotron-container');
    if (!jumbotronContainer) return;

    try {
        const response = await fetch(API_ENDPOINTS.featuredPosts);
        const posts = await response.json();

        if (posts && posts.length > 0) {
            jumbotronContainer.innerHTML = ''; // Clear loading message

            posts.forEach(post => {
                const title = post.title.rendered;
                const postLink = post.link;
                const formattedDate = new Date(post.date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
                let imageUrl = 'assets/images/renegades_logo_full.png'; // Fallback
                
                if (post._embedded && post._embedded['wp:featuredmedia']) {
                    imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
                }

                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.style.backgroundImage = `url(${imageUrl})`;
                slide.innerHTML = `
                    <div class="slide-content">
                        <p class="slide-date">${formattedDate}</p>
                        <h3 class="slide-title">${title}</h3>
                        <a href="${postLink}" class="slide-read-more">WEITERLESEN</a>
                    </div>
                `;
                jumbotronContainer.appendChild(slide);
            });

            // Initialize Swiper only after slides are added
            new Swiper('#jumbotron-slider', {
                loop: true,
                autoplay: { delay: 6000, disableOnInteraction: false },
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                on: {
                    init: function () { setTimeout(() => { this.slides[this.activeIndex].classList.add('slide-is-active'); }, 1000); },
                    slideChange: function () {
                        this.slides.forEach(slide => slide.classList.remove('slide-is-active'));
                        setTimeout(() => { this.slides[this.activeIndex].classList.add('slide-is-active'); }, 1000);
                    }
                }
            });
        } else {
            jumbotronContainer.innerHTML = '<div class="swiper-slide"><p>Keine Top-News gefunden.</p></div>';
        }
    } catch (error) {
        console.error("Error fetching featured posts:", error);
        jumbotronContainer.innerHTML = '<div class="swiper-slide"><p>Top-News konnten nicht geladen werden.</p></div>';
    }
}

/**
 * Initializes the news board with regular posts.
 */
async function initNewsBoard() {
    const newsBoard = document.querySelector('.news-board');
    if (!newsBoard) return;

    try {
        const response = await fetch(API_ENDPOINTS.regularNews);
        const posts = await response.json();

        newsBoard.innerHTML = ''; // Clear placeholders

        if (posts && posts.length > 0) {
            posts.forEach(post => {
                const title = post.title.rendered;
                const postLink = post.link;
                const formattedDate = new Date(post.date).toLocaleDateString('de-CH', { month: 'long', day: 'numeric', year: 'numeric' });
                let imageUrl = 'assets/images/renegades_logo_full.png'; // Fallback
                
                if (post._embedded && post._embedded['wp:featuredmedia']) {
                    imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
                }

                const card = document.createElement('a');
                card.className = 'news-item';
                card.href = postLink;
                card.innerHTML = `
                    <img src="${imageUrl}" alt="" class="news-item-image">
                    <div class="news-item-content">
                        <h3 class="news-item-title">${title}</h3>
                        <div class="news-item-meta">
                            <span>Football</span>
                            <span class="separator">|</span>
                            <span>${formattedDate}</span>
                        </div>
                    </div>
                `;
                newsBoard.appendChild(card);
            });
        } else {
            newsBoard.innerHTML = '<p>Keine weiteren Nachrichten gefunden.</p>';
        }
    } catch (error) {
        console.error("Error fetching regular news:", error);
        newsBoard.innerHTML = '<p>Nachrichten konnten nicht geladen werden.</p>';
    }
}


// --- 4. UTILITY FUNCTIONS ---

/**
 * Fetches an HTML file and injects it into a target element.
 * @param {string} filePath - The path to the HTML file to include.
 * @param {string} elementId - The ID of the element to inject the HTML into.
 */
function includeHTML(filePath, elementId) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error('File not found: ' + filePath);
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading HTML:', error);
        });
}
