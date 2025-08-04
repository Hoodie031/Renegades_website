document.addEventListener('DOMContentLoaded', () =>{
    includeHTML("../../components/header.html", "header-placeholder");
    includeHTML("../../components/footer.html", "footer-placeholder");
});

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
            document.getElementById(elementId).innerHTML = '<p>Error loading content.</p>';
        });
}

document.addEventListener('DOMContentLoaded', function() {

    // --- JUMBOTRON SLIDESHOW LOGIC ---

    const featuredPostsAPI = 'http://renegades-cms.local/wp-json/wp/v2/posts?categories=2&_embed=true&per_page=3';
    const jumbotronContainer = document.getElementById('jumbotron-container');

    async function getFeaturedPosts() {
        if (!jumbotronContainer) return; 

        try {
            const response = await fetch(featuredPostsAPI);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const posts = await response.json();

            // Check if the posts array is not empty
            if (posts && posts.length > 0) {
                // If we have posts, clear the "Loading" message
                jumbotronContainer.innerHTML = '';

                posts.forEach(post => {
                    const hasFeaturedImage = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
                    if (hasFeaturedImage) {
                        const imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
                        console.log(post._embedded['wp:featuredmedia'][0]);
                        const title = post.title.rendered;

                        const slide = document.createElement('div');
                        slide.className = 'swiper-slide';
                        slide.style.backgroundImage = `url(${imageUrl})`;
                        slide.innerHTML = `<h3>${title}</h3>`;
                        jumbotronContainer.appendChild(slide);
                    }
                });
                const sliderElement = document.querySelector('#jumbotron-slider');
                console.log("Attempting to initialize Swiper on this element:", sliderElement);
                const jumbotronSwiper = new Swiper('#jumbotron-slider', {
                    loop: true,
                    autoplay: { delay: 5000 },
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                });
            } else {
                // If no posts were found, display a friendly message
                jumbotronContainer.innerHTML = '<div class="swiper-slide"><p>Keine Top-News gefunden.</p></div>';
            }
        } catch (error) {
            console.error("Error fetching featured posts:", error);
            jumbotronContainer.innerHTML = '<div class="swiper-slide"><p>Sorry, could not load the latest news.</p></div>';
        }
    }

    getFeaturedPosts();
});
