
fetch('tools.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('tool-container');
    const renderCards = (category) => {
      container.innerHTML = '';
      const filtered = category === 'all' ? data : data.filter(t => t.category === category);
      filtered.forEach(tool => {
        const card = document.createElement('a');
        card.href = tool.url;
        card.className = "block p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition";
        card.innerHTML = `
          <h2 class="text-xl font-semibold mb-2">${tool.icon} ${tool.name}</h2>
          <p class="text-gray-600 mb-4">${tool.description}</p>
          <span class="inline-block px-4 py-2 text-white brand-bg rounded">Launch</span>
        `;
        container.appendChild(card);
      });
    };
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('brand-bg', 'text-white'));
        btn.classList.add('brand-bg', 'text-white');
        renderCards(btn.dataset.category);
      });
    });
    renderCards('all');
  });
