// Estado global da aplicação
let state = {
    jogos: [],
    times: [],
    competidores: [],
    confrontos: [],
    bannerIndex: 0,
    bannerInterval: null
};

// Dados para o Banner Rotativo Automático
const bannersData = [
    {
        titulo: "Arena GamerClass 2026",
        subtitulo: "O epicentro da competição interclasses.",
        cor: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)"
    },
    {
        titulo: "Grandes Finais em Breve",
        subtitulo: "Acompanhe os confrontos decisivos da temporada.",
        cor: "linear-gradient(135deg, #831843 0%, #9f1239 50%, #be123c 100%)"
    },
    {
        titulo: "Monte sua Equipe",
        subtitulo: "Cadastre novos competidores e domine a tabela.",
        cor: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)"
    }
];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    configurarNavegacao();
    configurarBuscaGlobal();
    iniciarBannerRotativo();
    renderizarTudo();
});

// Busca todos os dados via service
async function carregarDados() {
    try {
        const [jogos, times, competidores, confrontos] = await Promise.all([
            getJogos(),
            getTimes(),
            getCompetidores(),
            getConfrontos(),
        ]);

        state.jogos = jogos;
        state.times = times;
        state.competidores = competidores;
        state.confrontos = confrontos;
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

// Configura cliques na navegação lateral
function configurarNavegacao() {
    const itens = document.querySelectorAll('#sidebar-nav li');

    itens.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            trocarView(view);
            itens.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function trocarView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active');
    }
}

// Elemento Inteligente 1: Banner Rotativo Automático no DOM
function iniciarBannerRotativo() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    // Transição suave via CSS inline
    heroSection.style.transition = 'background 0.8s ease-in-out';

    // Cria os controles (indicadores) no DOM
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'banner-dots';
    dotsContainer.style.cssText = 'position: absolute; bottom: 15px; right: 25px; display: flex; gap: 8px; z-index: 2;';

    bannersData.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.style.cssText = `width: 10px; height: 10px; border-radius: 50%; background: ${idx === 0 ? '#fff' : 'rgba(255,255,255,0.4)'}; cursor: pointer; transition: all 0.3s;`;
        dot.addEventListener('click', () => {
            state.bannerIndex = idx;
            atualizarBanner();
            reiniciarTemporizadorBanner();
        });
        dotsContainer.appendChild(dot);
    });

    heroSection.appendChild(dotsContainer);

    // Inicia a rotação automática
    reiniciarTemporizadorBanner();
}

function atualizarBanner() {
    const heroSection = document.querySelector('.hero');
    const heroTitle = heroSection?.querySelector('h1');
    const heroSub = heroSection?.querySelector('.subtitle');
    const dots = heroSection?.querySelectorAll('.banner-dots span');

    if (!heroSection || !heroTitle || !heroSub) return;

    const data = bannersData[state.bannerIndex];
    heroSection.style.background = data.cor;
    heroTitle.textContent = data.titulo;
    heroSub.textContent = data.subtitulo;

    if (dots) {
        dots.forEach((dot, idx) => {
            dot.style.background = idx === state.bannerIndex ? '#fff' : 'rgba(255,255,255,0.4)';
            dot.style.transform = idx === state.bannerIndex ? 'scale(1.2)' : 'scale(1)';
        });
    }
}

function reiniciarTemporizadorBanner() {
    if (state.bannerInterval) clearInterval(state.bannerInterval);
    state.bannerInterval = setInterval(() => {
        state.bannerIndex = (state.bannerIndex + 1) % bannersData.length;
        atualizarBanner();
    }, 4000);
}

// Elemento Inteligente 2: Campo de busca/filtro interativo no DOM
function configurarBuscaGlobal() {
    const aside = document.querySelector('aside');
    if (!aside) return;

    const searchBox = document.createElement('div');
    searchBox.style.cssText = 'padding: 0 0 1rem 0;';
    searchBox.innerHTML = `
        <input type="text" id="global-search" placeholder="🔍 Filtrar itens..." 
               style="width: 100%; padding: 0.6rem 0.8rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: #fff; font-size: 0.85rem;">
    `;

    const nav = document.getElementById('sidebar-nav');
    if (nav) {
        aside.insertBefore(searchBox, nav);
    }

    const inputBusca = document.getElementById('global-search');
    inputBusca.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        filtrarConteudoVisivel(termo);
    });
}

