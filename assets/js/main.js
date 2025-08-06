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
                    const title = post.title.rendered;
                    const postDate = new Date(post.date);
                    const formattedDate = postDate.toLocaleDateString('de-CH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    console.log(formattedDate);
                    const hasFeaturedImage = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
                    if (hasFeaturedImage) {
                        imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
                    } else {
                        imageUrl = 'assets/images/renegades_logo_full.png';
                    }

                    // Build HTML structure for each post
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';
                    slide.style.backgroundImage = `url(${imageUrl})`;
                    slide.innerHTML = `
                        <div class="slide-content">
                            <p class='slide-date'>${formattedDate}</p>
                            <h3 class='slide-title'>${title}</h3>
                            <a class='slide-read-more' href="${post.link}" class="read-more">WEITERLESEN</a>
                        </div>
                    `;

                    // Apply special styling for fallback image
                    if (!hasFeaturedImage) {
                        slide.style.backgroundSize = 'contain';
                        slide.style.backgroundColor = '#111';
                        slide.style.backgroundRepeat = 'no-repeat';
                    }

                    jumbotronContainer.appendChild(slide);
                });
                const sliderElement = document.querySelector('#jumbotron-slider');
                console.log("Attempting to initialize Swiper on this element:", sliderElement);
                const jumbotronSwiper = new Swiper('#jumbotron-slider', {
                    loop: true,
                    autoplay: { delay: 6000, disableOnInteraction: false},
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },

                    on: {
                        init: function () {
                            setTimeout(() => {
                                this.slides[this.activeIndex].classList.add('slide-is-active')
                            }, 1000);
                        },

                        slideChange: function () {
                            this.slides.forEach(slide => {
                                slide.classList.remove('slide-is-active');
                            });

                            setTimeout(() => {
                                this.slides[this.activeIndex].classList.add('slide-is-active')
                            }, 1000);

                        }
                    }
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
