/**
 * Project-Based Learning Website
 * Main JavaScript functionality
 */

// Download all PDFs function
function downloadAll() {
    const pdfFiles = [
        'Blimenfeld et al. 1991_Motivating_project_based_learning_Sustai.pdf',
        'Condlife et al. 2017_PBL Review.pdf',
        'Guo et al. 2020_PBL Review.pdf',
        'Krajcik & Blumenfeld 2006_PBL in Handbook of the Learning Sciences.pdf',
        'Thomas 2000_Review PBL.pdf'
    ];

    // Create a small delay between downloads to avoid browser blocking
    pdfFiles.forEach((file, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = file;
            link.download = file;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, index * 300); // 300ms delay between each download
    });

    // Show confirmation message
    showNotification('Downloading all PDF files... Please check your downloads folder.');
}

// Show notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2d3748;
        color: white;
        padding: 16px 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        border-left: 4px solid #2563eb;
    `;

    document.body.appendChild(notification);

    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Add animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
`;
document.head.appendChild(style);

// Smooth scroll for anchor links (if any are added later)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Track download clicks for analytics (optional)
document.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', function() {
        const fileName = this.getAttribute('href') || 'All PDFs';
        console.log(`Download initiated: ${fileName}`);
        // You can add analytics tracking here if needed
    });
});

// Console welcome message
console.log('%cProject-Based Learning Website', 'color: #2563eb; font-size: 18px; font-weight: 600;');
console.log('%cPowered by modern web technologies and ElevenLabs AI.', 'color: #4a5568; font-size: 13px;');

