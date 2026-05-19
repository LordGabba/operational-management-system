/**
 * MÓDULO COLABORADORES
 * CRUD completo de colaboradores com:
 * - Cadastro, edição, exclusão
 * - Importação/Exportação
 * - Validações
 * - Filtros avançados
 */

let colaboradoresData = [];
let colaboradorEditando = null;
const CAMPOS_COLABORADOR = [
    'matricula', 'centro_custo', 'nome', 'user_jira', 'user_blip',
    'email', 'reporte', 'status', 'celula', 'grupo', 'tipo', 'horario',
    'escala', 'data_saida', 'data_admissao', 'tempo_meses', 'cargo', 'cpf',
    'data_nascimento', 'idade', 'sexo', 'filial', 'area', 'telefone',
    'programacao_ferias', 'primeiro_dia_ferias', 'ultimo_dia_ferias',
    'observacoes', 'tags', 'status_operacional', 'turno', 'supervisor',
    'coordenador', 'escala_ativa', 'banco_horas', 'jornada_semanal',
    'data_desligamento', 'motivo_desligamento'
];

/**
 * Carrega interface de colaboradores
 * @returns {Promise<string>}
 */
async function loadColaboradores() {
    try {
        colaboradoresData = await fetchData('colaboradores', { deleted_at: null }, 'nome');
        
        return `
            <!-- Page Header -->
            <div class="page-header">
                <div>
                    <h1 class="page-title">Colaboradores</h1>
                    <p class="page-subtitle">${colaboradoresData.length} colaboradores cadastrados</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="showNovoColaboradorModal()">
                        ➕ Novo Colaborador
                    </button>
                    <button class="btn btn-secondary" onclick="showImportacaoModal()">
                        📤 Importar
                    </button>
                    <button class="btn btn-secondary" onclick="exportarColaboradores()">
                        📥 Exportar
                    </button>
                </div>
            </div>
            
            <!-- Filtros -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div class="form-group">
                            <input type="text" id="search-colaborador" placeholder="🔍 Buscar por nome, email, CPF..."
                                   onkeyup="filtrarColaboradores()">
                        </div>
                        <div class="form-group">
                            <select id="filter-status" onchange="filtrarColaboradores()">
                                <option value="">Status: Todos</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                                <option value="desligado">Desligado</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <select id="filter-celula" onchange="filtrarColaboradores()">
                                <option value="">Célula: Todas</option>
                                <option value="operacional">Operacional</option>
                                <option value="administrativo">Administrativo</option>
                                <option value="ti">TI</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <select id="filter-horario" onchange="filtrarColaboradores()">
                                <option value="">Horário: Todos</option>
                                <option value="matutino">Matutino</option>
                                <option value="vespertino">Vespertino</option>
                                <option value="noturno">Noturno</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tabela de Colaboradores -->
            <div class="card">
                <div class="card-content">
                    <div id="colaboradores-table-container">
                        ${renderTabelaColaboradores(colaboradoresData)}
                    </div>
                </div>
            </div>
            
            <!-- Modal de Novo/Edição -->
            <div id="modal-colaborador" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modal-titulo">Novo Colaborador</h2>
                        <button class="btn-close" onclick="fecharModal('modal-colaborador')">✕</button>
                    </div>
                    <div class="modal-body">
                        <form id="form-colaborador" onsubmit="salvarColaborador(event)">
                            ${renderFormColaborador()}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="fecharModal('modal-colaborador')">Cancelar</button>
                        <button class="btn btn-primary" onclick="submitForm('form-colaborador')">Salvar</button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
        return '<p>Erro ao carregar colaboradores</p>';
    }
}

/**
 * Renderiza tabela de colaboradores
 * @param {array} colaboradores
 * @returns {string}
 */
function renderTabelaColaboradores(colaboradores) {
    if (colaboradores.length === 0) {
        return '<p>Nenhum colaborador encontrado</p>';
    }
    
    let html = `
        <table class="table table-responsive">
            <thead>
                <tr>
                    <th>Matrícula</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>CPF</th>
                    <th>Célula</th>
                    <th>Status</th>
                    <th>Horário</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    colaboradores.forEach(col => {
        html += `
            <tr>
                <td><strong>${col.matricula || '-'}</strong></td>
                <td>${col.nome || '-'}</td>
                <td>${col.email || '-'}</td>
                <td>${formatCPF(col.cpf) || '-'}</td>
                <td>${col.celula || '-'}</td>
                <td><span class="badge badge-${getBadgeColor(col.status)}">${col.status || '-'}</span></td>
                <td>${col.horario || '-'}</td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="editarColaborador(${col.id})">✏️</button>
                    <button class="btn btn-small btn-danger" onclick="deletarColaborador(${col.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    return html;
}

/**
 * Renderiza formulário de colaborador
 * @returns {string}
 */
function renderFormColaborador() {
    return `
        <!-- Dados Básicos -->
        <fieldset>
            <legend>Dados Básicos</legend>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="form-group">
                    <label>Matrícula *</label>
                    <input type="text" name="matricula" required>
                </div>
                <div class="form-group">
                    <label>Nome Completo *</label>
                    <input type="text" name="nome" required>
                </div>
                <div class="form-group">
                    <label>E-mail *</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>CPF *</label>
                    <input type="text" name="cpf" placeholder="000.000.000-00" 
                           onchange="validarCPF(this)" required>
                </div>
            </div>
        </fieldset>
        
        <!-- Informações Profissionais -->
        <fieldset>
            <legend>Informações Profissionais</legend>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="form-group">
                    <label>Cargo *</label>
                    <input type="text" name="cargo" required>
                </div>
                <div class="form-group">
                    <label>Célula</label>
                    <select name="celula">
                        <option value="">Selecione...</option>
                        <option value="operacional">Operacional</option>
                        <option value="administrativo">Administrativo</option>
                        <option value="ti">TI</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Grupo</label>
                    <input type="text" name="grupo">
                </div>
                <div class="form-group">
                    <label>Supervisor</label>
                    <input type="text" name="supervisor">
                </div>
                <div class="form-group">
                    <label>Coordenador</label>
                    <input type="text" name="coordenador">
                </div>
                <div class="form-group">
                    <label>Centro de Custo</label>
                    <input type="text" name="centro_custo">
                </div>
            </div>
        </fieldset>
        
        <!-- Escala e Horário -->
        <fieldset>
            <legend>Escala e Horário</legend>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="form-group">
                    <label>Horário</label>
                    <select name="horario">
                        <option value="">Selecione...</option>
                        <option value="matutino">Matutino</option>
                        <option value="vespertino">Vespertino</option>
                        <option value="noturno">Noturno</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Escala</label>
                    <input type="text" name="escala">
                </div>
                <div class="form-group">
                    <label>Turno</label>
                    <input type="text" name="turno">
                </div>
                <div class="form-group">
                    <label>Jornada Semanal (horas)</label>
                    <input type="number" name="jornada_semanal" min="0" step="0.5">
                </div>
            </div>
        </fieldset>
        
        <!-- Dados Pessoais -->
        <fieldset>
            <legend>Dados Pessoais</legend>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="form-group">
                    <label>Data de Nascimento</label>
                    <input type="date" name="data_nascimento" onchange="calcularIdade()">
                </div>
                <div class="form-group">
                    <label>Idade</label>
                    <input type="number" name="idade" readonly>
                </div>
                <div class="form-group">
                    <label>Sexo</label>
                    <select name="sexo">
                        <option value="">Selecione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="tel" name="telefone" placeholder="(00) 00000-0000">
                </div>
            </div>
        </fieldset>
        
        <!-- Datas Importantes -->
        <fieldset>
            <legend>Datas Importantes</legend>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="form-group">
                    <label>Data de Admissão *</label>
                    <input type="date" name="data_admissao" required>
                </div>
                <div class="form-group">
                    <label>Data de Saída</label>
                    <input type="date" name="data_saida">
                </div>
                <div class="form-group">
                    <label>Data de Desligamento</label>
                    <input type="date" name="data_desligamento">
                </div>
                <div class="form-group">
                    <label>Motivo Desligamento</label>
                    <select name="motivo_desligamento">
                        <option value="">Selecione...</option>
                        <option value="pedido">Pedido de Demissão</option>
                        <option value="dispensa">Dispensa</option>
                        <option value="aposentadoria">Aposentadoria</option>
                        <option value="rescisao">Rescisão</option>
                    </select>
                </div>
            </div>
        </fieldset>
        
        <!-- Status e Observações -->
        <fieldset>
            <legend>Status e Observações</legend>
            <div class="form-group">
                <label>Status *</label>
                <select name="status" required>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="desligado">Desligado</option>
                </select>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea name="observacoes" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Tags</label>
                <input type="text" name="tags" placeholder="tag1, tag2, tag3">
            </div>
        </fieldset>
    `;
}

/**
 * Mostra modal de novo colaborador
 */
function showNovoColaboradorModal() {
    colaboradorEditando = null;
    document.getElementById('modal-titulo').textContent = 'Novo Colaborador';
    resetForm('form-colaborador');
    showModal('modal-colaborador');
}

/**
 * Edita um colaborador
 * @param {number} id
 */
async function editarColaborador(id) {
    try {
        colaboradorEditando = await fetchById('colaboradores', id);
        
        if (!colaboradorEditando) {
            showToast('Colaborador não encontrado', 'error');
            return;
        }
        
        document.getElementById('modal-titulo').textContent = 'Editar Colaborador';
        
        // Preencher formulário
        Object.keys(colaboradorEditando).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = colaboradorEditando[key] || '';
            }
        });
        
        showModal('modal-colaborador');
    } catch (error) {
        console.error('Erro ao editar:', error);
        showToast('Erro ao editar colaborador', 'error');
    }
}

/**
 * Salva colaborador
 * @param {Event} event
 */
async function salvarColaborador(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(document.getElementById('form-colaborador'));
        const dados = Object.fromEntries(formData);
        
        // Validações
        if (!validateEmail(dados.email)) {
            showToast('E-mail inválido', 'error');
            return;
        }
        
        if (!validateCPF(dados.cpf)) {
            showToast('CPF inválido', 'error');
            return;
        }
        
        // Calcular tempo de empresa
        if (dados.data_admissao) {
            const admissao = new Date(dados.data_admissao);
            const hoje = new Date();
            dados.tempo_meses = Math.floor((hoje - admissao) / (1000 * 60 * 60 * 24 * 30.44));
        }
        
        let result;
        if (colaboradorEditando) {
            result = await updateData('colaboradores', colaboradorEditando.id, dados);
            showToast('Colaborador atualizado com sucesso!', 'success');
        } else {
            result = await insertData('colaboradores', dados);
            showToast('Colaborador cadastrado com sucesso!', 'success');
        }
        
        fecharModal('modal-colaborador');
        colaboradoresData = await fetchData('colaboradores', { deleted_at: null }, 'nome');
        renderPage();
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showToast('Erro ao salvar colaborador', 'error');
    }
}

/**
 * Deleta colaborador
 * @param {number} id
 */
async function deletarColaborador(id) {
    if (!confirm('Tem certeza que deseja deletar este colaborador?')) {
        return;
    }
    
    try {
        await deleteData('colaboradores', id);
        showToast('Colaborador deletado com sucesso!', 'success');
        colaboradoresData = await fetchData('colaboradores', { deleted_at: null }, 'nome');
        document.getElementById('colaboradores-table-container').innerHTML = 
            renderTabelaColaboradores(colaboradoresData);
    } catch (error) {
        console.error('Erro ao deletar:', error);
        showToast('Erro ao deletar colaborador', 'error');
    }
}

/**
 * Filtra colaboradores
 */
function filtrarColaboradores() {
    const search = document.getElementById('search-colaborador').value.toLowerCase();
    const status = document.getElementById('filter-status').value;
    const celula = document.getElementById('filter-celula').value;
    const horario = document.getElementById('filter-horario').value;
    
    let filtrados = colaboradoresData.filter(col => {
        const matchSearch = !search || 
            col.nome?.toLowerCase().includes(search) ||
            col.email?.toLowerCase().includes(search) ||
            col.cpf?.includes(search);
        
        const matchStatus = !status || col.status === status;
        const matchCelula = !celula || col.celula === celula;
        const matchHorario = !horario || col.horario === horario;
        
        return matchSearch && matchStatus && matchCelula && matchHorario;
    });
    
    document.getElementById('colaboradores-table-container').innerHTML = 
        renderTabelaColaboradores(filtrados);
}

/**
 * Exporta colaboradores
 */
function exportarColaboradores() {
    const formato = confirm('OK para Excel, Cancelar para CSV');
    
    if (formato) {
        exportarExcel(colaboradoresData, 'colaboradores');
    } else {
        exportarCSV(colaboradoresData, 'colaboradores');
    }
}

/**
 * Mostra modal de importação
 */
function showImportacaoModal() {
    showModal('modal-importacao', {
        title: 'Importar Colaboradores',
        content: `
            <div class="form-group">
                <label>Arquivo CSV ou XLSX</label>
                <input type="file" id="import-file" accept=".csv,.xlsx" required>
            </div>
            <div id="import-preview"></div>
        `,
        buttons: [
            { label: 'Cancelar', callback: () => { }, class: 'btn-secondary' },
            { label: 'Importar', callback: () => importarColaboradores(), class: 'btn-primary' }
        ]
    });
}

/**
 * Importa colaboradores do arquivo
 */
async function importarColaboradores() {
    try {
        const file = document.getElementById('import-file').files[0];
        if (!file) {
            showToast('Selecione um arquivo', 'error');
            return;
        }
        
        // Ler arquivo
        const text = await file.text();
        const linhas = text.split('\n').map(l => l.trim()).filter(l => l);
        
        // Parsear dados
        const dados = [];
        const headers = linhas[0].split(',');
        
        for (let i = 1; i < linhas.length; i++) {
            const valores = linhas[i].split(',');
            const row = {};
            headers.forEach((h, idx) => {
                row[h.trim()] = valores[idx]?.trim() || '';
            });
            dados.push(row);
        }
        
        // Importar em lote
        for (const row of dados) {
            await insertData('colaboradores', row);
        }
        
        showToast(`${dados.length} colaboradores importados com sucesso!`, 'success');
        fecharModal('modal-importacao');
        colaboradoresData = await fetchData('colaboradores', { deleted_at: null });
        renderPage();
    } catch (error) {
        console.error('Erro ao importar:', error);
        showToast('Erro ao importar arquivo', 'error');
    }
}

/**
 * Calcula idade baseado em data de nascimento
 */
function calcularIdade() {
    const input = document.querySelector('[name="data_nascimento"]');
    const idadeInput = document.querySelector('[name="idade"]');
    
    if (input.value) {
        const data = new Date(input.value);
        const hoje = new Date();
        let idade = hoje.getFullYear() - data.getFullYear();
        const mes = hoje.getMonth() - data.getMonth();
        
        if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
            idade--;
        }
        
        idadeInput.value = idade;
    }
}

/**
 * Obtém cor para badge de status
 * @param {string} status
 * @returns {string}
 */
function getBadgeColor(status) {
    const cores = {
        'ativo': 'success',
        'inativo': 'warning',
        'desligado': 'danger'
    };
    return cores[status] || 'secondary';
}