function filtrarConteudoVisivel(termo) {
    const cards = document.querySelectorAll('.view.active .card');
    cards.forEach(card => {
        const texto = card.textContent.toLowerCase();
        if (texto.includes(termo)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function renderizarTudo() {
    renderizarDashboard();
    renderizarJogos();
    renderizarTimes();
    renderizarCompetidores();
    renderizarConfrontos();
}

// --- Funções de renderização ---

function renderizarDashboard() {
    const stats = document.getElementById('dashboard-stats');
    const proximos = document.getElementById('upcoming-matches');

    const encerrados = state.confrontos.filter(c => c.status === 'finished').length;
    const agendados = state.confrontos.filter(c => c.status === 'scheduled').length;

    stats.innerHTML = `
        <div class="card">
            <span class="card-tag">Torneio</span>
            <h3>${state.times.length}</h3>
            <p class="subtitle">Equipes</p>
        </div>
        <div class="card">
            <span class="card-tag">Atletas</span>
            <h3>${state.competidores.length}</h3>
            <p class="subtitle">Competidores</p>
        </div>
        <div class="card">
            <span class="card-tag">Encerrados</span>
            <h3>${encerrados}</h3>
            <p class="subtitle">Resultados</p>
        </div>
        <div class="card">
            <span class="card-tag">Pendentes</span>
            <h3>${agendados}</h3>
            <p class="subtitle">Agendamentos</p>
        </div>
    `;

    const lista = state.confrontos.filter(c => c.status === 'scheduled').slice(0, 3);

    proximos.innerHTML = lista.map(c => {
        const jogo = state.jogos.find(j => j.id === c.gameId);
        const time1 = state.times.find(t => t.id === c.team1Id);
        const time2 = state.times.find(t => t.id === c.team2Id);
        return `
            <div class="card">
                <span class="card-tag">${jogo?.name || 'Jogo'}</span>
                <div class="match-card">
                    <div class="team-score"><strong>${time1?.name || 'TBD'}</strong></div>
                    <div class="vs">VS</div>
                    <div class="team-score"><strong>${time2?.name || 'TBD'}</strong></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarJogos() {
    const lista = document.getElementById('list-jogos');
    if (!lista) return;
    lista.innerHTML = state.jogos.map(j => `
        <div class="card">
            <span class="card-tag">${j.genre}</span>
            <h3>${j.name}</h3>
            <p class="subtitle">ID: ${j.id}</p>
        </div>
    `).join('');
}

function renderizarTimes() {
    const lista = document.getElementById('list-times');
    if (!lista) return;
    lista.innerHTML = state.times.map(t => `
        <div class="card" style="border-right: 4px solid ${t.color}">
            <span class="card-tag">EQUIPE</span>
            <h3>${t.name}</h3>
            <p class="subtitle">${state.competidores.filter(c => c.teamId === t.id).length} Jogadores</p>
        </div>
    `).join('');
}

function renderizarCompetidores() {
    const lista = document.getElementById('list-competidores');
    if (!lista) return;
    lista.innerHTML = state.competidores.map(c => {
        const time = state.times.find(t => t.id === c.teamId);
        return `
            <div class="card">
                <span class="card-tag">${time?.name || 'Sem Time'}</span>
                <h3>${c.nickname}</h3>
                <p class="subtitle">${c.name}</p>
            </div>
        `;
    }).join('');
}

function renderizarConfrontos() {
    const lista = document.getElementById('list-confrontos');
    if (!lista) return;
    lista.innerHTML = state.confrontos.map(c => {
        const jogo = state.jogos.find(j => j.id === c.gameId);
        const time1 = state.times.find(t => t.id === c.team1Id);
        const time2 = state.times.find(t => t.id === c.team2Id);
        const data = new Date(c.date).toLocaleString('pt-BR');

        return `
            <div class="card">
                <span class="card-tag">${jogo?.name || 'Jogo'} | ${data}</span>
                <div class="match-card">
                    <div class="team-score">
                        <strong>${time1?.name || '???'}</strong>
                        <div class="score">${c.score1}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team-score">
                        <strong>${time2?.name || '???'}</strong>
                        <div class="score">${c.score2}</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; text-align: center;">
                    <span class="card-tag" style="background: ${c.status === 'finished' ? '#10b981' : '#f59e0b'}">
                        ${c.status === 'finished' ? 'FINALIZADO' : 'AGENDADO'}
                    </span>
                    ${c.status === 'scheduled'
                        ? `<button onclick="encerrarConfrontos(${c.id})" style="padding: 4px 8px; font-size: 0.7rem; margin-left: 8px;">Finalizar</button>`
                        : ''}
                </div>
            </div>
        `;
    }).join('');
}

// --- Modal e formulários ---

const modal = document.getElementById('modal-container');
const formContent = document.getElementById('form-content');

window.abrirFormulario = function (tipo) {
    if (!modal || !formContent) return;

    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
    }, 10);

    const optionsTimes = state.times.length
        ? state.times.map(t => `<option value="${t.id}">${t.name}</option>`).join('')
        : '<option value="">Nenhum time cadastrado</option>';

    const optionsJogos = state.jogos.length
        ? state.jogos.map(j => `<option value="${j.id}">${j.name}</option>`).join('')
        : '<option value="">Nenhum jogo cadastrado</option>';

    const formularios = {
        jogo: `
            <h2>Adicionar Jogo</h2>
            <form onsubmit="salvarItem(event, 'jogos')">
                <div class="form-group">
                    <label>Nome do Jogo</label>
                    <input type="text" name="name" required placeholder="Ex: CS2">
                </div>
                <div class="form-group">
                    <label>Gênero</label>
                    <input type="text" name="genre" required placeholder="Ex: FPS">
                </div>
                <div style="display:flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Salvar</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>
        `,
        time: `
            <h2>Adicionar Time</h2>
            <form onsubmit="salvarItem(event, 'times')">
                <div class="form-group">
                    <label>Nome da Equipe</label>
                    <input type="text" name="name" required placeholder="Ex: Ninjas da Noite">
                </div>
                <div class="form-group">
                    <label>Cor Identidade</label>
                    <input type="color" name="color" value="#6366f1">
                </div>
                <div style="display:flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Criar</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>
        `,
        competidor: `
            <h2>Registrar Competidor</h2>
            <form onsubmit="salvarItem(event, 'competidores')">
                <div class="form-group">
                    <label>Nome Completo</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Nickname</label>
                    <input type="text" name="nickname" required>
                </div>
                <div class="form-group">
                    <label>Time</label>
                    <select name="teamId" required>${optionsTimes}</select>
                </div>
                <div style="display:flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Registrar</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>
        `,
        confronto: `
            <h2>Novo Confronto</h2>
            <form onsubmit="salvarItem(event, 'confrontos')">
                <div class="form-group">
                    <label>Jogo</label>
                    <select name="gameId" required>${optionsJogos}</select>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label>Time A</label>
                        <select name="team1Id" required>${optionsTimes}</select>
                    </div>
                    <div class="form-group">
                        <label>Time B</label>
                        <select name="team2Id" required>${optionsTimes}</select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Data/Hora</label>
                    <input type="datetime-local" name="date" required value="${new Date().toISOString().slice(0, 16)}">
                </div>
                <input type="hidden" name="score1" value="0">
                <input type="hidden" name="score2" value="0">
                <input type="hidden" name="status" value="scheduled">
                <div style="display:flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Agendar</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </div>
            </form>
        `,
    };

    formContent.innerHTML = formularios[tipo] || '';
};

window.fecharModal = function () {
    if (!modal) return;
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
};

window.salvarItem = function (event, colecao) {
    event.preventDefault();
    const dados = Object.fromEntries(new FormData(event.target).entries());

    const maxId = state[colecao].reduce((max, item) => (item.id > max ? item.id : max), 0);
    dados.id = maxId + 1;

    if (dados.teamId) dados.teamId = Number(dados.teamId);
    if (dados.gameId) dados.gameId = Number(dados.gameId);
    if (dados.team1Id) dados.team1Id = Number(dados.team1Id);
    if (dados.team2Id) dados.team2Id = Number(dados.team2Id);
    if (dados.score1 !== undefined) dados.score1 = Number(dados.score1);
    if (dados.score2 !== undefined) dados.score2 = Number(dados.score2);

    state[colecao].push(dados);
    renderizarTudo();
    fecharModal();
};

window.encerrarConfrontos = function (id) {
    const confronto = state.confrontos.find(c => c.id === id);
    if (!confronto) return;

    const time1 = state.times.find(t => t.id === confronto.team1Id);
    const time2 = state.times.find(t => t.id === confronto.team2Id);

    const placar1 = prompt(`Placar para ${time1?.name}:`, '0');
    const placar2 = prompt(`Placar para ${time2?.name}:`, '0');

    if (placar1 !== null && placar2 !== null) {
        confronto.score1 = Number(placar1);
        confronto.score2 = Number(placar2);
        confronto.status = 'finished';
        renderizarTudo();
    }
};