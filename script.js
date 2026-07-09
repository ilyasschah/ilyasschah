// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {

  // Initialize Animate on Scroll library
  AOS.init({
    duration: 900,        // Animation duration in milliseconds
    easing: 'ease-out-cubic', // Smooth fade-in instead of an abrupt pop
    offset: 80,
    once: true,            // Whether animation should happen only once
  });

  // --- Typewriter effect for the header ---
  const typewriterElement = document.getElementById('typewriter');
  const roles = ["DevOps & .NET Developer", "Cloud & Microservices Engineer", "POS System Builder"];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentRole = roles[roleIndex];
    let typeSpeed = 150;

    if (isDeleting) {
      // Deleting text
      typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 75;
    } else {
      // Typing text
      typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    // If word is fully typed or deleted
    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at end of word before starting to delete
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 500; // Pause before typing next word
    }

    setTimeout(type, typeSpeed);
  }
  
  // Start the typing effect if the element exists
  if(typewriterElement) {
    type();
  }


  // --- Animate skill bars on scroll ---
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  
  const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Set the width using the CSS variable when it comes into view
        entry.target.style.width = entry.target.style.getPropertyValue('--skill-level');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.8 // Trigger when 80% of the element is visible
  });

  // Observe each skill bar fill element
  skillBars.forEach(bar => {
    skillObserver.observe(bar);
  });

  // --- Gemini API Project Idea Generator ---
  const generateBtn = document.getElementById('generate-idea-btn');
  const keywordsInput = document.getElementById('ai-keywords');
  const loadingSpinner = document.getElementById('loading-spinner');
  const ideaResultDiv = document.getElementById('idea-result');
  const ideaTitle = document.getElementById('idea-title');
  const ideaDescription = document.getElementById('idea-description');
  const ideaTech = document.getElementById('idea-tech');

  generateBtn.addEventListener('click', async () => {
    const keywords = keywordsInput.value;
    if (!keywords) {
      alert('Please enter some keywords!');
      return;
    }

    // Show spinner and hide previous results
    loadingSpinner.style.display = 'block';
    ideaResultDiv.style.display = 'none';

    // Construct the prompt for the Gemini API
    const prompt = `Based on the keywords "${keywords}", generate a creative and specific project idea for a software developer. Provide a project title, a short description (2-3 sentences), and a comma-separated list of recommended technologies. Format the output as a JSON object with the keys "title", "description", and "technologies".`;
    
    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""; // Leave this as-is
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            
            const text = result.candidates[0].content.parts[0].text;
            // Clean the response to ensure it's valid JSON
            const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const idea = JSON.parse(jsonString);

            // Display the results
            ideaTitle.textContent = idea.title;
            ideaDescription.textContent = idea.description;
            ideaTech.textContent = idea.technologies;
            ideaResultDiv.style.display = 'block';

        } else {
            throw new Error("Invalid response structure from API.");
        }

    } catch (error) {
      console.error('Error fetching from Gemini API:', error);
      alert('Sorry, there was an error generating an idea. Please try again.');
    } finally {
      // Hide spinner
      loadingSpinner.style.display = 'none';
    }
  });
});
