document.addEventListener('DOMContentLoaded', function() {
  // Gerenciamento do loader
  handleLoader();
  
  // Inicializar componentes da interface
  initChat();
  setupInputEvents();
  setupScrollButton();
  setupMobileMenu();
  setupSmoothScroll();
});

// Funções de inicialização de componentes
function handleLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  
  // Animação de fade-out para o loader
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => loader.style.display = 'none', 500);
  }, 500);
}

function setupInputEvents() {
  const userInput = document.getElementById('userInput');
  if (!userInput) return;
  
  // Evento para envio com Enter
  userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
  
  // Auto-redimensionamento do textarea
  userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = `${Math.min(this.scrollHeight, 150)}px`;
    this.style.overflowY = this.scrollHeight > 150 ? 'auto' : 'hidden';
  });
}

function setupScrollButton() {
  const backToTopButton = document.getElementById('backToTop');
  if (!backToTopButton) return;
  
  // Mostrar/ocultar botão com base no scroll
  window.addEventListener('scroll', () => {
    backToTopButton.classList.toggle('visible', window.scrollY > 300);
  });
  
  // Ação de scroll suave para o topo
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  if (!menuToggle) return;
  
  menuToggle.addEventListener('click', function() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
    
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
  });
}

// Implementação de scroll suave para links internos
function setupSmoothScroll() {
  // Capturar todos os links internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Scroll suave para o elemento alvo
        window.scrollTo({
          top: targetElement.offsetTop - 60, // 60px de offset para o header
          behavior: 'smooth'
        });
        
        // Atualizar URL sem recarregar a página
        history.pushState(null, null, targetId);
      }
    });
  });
}

// Sistema de Chat
const chatHistory = [];
const models = {
  'mistral': {
    name: 'Mistral',
    avatar: '../assets/images/avatars/mistral.png',
    description: 'Modelo versátil e preciso para respostas gerais'
  },
  'deepseek-r1': {
    name: 'DeepSeek R1',
    avatar: '../assets/images/avatars/deepseek.png',
    description: 'Especializado em análises técnicas e científicas'
  },
  'llama3.3': {
    name: 'LLaMA 3',
    avatar: '../assets/images/avatars/llama.png',
    description: 'Modelo avançado para respostas detalhadas e criativas'
  }
};

// Inicialização do chat
function initChat() {
  const chatBox = document.getElementById('chatBox');
  if (!chatBox) return;
  
  // Mensagem de boas-vindas
  addMessage({
    role: 'assistant',
    content: 'Olá! Sou o assistente Synapse. Como posso ajudar você hoje?',
    model: 'system',
    timestamp: new Date().toISOString()
  });
}

// Adicionar mensagem ao chat e histórico
function addMessage(message) {
  displayMessage(message);
  chatHistory.push(message);
}

// Enviar mensagem (continuação)
function sendMessage() {
  const userInput = document.getElementById('userInput');
  const chatBox = document.getElementById('chatBox');
  const modelSelect = document.getElementById('IAs');
  
  if (!userInput || !chatBox || !modelSelect) return;
  
  const userMessage = userInput.value.trim();
  if (userMessage === '') return;
  
  // Limpar e resetar o input
  userInput.value = '';
  userInput.style.height = 'auto';
  userInput.focus();
  
  // Adicionar mensagem do usuário
  addMessage({
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString()
  });
  
  // Mostrar indicador de digitação
  showTypingIndicator(modelSelect.value);
  
  // Simular resposta da IA (com delay para realismo)
  setTimeout(() => {
    removeTypingIndicator();
    processAIResponse(userMessage, modelSelect.value);
  }, 1000 + Math.random() * 1000); // Tempo variável entre 1-2s
}

