/**
 * MÓDULO DASHBOARD
 * Carrega dados e renderiza dashboard principal
 * 
 * Exibe:
 * - Indicadores operacionais
 * - Gráficos
 * - Alertas
 * - Atalhos rápidos
 */

/**
 * Carrega conteúdo do dashboard
 * @returns {Promise<string>} HTML do dashboard
 */
async function loadDashboard() {
    try {
        // Buscar dados
        const stats = await getDashboardStats();
        const alertas = await getAlertasDashboard();
        
        // Renderizar HTML
        return `
            <!-- Page Header -->
            <div class="page-header">
                <h1 class="page-title">Dashboard Operacional</h1>
                <p class="page-subtitle">Bem-vindo ao sistema de gestão operacional</p>
            </div>
            
            <!-- Stats Grid -->
            <div class="stats-grid">
                ${renderStatCard('Total de Colaboradores', stats.totalColaboradores, '📊', 'primary')}
                ${renderStatCard('Ativos Hoje', stats.ativosHoje, '✅', 'success')}
                ${renderStatCard('Em Férias', stats.emFerias, '🏖️', 'info')}
                ${renderStatCard('Day Off', stats.dayOff, '🚫', 'warning')}
                ${renderStatCard('Alterações Pendentes', stats.alteracoesPendentes, '⏳', 'danger')}
                ${renderStatCard('Taxa Ocupação', stats.taxaOcupacao + '%', '📈', 'primary')}
            </div>
            
            <!-- Conteúdo Principal -->
            <div class="content-grid">
                <!-- Escalas de Hoje -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Escalas do Dia</h2>
                        <button class="btn btn-small" onclick="navigateTo('escalas')">Ver Todas</button>
                    </div>
                    <div id="escalas-hoje" class="card-content">
                        ${await renderEscalasHoje()}
                    </div>
                </div>
                
                <!-- Alertas -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">⚠️ Alertas</h2>
                    </div>
                    <div id="alertas-container" class="card-content">
                        ${renderAlertas(alertas)}
                    </div>
                </div>
                
                <!-- Colaboradores por Célula -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Distribuição por Célula</h2>
                    </div>
                    <div id="chart-celulas" style="height: 300px;">
                        <canvas id="canvas-celulas"></canvas>
                    </div>
                </div>
                
                <!-- Colaboradores por Horário -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Distribuição por Horário</h2>
                    </div>
                    <div id="chart-horarios" style="height: 300px;">
                        <canvas id="canvas-horarios"></canvas>
                    </div>
                </div>
                
                <!-- Ações Rápidas -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">⚡ Ações Rápidas</h2>
                    </div>
                    <div class="card-content">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            <button class="btn btn-secondary" onclick="navigateTo('colaboradores')">
                                ➕ Novo Colaborador
                            </button>
                            <button class="btn btn-secondary" onclick="navigateTo('escalas')">
                                📅 Nova Escala
                            </button>
                            <button class="btn btn-secondary" onclick="navigateTo('programacoes')">
                                🗓️ Programar Férias
                            </button>
                            <button class="btn btn-secondary" onclick="navigateTo('relatorios')">
                                📊 Gerar Relatório
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        return '<p>Erro ao carregar dashboard</p>';
    }
}

/**
 * Obtém estatísticas do dashboard
 * @returns {Promise<object>}
 */
async function getDashboardStats() {
    try {
        const colaboradores = await fetchData('colaboradores', { deleted_at: null });
        const hoje = new Date().toISOString().split('T')[0];
        
        // Calcular estatísticas
        const totalColaboradores = colaboradores.length;
        
        // Ativos hoje (sem férias, day off, desligamento)
        const ativosHoje = colaboradores.filter(c => {
            if (c.status !== 'ativo') return false;
            if (c.data_desligamento && c.data_desligamento <= hoje) return false;
            // Verificar férias, day off, etc
            return true;
        }).length;
        
        // Em férias
        const emFerias = colaboradores.filter(c => {
            const primeira = c.primeiro_dia_ferias;
            const ultima = c.ultimo_dia_ferias;
            return primeira && ultima && primeira <= hoje && ultima >= hoje;
        }).length;
        
        // Day off
        const dayOff = colaboradores.filter(c => {
            return c.day_off && c.day_off.includes(hoje);
        }).length;
        
        // Alterações pendentes
        const programacoes = await fetchData('programacoes', { 
            status: 'pendente',
            deleted_at: null 
        });
        const alteracoesPendentes = programacoes.length;
        
        // Taxa de ocupação
        const taxaOcupacao = Math.round((ativosHoje / totalColaboradores) * 100) || 0;
        
        return {
            totalColaboradores,
            ativosHoje,
            emFerias,
            dayOff,
            alteracoesPendentes,
            taxaOcupacao
        };
    } catch (error) {
        console.error('Erro ao obter stats:', error);
        return {
            totalColaboradores: 0,
            ativosHoje: 0,
            emFerias: 0,
            dayOff: 0,
            alteracoesPendentes: 0,
            taxaOcupacao: 0
        };
    }
}

/**
 * Obtém alertas do dashboard
 * @returns {Promise<array>}
 */
async function getAlertasDashboard() {
    const alertas = [];
    const hoje = new Date();
    
    try {
        // Alertas de férias terminando
        const programacoes = await fetchData('programacoes', {
            tipo: 'ferias',
            status: 'ativo'
        });
        
        programacoes.forEach(prog => {
            const dataFim = new Date(prog.data_fim);
            const diasRestantes = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes <= 3 && diasRestantes > 0) {
                alertas.push({
                    tipo: 'info',
                    titulo: `Férias terminando em ${diasRestantes}d`,
                    descricao: `${prog.colaborador_nome || 'Colaborador'} volta em ${formatDate(prog.data_fim)}`
                });
            }
        });
        
        // Alertas de alterações pendentes
        const pendentes = await fetchData('programacoes', { status: 'pendente' });
        if (pendentes.length > 0) {
            alertas.push({
                tipo: 'warning',
                titulo: `${pendentes.length} alteração(ões) pendente(s)`,
                descricao: 'Existem mudanças aguardando aprovação'
            });
        }
        
    } catch (error) {
        console.error('Erro ao obter alertas:', error);
    }
    
    return alertas;
}

/**
 * Renderiza card de estatística
 * @param {string} label - Rótulo
 * @param {number|string} value - Valor
 * @param {string} icon - Ícone
 * @param {string} color - Cor
 * @returns {string} HTML
 */
function renderStatCard(label, value, icon, color = 'primary') {
    return `
        <div class="stat-card">
            <p class="stat-label">${icon} ${label}</p>
            <p class="stat-value">${value}</p>
            <p class="stat-change">↑ Atualizado agora</p>
        </div>
    `;
}

/**
 * Renderiza escalas de hoje
 * @returns {Promise<string>}
 */
async function renderEscalasHoje() {
    try {
        const hoje = new Date().toISOString().split('T')[0];
        const escalas = await fetchData('escalas', { data: hoje });
        
        if (escalas.length === 0) {
            return '<p style="color: var(--color-text-tertiary);">Nenhuma escala para hoje</p>';
        }
        
        let html = '<table class="table"><thead><tr>';
        html += '<th>Colaborador</th><th>Entrada</th><th>Saída</th><th>Status</th>';
        html += '</tr></thead><tbody>';
        
        escalas.slice(0, 5).forEach(escala => {
            html += `
                <tr>
                    <td>${escala.colaborador_nome || '-'}</td>
                    <td>${escala.entrada || '-'}</td>
                    <td>${escala.saida || '-'}</td>
                    <td><span class="badge badge-success">✓</span></td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        if (escalas.length > 5) {
            html += `<p style="color: var(--color-text-tertiary); font-size: var(--font-size-sm); margin-top: 10px;">
                +${escalas.length - 5} escalas mais
            </p>`;
        }
        
        return html;
    } catch (error) {
        console.error('Erro ao renderizar escalas:', error);
        return '<p>Erro ao carregar escalas</p>';
    }
}

