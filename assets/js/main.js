document.addEventListener('DOMContentLoaded', () =>{
    includeHTML("components/header.html", "header_placeholder");
    includeHTML("components/footer.html", "footer_placeholder");
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