// Mostrar indicador de digitação
function showTypingIndicator(model) {
  const chatBox = document.getElementById('chatBox');
  if (!chatBox) return;
  
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typingIndicator';
  typingIndicator.className = 'message assistant typing';
  typingIndicator.innerHTML = `
    <div class="message-avatar">
      <img src="${models[model]?.avatar || '../assets/images/avatars/system.png'}" alt="${models[model]?.name || 'Sistema'}">
    </div>
    <div class="message-content">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  
  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Remover indicador de digitação
function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Função para chamar API local Ollama
async function fetchAIResponseLocally(prompt, model = "llama3") {
  try {
    // Verificar se estamos na página de chat
    if (window.location.pathname.includes('chat.html')) {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } else {
      // Resposta simulada para página principal
      return {
        response: "Esta é uma resposta simulada para demonstração. Na página de chat, as respostas viriam da API Ollama."
      };
    }
  } catch (error) {
    console.error('Erro ao chamar API local:', error);
    throw error; // Propaga o erro para ser tratado pela função chamadora
  }
}

// Processar resposta da IA
async function processAIResponse(userMessage, model) {
  try {
    // Verificar se estamos na página de chat
    if (window.location.pathname.includes('chat.html')) {
      const aiResponse = await fetchAIResponseLocally(userMessage, model);
      
      if (!aiResponse || !aiResponse.response) {
        throw new Error('Resposta da API inválida');
      }
      
      addMessage({
        role: 'assistant',
        content: aiResponse.response, // Ollama retorna a resposta no campo "response"
        model: model,
        timestamp: new Date().toISOString()
      });
    } else {
      // Resposta simulada para página principal
      addMessage({
        role: 'assistant',
        content: "Esta é uma resposta simulada para demonstração. Na página de chat, as respostas viriam da API Ollama.",
        model: model,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Erro ao processar resposta da IA:', error);
    addMessage({
      role: 'assistant',
      content: 'Houve um problema ao obter a resposta da IA. Por favor, tente novamente.',
      model: model,
      timestamp: new Date().toISOString()
    });
  }
}

// Exibir mensagem no chat
function displayMessage(message) {
  const chatBox = document.getElementById('chatBox');
  if (!chatBox) return;
  
  const messageElement = document.createElement('div');
  messageElement.className = `message ${message.role}`;
  
  // Formatar data para exibição
  const timestamp = new Date(message.timestamp);
  const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Conteúdo HTML baseado no tipo de mensagem
  if (message.role === 'user') {
    messageElement.innerHTML = `
      <div class="message-content">
        <div class="message-text">${formatMessageContent(message.content)}</div>
        <div class="message-meta">
          <span class="message-time">${formattedTime}</span>
        </div>
      </div>
      <div class="message-avatar">
        <div class="user-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
    `;
  } else {
    // Definir modelo para avatar e nome
    const modelInfo = message.model && models[message.model] ? models[message.model] : { 
      name: 'Sistema', 
      avatar: '../assets/images/avatars/system.png' 
    };
    
    messageElement.innerHTML = `
      <div class="message-avatar">
        <img src="${modelInfo.avatar}" alt="${modelInfo.name}" loading="lazy">
      </div>
      <div class="message-content">
        <div class="message-header">
          <span class="model-name">${modelInfo.name}</span>
        </div>
        <div class="message-text">${formatMessageContent(message.content)}</div>
        <div class="message-meta">
          <span class="message-time">${formattedTime}</span>
          <button class="btn-copy" onclick="copyToClipboard(this)" aria-label="Copiar mensagem">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }
  
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Formatar conteúdo da mensagem (aplicar Markdown)
function formatMessageContent(content) {
  // Formatação básica
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// Copiar para a área de transferência
function copyToClipboard(button) {
  const messageText = button.closest('.message-content').querySelector('.message-text').textContent;
  
  navigator.clipboard.writeText(messageText)
    .then(() => {
      // Feedback visual de sucesso
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
      }, 2000);
    })
    .catch(err => {
      console.error('Erro ao copiar texto: ', err);
      alert('Não foi possível copiar o texto. Por favor, tente novamente.');
    });
}

// Limpar histórico do chat
function clearHistory() {
  const chatBox = document.getElementById('chatBox');
  if (!chatBox) return;
  
  if (confirm('Tem certeza que deseja limpar o histórico de conversa?')) {
    // Limpar interface e histórico
    chatBox.innerHTML = '';
    chatHistory.length = 0;
    
    // Adicionar nova mensagem de boas-vindas
    addMessage({
      role: 'assistant',
      content: 'Histórico limpo. Como posso ajudar você agora?',
      model: 'system',
      timestamp: new Date().toISOString()
    });
  }
}

// Gerar imagem
function gerarImagem() {
  const userInput = document.getElementById('userInput');
  if (!userInput) return;
  
  const prompt = userInput.value.trim();
  
  if (prompt === '') {
    alert('Por favor, descreva a imagem que deseja gerar.');
    return;
  }
  
  // Limpar input
  userInput.value = '';
  userInput.style.height = 'auto';
  
  // Adicionar mensagem do usuário
  addMessage({
    role: 'user',
    content: `Gerar imagem: ${prompt}`,
    timestamp: new Date().toISOString()
  });
  
  // Mostrar indicador de carregamento para geração de imagem
  showImageGenerationLoading(prompt);
  
  // Simular geração de imagem (com delay para realismo)
  setTimeout(() => {
    completeImageGeneration(prompt);
  }, 3000);
}