/**
 * Renderiza alertas
 * @param {array} alertas - Array de alertas
 * @returns {string}
 */
function renderAlertas(alertas) {
    if (alertas.length === 0) {
        return '<p style="color: var(--color-success);">✓ Sem alertas no momento</p>';
    }
    
    return alertas.map(alerta => `
        <div class="alert alert-${alerta.tipo}" style="margin-bottom: 10px;">
            <strong>${alerta.titulo}</strong>
            <p style="margin: 5px 0 0 0; font-size: 0.9em;">${alerta.descricao}</p>
        </div>
    `).join('');
}

// Estilos CSS para alerts
const alertStyles = `
<style>
    .alert {
        padding: 12px;
        border-radius: 6px;
        border-left: 4px solid;
    }
    
    .alert-info {
        background-color: var(--color-info-light);
        border-left-color: var(--color-info);
        color: var(--color-info-dark);
    }
    
    .alert-warning {
        background-color: var(--color-warning-light);
        border-left-color: var(--color-warning);
        color: var(--color-warning-dark);
    }
    
    .alert-danger {
        background-color: var(--color-danger-light);
        border-left-color: var(--color-danger);
        color: var(--color-danger-dark);
    }
    
    .alert-success {
        background-color: var(--color-success-light);
        border-left-color: var(--color-success);
        color: var(--color-success-dark);
    }
    
    .table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--font-size-sm);
    }
    
    .table th {
        background-color: var(--color-bg-secondary);
        padding: 10px;
        text-align: left;
        font-weight: 600;
    }
    
    .table td {
        padding: 10px;
        border-bottom: 1px solid var(--color-border);
    }
    
    .table tr:hover {
        background-color: var(--color-bg-secondary);
    }
    
    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: var(--font-size-xs);
        font-weight: 600;
    }
    
    .badge-success {
        background-color: var(--color-success);
        color: white;
    }
</style>
`;

// Injetar estilos
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', alertStyles);
}
