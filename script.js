document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM totalmente carregado. Iniciando script.js - Hover Interativo.');

    const track = document.querySelector('.carousel-track');
    const cards = Array.from(track.children);
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    if (cards.length === 0) {
        console.error('Nenhum card encontrado com a classe .carousel-card dentro de .carousel-track. Verifique seu HTML.');
        return;
    }

    console.log(`Encontrados ${cards.length} cards.`);

    // O currentIndex inicial deve ser 1 para que o card do meio (índice 1) comece ativo
    let currentIndex = 1;

    // Variáveis para o estado do hover
    let isHovering = false; // Indica se algum card está sob o mouse
    let hoveredCard = null; // O card que está sob o mouse

    // Função para atualizar a exibição do carrossel (centralização do track e classe active)
    function updateCarousel() {
        console.log('updateCarousel chamado. currentIndex:', currentIndex);

        // Remove a classe 'active' de todos os cards
        cards.forEach(card => card.classList.remove('active'));

        // Adiciona a classe 'active' ao card atual
        if (cards[currentIndex]) {
            cards[currentIndex].classList.add('active');
            console.log('Card ativo:', cards[currentIndex].querySelector('p').innerText.replace(/\n/g, ' '));
        } else {
            console.warn('currentIndex fora do limite:', currentIndex);
            currentIndex = Math.max(0, Math.min(currentIndex, cards.length - 1));
            cards[currentIndex].classList.add('active');
        }

        // Calcula o deslocamento para centralizar o card ativo
        const activeCard = cards[currentIndex];
        if (activeCard) {
            const trackContainerWidth = track.parentElement.offsetWidth;
            const activeCardCenterInTrack = activeCard.offsetLeft + (activeCard.offsetWidth / 2);
            const visibleAreaCenter = trackContainerWidth / 2;
            const newOffset = visibleAreaCenter - activeCardCenterInTrack;

            // Aplica a transição ao track para o movimento de slide
            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            track.style.transform = `translateX(${newOffset}px)`;
            console.log(`Calculated track translateX: ${newOffset}px`);
        } else {
            console.error('Card ativo não encontrado para centralização. currentIndex:', currentIndex);
        }

        // Habilitar/desabilitar botões
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === cards.length - 1;
        console.log(`Botões: Prev Disabled = ${prevButton.disabled}, Next Disabled = ${nextButton.disabled}`);
    }

    // Navegação com botões
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // --- Funcionalidade de Hover Interativo ---
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            isHovering = true;
            hoveredCard = card;
            applyHoverEffect(card, true);
        });

        card.addEventListener('mouseleave', () => {
            isHovering = false;
            hoveredCard = null;
            applyHoverEffect(card, false);
        });
    });

    // Função para aplicar/remover o efeito de hover
    function applyHoverEffect(card, apply) {
        if (apply) {
            // Se o card já é o ativo, a escala do CSS já está aplicada.
            // Podemos adicionar um transform extra para o hover, ou só se não for ativo.
            // Para simplicidade, vamos usar uma nova classe.
            card.classList.add('hover-effect');
        } else {
            card.classList.remove('hover-effect');
        }
    }
    
    // --- Funcionalidade de arrastar (swipe) para desktop e mobile ---
    // Mantemos a lógica de swipe que muda o currentIndex, mas sem mover o track diretamente durante o drag
    let startX;
    let isDragging = false;
    let initialTrackTransform = 0; // Para armazenar o translateX no início do arrasto

    // Função auxiliar para obter o translateX atual do track
    const getTrackCurrentTranslateX = () => {
        const transformStyle = getComputedStyle(track).transform;
        const match = transformStyle.match(/translateX\(([^)]+)px\)/);
        return match ? parseFloat(match[1]) : 0;
    };

    // Desktop (Mouse)
    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        track.style.transition = 'none'; // Desabilita transição durante o arrastar
        initialTrackTransform = getTrackCurrentTranslateX(); // Captura a posição atual
        track.style.cursor = 'grabbing';
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.clientX - startX;
        track.style.transform = `translateX(${initialTrackTransform + x}px)`; // Move o track visualmente
    });

    track.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = 'grab';

        const endX = e.clientX;
        const diffX = endX - startX;
        const swipeThreshold = 50; 
        
        if (diffX > swipeThreshold && currentIndex > 0) { // Arrastou para a direita
            currentIndex--;
        } else if (diffX < -swipeThreshold && currentIndex < cards.length - 1) { // Arrastou para a esquerda
            currentIndex++;
        }
        updateCarousel(); // Reativa a transição e centraliza no novo/mesmo currentIndex
    });

    track.addEventListener('mouseleave', () => { 
        if (isDragging) {
            isDragging = false;
            track.style.cursor = 'grab';
            updateCarousel(); // Volta para a posição correta do card atual
        }
    });

    // Mobile (Touch)
    track.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        track.style.transition = 'none';
        initialTrackTransform = getTrackCurrentTranslateX();
    });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.touches[0].clientX - startX;
        track.style.transform = `translateX(${initialTrackTransform + x}px)`;
    });

    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX;
        const swipeThreshold = 50;
        
        if (diffX > swipeThreshold && currentIndex > 0) {
            currentIndex--;
        } else if (diffX < -swipeThreshold && currentIndex < cards.length - 1) {
            currentIndex++;
        }
        updateCarousel();
    });

    // Inicializa o carrossel na posição correta
    updateCarousel();
});