// Mostrar indicador de carregamento para geração de imagem
function showImageGenerationLoading(prompt) {
  const chatBox = document.getElementById('chatBox');
  if (!chatBox) return;
  
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'imageLoadingIndicator';
  loadingIndicator.className = 'message assistant';
  loadingIndicator.innerHTML = `
    <div class="message-avatar">
      <img src="../assets/images/avatars/system.png" alt="Sistema">
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="model-name">Gerador de Imagens</span>
      </div>
      <div class="message-text">
        <div class="image-loading">
          <p>Gerando imagem baseada em: "${prompt}"</p>
          <div class="loading-spinner"></div>
        </div>
      </div>
    </div>
  `;
  
  chatBox.appendChild(loadingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Completar geração de imagem
function completeImageGeneration(prompt) {
  const chatBox = document.getElementById('chatBox');
  const loadingIndicator = document.getElementById('imageLoadingIndicator');
  
  if (!chatBox || !loadingIndicator) return;
  
  // Remover indicador de carregamento
  chatBox.removeChild(loadingIndicator);
  
  // Adicionar mensagem com imagem gerada
  addMessage({
    role: 'assistant',
    content: `<div class="generated-image">
      <p>Imagem gerada baseada em: "${prompt}"</p>
      <img src="https://source.unsplash.com/random/800x600/?${encodeURIComponent(prompt)}" 
           alt="Imagem gerada: ${prompt}" 
           class="ai-generated-image" 
           loading="lazy">
      <div class="image-actions">
        <button class="btn btn-sm" onclick="downloadImage(this)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </button>
        <button class="btn btn-sm" onclick="regenerateImage('${prompt.replace(/'/g, "\'")}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
          </svg>
          Regenerar
        </button>
      </div>
    </div>`,
    model: 'image-generator',
    timestamp: new Date().toISOString()
  });
}

// Download da imagem gerada
function downloadImage(button) {
  const imgElement = button.closest('.generated-image').querySelector('img');
  if (!imgElement) return;
  
  // Criar link temporário para download
  fetch(imgElement.src)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Synapse-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    })
    .catch(error => {
      console.error('Erro ao baixar imagem:', error);
      alert('Não foi possível baixar a imagem. Por favor, tente novamente.');
    });
}

// Regenerar imagem
function regenerateImage(prompt) {
  // Mostrar indicador de carregamento para regeneração
  showRegenerationLoading(prompt);
  
  // Simular regeneração (com delay para realismo)
  setTimeout(() => {
    completeImageRegeneration(prompt);
  }, 2000);
}

// Mostrar indicador de carregamento para regeneração
function showRegenerationLoading(prompt) {
  const chatBox = document.getElementById('chatBox');
  if (!chatBox) return;
  
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'imageRegenerationIndicator';
  loadingIndicator.className = 'message assistant';
  loadingIndicator.innerHTML = `
    <div class="message-avatar">
      <img src="../assets/images/avatars/system.png" alt="Sistema">
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="model-name">Gerador de Imagens</span>
      </div>
      <div class="message-text">
        <div class="image-loading">
          <p>Regenerando imagem baseada em: "${prompt}"</p>
          <div class="loading-spinner"></div>
        </div>
      </div>
    </div>
  `;
  
  chatBox.appendChild(loadingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Completar regeneração de imagem
function completeImageRegeneration(prompt) {
  const chatBox = document.getElementById('chatBox');
  const loadingIndicator = document.getElementById('imageRegenerationIndicator');
  
  if (!chatBox || !loadingIndicator) return;
  
  // Remover indicador de carregamento
  chatBox.removeChild(loadingIndicator);
  
  // Adicionar mensagem com imagem regenerada (usando timestamp para forçar nova imagem)
  addMessage({
    role: 'assistant',
    content: `<div class="generated-image">
      <p>Imagem regenerada baseada em: "${prompt}"</p>
      <img src="https://source.unsplash.com/random/800x600/?${encodeURIComponent(prompt)}&t=${Date.now()}" 
           alt="Imagem regenerada: ${prompt}" 
           class="ai-generated-image" 
           loading="lazy">
      <div class="image-actions">
        <button class="btn btn-sm" onclick="downloadImage(this)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </button>
        <button class="btn btn-sm" onclick="regenerateImage('${prompt.replace(/'/g, "\'")}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
          </svg>
          Regenerar
        </button>
      </div>
    </div>`,
    model: 'image-generator',
    timestamp: new Date().toISOString()
  });
}