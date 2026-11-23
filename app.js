const STORAGE_KEY = 'decolae_frontend_penpot_v3';
const emptyData = { routes: [], aircraft: [], crew: [], flights: [] };
let db = loadData();
let role = 'gerente';
let currentPage = 'inicio';
let pendingFlight = null;
const content = document.getElementById('appContent');
const navigation = document.getElementById('navigation');

function loadData(){
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? {...emptyData, ...JSON.parse(saved)} : structuredClone(emptyData); }
  catch { return JSON.parse(JSON.stringify(emptyData)); }
}
function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
function nextId(list){ return list.length ? Math.max(...list.map(x => Number(x.id)||0))+1 : 1; }
function esc(v=''){ return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function money(v){ return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function dateBR(v){ if(!v)return '—'; const [y,m,d]=v.split('-'); return `${d}/${m}/${y}`; }
function title(){ return ({inicio:'Início',trajetos:'Trajetos',aeronaves:'Aeronaves',tripulacao:'Tripulação',criarVoo:'Criar voo',voos:'Voos',escalas:'Escalas',verificacao:'Verificação do voo'})[currentPage]||'Início'; }
function navItems(){ return role==='gerente' ? [['inicio','⌂','Início'],['trajetos','▤','Trajetos'],['aeronaves','✈','Aeronaves'],['tripulacao','♙','Tripulação']] : [['inicio','⌂','Início'],['criarVoo','＋','Criar voo'],['voos','▤','Voos'],['escalas','♙','Escalas']]; }
function renderNav(){
  navigation.innerHTML = navItems().map(([id,ico,label])=>`<button class="nav-item ${currentPage===id?'active':''}" data-page="${id}"><span class="nav-icon">${ico}</span>${label}</button>`).join('');
  navigation.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>go(b.dataset.page));
}
function go(page){ currentPage=page; if(page!=='verificacao') pendingFlight=null; render(); document.getElementById('sidebar').classList.remove('open'); }
function render(){
  renderNav(); document.getElementById('breadcrumbCurrent').textContent=title();
  document.getElementById('profileRole').textContent=role==='gerente'?'Gerente':'Administrador';
  document.getElementById('todayLabel').textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  const pages={inicio:renderHome,trajetos:renderRoutes,aeronaves:renderAircraft,tripulacao:renderCrew,criarVoo:()=>flightForm(),voos:renderFlights,escalas:renderScales,verificacao:renderVerification};
  (pages[currentPage]||renderHome)();
}
function heading(kicker,h1,desc,action=''){
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${h1}</h1><p>${desc}</p></div>${action}</div>`;
}
function stat(label,value,foot){ return `<div class="stat-card"><div class="stat-top">${label}</div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></div>`; }
function routeName(id){ const r=db.routes.find(x=>x.id===Number(id)); return r?`${r.origin} → ${r.destination}`:'Trajeto não encontrado'; }
function homeAction(page,icon,label,desc){return `<button class="quick-action" data-go="${page}"><span>${icon}</span><div><strong>${label}</strong><small>${desc}</small></div></button>`;}
function renderHome(){
  const manager=role==='gerente';
  const stats=manager?[stat('Trajetos cadastrados',db.routes.length,'Rotas da companhia'),stat('Aeronaves cadastradas',db.aircraft.length,'Frota registrada'),stat('Tripulantes cadastrados',db.crew.length,'Profissionais disponíveis')]:[stat('Voos cadastrados',db.flights.length,'Programações registradas'),stat('Voos confirmados',db.flights.filter(f=>f.status==='Confirmado').length,'Com validação concluída'),stat('Escalas registradas',db.flights.reduce((n,f)=>n+(f.crewIds||[]).length,0),'Alocações de tripulação')];
  const actions=manager?homeAction('trajetos','▤','Trajetos','Origem, destino e horários')+homeAction('aeronaves','✈','Aeronaves','Modelo, identificação e assentos')+homeAction('tripulacao','♙','Tripulação','Dados pessoais e cargo'):homeAction('criarVoo','＋','Criar voo','Associe trajeto, aeronave e equipe')+homeAction('voos','▤','Consultar voos','Veja os voos cadastrados')+homeAction('escalas','♙','Escalas','Consulte os profissionais alocados');
  const recents=manager?db.routes.slice(-4).reverse().map(r=>({name:`${r.origin} → ${r.destination}`,detail:`${r.departure} • ${r.arrival}`,tag:'Trajeto'})):db.flights.slice(-4).reverse().map(f=>({name:`Voo ${f.number}`,detail:`${routeName(f.routeId)} • ${dateBR(f.date)}`,tag:f.status||'Planejado'}));
  content.innerHTML=heading(manager?'ÁREA DO GERENTE':'ÁREA DO ADMINISTRADOR','Olá!','Gerencie as informações da companhia aérea Decolaê.')+`<section class="panel"><div class="panel-head"><div><h2>${manager?'Cadastros da companhia':'Gerenciamento de voos'}</h2><p>${manager?'Mantenha trajetos, aeronaves e profissionais atualizados.':'Organize os voos e confira as escalas da tripulação.'}</p></div></div><div class="stats-grid">${stats.join('')}</div><div class="quick-grid">${actions}</div></section><div class="dashboard-grid" style="margin-top:13px"><section class="panel"><div class="panel-head"><div><h2>${manager?'Trajetos cadastrados':'Voos recentes'}</h2><p>Registros mais recentes</p></div></div>${recents.length?recents.map(r=>`<div class="list-row"><div class="row-icon">${manager?'▤':'✈'}</div><div class="row-main"><strong>${esc(r.name)}</strong><small>${esc(r.detail)}</small></div><span class="status neutral">${esc(r.tag)}</span></div>`).join(''):'<div class="empty-state"><strong>Nenhum registro ainda</strong><span>Os dados cadastrados aparecerão aqui.</span></div>'}</section><section class="panel"><div class="panel-head"><div><h2>Orientação</h2><p>Sobre os dados do sistema</p></div></div><div class="notice">${manager?'Os dados cadastrados serão utilizados pelo Administrador na criação dos voos. Confira as informações antes de salvar alterações.':'Antes de confirmar um voo, confira a disponibilidade da aeronave e da tripulação.'}</div></section></div>`;
  content.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
}
const configs={
  trajetos:{key:'routes',singular:'trajeto',title:'Trajeto',fields:[['code','Código do trajeto','text','Ex.: TRJ-001'],['origin','Cidade de origem','text','Ex.: São João del-Rei'],['destination','Cidade de destino','text','Ex.: São Paulo'],['departure','Horário previsto de partida','time'],['arrival','Horário previsto de chegada','time']]},
  aeronaves:{key:'aircraft',singular:'aeronave',title:'Aeronave',fields:[['code','Código / identificação','text','Ex.: DEC-001'],['model','Modelo','text','Ex.: Airbus A320'],['seats','Número de assentos','number','Ex.: 180']]},
  tripulacao:{key:'crew',singular:'membro da tripulação',title:'membro da tripulação',fields:[['cpf','CPF','text','000.000.000-00'],['name','Nome completo','text','Nome do profissional'],['email','E-mail','email','email@exemplo.com'],['role','Cargo','select',['Piloto','Copiloto','Comissário']],['salary','Salário (R$)','number','0,00']]}
};
function listPage({kicker,h1,desc,button,headers,rows,empty,add}){
  content.innerHTML=heading(kicker,h1,desc,`<button class="btn btn-primary" id="addNew">＋ ${button}</button>`)+`<section class="table-card"><div class="table-toolbar"><div><h2>Registros cadastrados</h2><p>${rows.length} ${rows.length===1?'registro':'registros'}</p></div><div class="table-tools"><input id="tableSearch" class="search-input" placeholder="Buscar registros..." aria-label="Buscar registros"></div></div><div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}<th>AÇÕES</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.cells.map(c=>`<td>${c}</td>`).join('')}<td><div class="table-actions"><button class="icon-btn" title="Editar" data-edit="${r.id}">✎</button><button class="icon-btn" title="Excluir" data-delete="${r.id}">×</button></div></td></tr>`).join(''):`<tr><td colspan="${headers.length+1}"><div class="empty-state"><strong>${empty}</strong><span>Use o botão acima para adicionar um registro.</span></div></td></tr>`}</tbody></table></div></section>`;
  document.getElementById('addNew').onclick=()=>add(null);
  content.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>add(Number(b.dataset.edit)));
  content.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteRecord(Number(b.dataset.delete)));
  document.getElementById('tableSearch').oninput=e=>{const q=e.target.value.toLowerCase();content.querySelectorAll('tbody tr').forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?'':'none');};
}
function renderRoutes(){listPage({kicker:'ÁREA DO GERENTE',h1:'Trajetos',desc:'Cadastre e administre as rotas da companhia aérea.',button:'Cadastrar trajeto',headers:['CÓDIGO','ORIGEM','DESTINO','PARTIDA','CHEGADA'],empty:'Nenhum trajeto cadastrado',rows:db.routes.map(r=>({id:r.id,cells:[`<strong>${esc(r.code)}</strong>`,esc(r.origin),esc(r.destination),r.departure,r.arrival]})),add:id=>recordForm('trajetos',id)});}
function renderAircraft(){listPage({kicker:'ÁREA DO GERENTE',h1:'Aeronaves',desc:'Cadastre a identificação, o modelo e a capacidade das aeronaves.',button:'Cadastrar aeronave',headers:['CÓDIGO','MODELO','NÚMERO DE ASSENTOS'],empty:'Nenhuma aeronave cadastrada',rows:db.aircraft.map(a=>({id:a.id,cells:[`<strong>${esc(a.code)}</strong>`,esc(a.model),a.seats]})),add:id=>recordForm('aeronaves',id)});}
function renderCrew(){listPage({kicker:'ÁREA DO GERENTE',h1:'Tripulação',desc:'Cadastre os dados pessoais e profissionais dos membros da tripulação.',button:'Cadastrar membro',headers:['CPF','NOME','E-MAIL','CARGO','SALÁRIO'],empty:'Nenhum membro da tripulação cadastrado',rows:db.crew.map(c=>({id:c.id,cells:[esc(c.cpf),`<strong>${esc(c.name)}</strong>`,esc(c.email),esc(c.role),money(c.salary)]})),add:id=>recordForm('tripulacao',id)});}
function recordForm(type,id=null){
  const cfg=configs[type],list=db[cfg.key],item=id?list.find(x=>x.id===id):{};
  const fields=cfg.fields.map(([key,label,inputType,extra])=>`<div class="field"><label for="f_${key}">${label} *</label>${inputType==='select'?`<select id="f_${key}" required><option value="">Selecione</option>${extra.map(o=>`<option value="${o}" ${item[key]===o?'selected':''}>${o}</option>`).join('')}</select>`:`<input id="f_${key}" type="${inputType}" ${inputType==='number'?'min="0" step="0.01"':''} value="${esc(item[key]??'')}" placeholder="${extra||''}" required>`}</div>`).join('');
  content.innerHTML=heading('ÁREA DO GERENTE',`${id?'Editar':'Cadastro de'} ${cfg.title}`,'Informe os dados solicitados. Os campos marcados são obrigatórios.')+`<form class="form-card" id="recordForm"><h2 class="form-section-title">Dados ${type==='tripulacao'?'do profissional':`do ${cfg.singular}`}</h2><p class="form-hint">Preencha os campos abaixo para registrar as informações.</p><div class="form-grid">${fields}</div><div class="form-actions"><button type="button" class="btn btn-outline" id="cancel">Cancelar</button><button class="btn btn-primary" type="submit">Salvar ${cfg.singular}</button></div></form><div class="notice">${type==='trajetos'?'Após salvar, o trajeto poderá ser selecionado na criação de um voo.':type==='aeronaves'?'A capacidade cadastrada será utilizada para consultar a lotação dos voos.':'O cadastro utiliza os dados de Usuário e os atributos específicos de MembrosTripulacao.'}</div>`;
  document.getElementById('cancel').onclick=()=>go(type);
  document.getElementById('recordForm').onsubmit=e=>{e.preventDefault();const data={};cfg.fields.forEach(([k,,t])=>{const v=document.getElementById('f_'+k).value;data[k]=t==='number'?Number(v):v.trim();});
    if(type==='trajetos'&&data.origin.toLowerCase()===data.destination.toLowerCase()){toast('Origem e destino devem ser diferentes.',true);return;}
    if(type==='trajetos'&&data.arrival===data.departure){toast('Os horários de partida e chegada devem ser diferentes.',true);return;}
    if(type==='aeronaves'&&(!Number.isInteger(data.seats)||data.seats<1)){toast('Informe uma quantidade válida de assentos.',true);return;}
    if(type==='tripulacao'&&!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(data.cpf.replace(/\s/g,''))){toast('Confira o CPF informado.',true);return;}
    if(id)Object.assign(list.find(x=>x.id===id),data);else{data.id=nextId(list);list.push(data);}saveData();toast(id?'Cadastro atualizado.':'Cadastro realizado.');go(type);
  };
}
function deleteRecord(id){
  const type=currentPage,cfg=configs[type],item=db[cfg.key].find(x=>x.id===id);if(!item)return;
  if(type==='trajetos'&&db.flights.some(f=>Number(f.routeId)===id)){toast('Não é possível excluir: o trajeto está associado a um voo.',true);return;}
  if(type==='aeronaves'&&db.flights.some(f=>Number(f.aircraftId)===id)){toast('Não é possível excluir: a aeronave está associada a um voo.',true);return;}
  if(type==='tripulacao'&&db.flights.some(f=>(f.crewIds||[]).includes(id))){toast('Não é possível excluir: o profissional está escalado em um voo.',true);return;}
  confirmModal('Excluir cadastro?',`Deseja realmente excluir ${esc(item.name||item.code||item.cpf)}?`,()=>{db[cfg.key]=db[cfg.key].filter(x=>x.id!==id);saveData();toast('Cadastro excluído.');render();});
}
function confirmModal(h1,desc,action){const wrap=document.createElement('div');wrap.className='modal-backdrop';wrap.innerHTML=`<div class="modal"><h2>${h1}</h2><p>${desc}</p><div class="modal-actions"><button class="btn btn-outline" data-cancel>Cancelar</button><button class="btn btn-danger" data-ok>Excluir</button></div></div>`;document.body.appendChild(wrap);wrap.querySelector('[data-cancel]').onclick=()=>wrap.remove();wrap.querySelector('[data-ok]').onclick=()=>{action();wrap.remove();};}
function flightInterval(f){const r=db.routes.find(x=>x.id===Number(f.routeId));if(!r)return null;const start=new Date(`${f.date}T${r.departure}:00`);let end=new Date(`${f.date}T${r.arrival}:00`);if(r.arrival<r.departure)end.setDate(end.getDate()+1);return {start,end,route:r};}
function validateFlight(f,ignoreId=null){
  const issues=[];const route=db.routes.find(x=>x.id===Number(f.routeId));const aircraft=db.aircraft.find(x=>x.id===Number(f.aircraftId));
  if(!f.number?.trim())issues.push('Informe o número do voo.');if(!f.date)issues.push('Informe a data do voo.');if(!route)issues.push('Selecione um trajeto cadastrado.');if(!aircraft)issues.push('Selecione uma aeronave cadastrada.');
  const ids=(f.crewIds||[]).map(Number).filter(Boolean),people=ids.map(id=>db.crew.find(c=>c.id===id)).filter(Boolean);
  if(people.filter(p=>p.role==='Piloto').length<1)issues.push('O voo precisa de pelo menos 1 piloto.');
  if(people.filter(p=>p.role==='Copiloto').length<1)issues.push('O voo precisa de pelo menos 1 copiloto.');
  if(people.filter(p=>p.role==='Comissário').length<2)issues.push('O voo precisa de pelo menos 2 comissários de bordo.');
  if(new Set(ids).size!==ids.length)issues.push('Um mesmo profissional foi selecionado mais de uma vez.');
  const current=flightInterval(f);
  if(current){for(const other of db.flights.filter(x=>x.id!==ignoreId)){
    const previous=flightInterval(other);if(!previous||other.date!==f.date)continue;
    const overlap=current.start<previous.end&&current.end>previous.start;
    if(Number(other.aircraftId)===Number(f.aircraftId)&&overlap)issues.push(`A aeronave selecionada já está alocada no voo ${other.number} em horário sobreposto.`);
    const shared=ids.filter(id=>(other.crewIds||[]).map(Number).includes(id));
    shared.forEach(id=>{const person=db.crew.find(p=>p.id===id);issues.push(`${person?.name||'Um tripulante'} já está escalado em outro voo na mesma data.`);});
  }}
  return [...new Set(issues)];
}
function flightForm(id=null){
  const f=id?db.flights.find(x=>x.id===id):{};if(!f) return;
  const crewSelected=f.crewIds||[];
  const option=(list,selected,format)=>`<option value="">Selecione ${list==='routes'?'um trajeto':list==='aircraft'?'uma aeronave':'um profissional'}</option>`+(db[list]||[]).map(x=>`<option value="${x.id}" ${Number(selected)===x.id?'selected':''}>${format(x)}</option>`).join('');
  content.innerHTML=heading('ÁREA DO ADMINISTRADOR',id?'Editar voo':'Criar novo voo','Associe um trajeto, uma aeronave e os profissionais escalados.')+`<form class="form-card" id="flightForm"><div class="form-grid"><div class="field"><label for="f_number">Número do voo *</label><input id="f_number" required placeholder="Identificador do voo" value="${esc(f.number||'')}"></div><div class="field"><label for="f_date">Data do voo *</label><input id="f_date" type="date" required value="${esc(f.date||'')}"></div><div class="field"><label for="f_route">Trajeto *</label><select id="f_route" required>${option('routes',f.routeId,r=>`${r.code} — ${r.origin} → ${r.destination} (${r.departure}–${r.arrival})`)}</select></div><div class="field"><label for="f_aircraft">Aeronave *</label><select id="f_aircraft" required>${option('aircraft',f.aircraftId,a=>`${a.code} — ${a.model} (${a.seats} assentos)`)}</select></div></div><div class="slot-grid" style="margin-top:17px"><div><h2 class="form-section-title">Escala da tripulação</h2><p class="form-hint">Selecione os profissionais que participarão do voo.</p><div class="field"><label for="crew_pilot">Piloto *</label><select id="crew_pilot"><option value="">Selecione um profissional</option>${db.crew.filter(c=>c.role==='Piloto').map(c=>`<option value="${c.id}" ${crewSelected.includes(c.id)?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="field" style="margin-top:10px"><label for="crew_copilot">Copiloto *</label><select id="crew_copilot"><option value="">Selecione um profissional</option>${db.crew.filter(c=>c.role==='Copiloto').map(c=>`<option value="${c.id}" ${crewSelected.includes(c.id)?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="field" style="margin-top:10px"><label for="crew_attendant1">Comissário 1 *</label><select id="crew_attendant1"><option value="">Selecione um profissional</option>${db.crew.filter(c=>c.role==='Comissário').map(c=>`<option value="${c.id}" ${crewSelected.includes(c.id)?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="field" style="margin-top:10px"><label for="crew_attendant2">Comissário 2 *</label><select id="crew_attendant2"><option value="">Selecione um profissional</option>${db.crew.filter(c=>c.role==='Comissário').map(c=>`<option value="${c.id}" ${crewSelected.includes(c.id)?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div></div><div><h2 class="form-section-title">Profissionais adicionais</h2><p class="form-hint">Opcional: adicione outros membros à escala.</p><div class="check-grid">${db.crew.map(c=>`<label class="check-option"><input type="checkbox" name="extraCrew" value="${c.id}" ${crewSelected.includes(c.id)?'checked':''}>${esc(c.name)} — ${esc(c.role)}</label>`).join('')||'<span class="form-hint">Cadastre profissionais antes de criar um voo.</span>'}</div></div></div><div class="notice">Composição mínima exigida: 1 piloto, 1 copiloto e 2 comissários de bordo. A verificação também considera a disponibilidade da aeronave e da tripulação.</div><div class="form-actions"><button type="button" class="btn btn-outline" id="cancelFlight">Cancelar</button><button type="submit" class="btn btn-primary">Validar e salvar</button></div></form>`;
  const idsFromForm=()=>[...new Set(['crew_pilot','crew_copilot','crew_attendant1','crew_attendant2'].map(k=>Number(document.getElementById(k).value)).filter(Boolean).concat([...document.querySelectorAll('[name="extraCrew"]:checked')].map(x=>Number(x.value))))];
  document.getElementById('cancelFlight').onclick=()=>go('voos');
  document.getElementById('flightForm').onsubmit=e=>{e.preventDefault();const data={id,number:document.getElementById('f_number').value.trim(),date:document.getElementById('f_date').value,routeId:Number(document.getElementById('f_route').value),aircraftId:Number(document.getElementById('f_aircraft').value),crewIds:idsFromForm()};const issues=validateFlight(data,id);if(issues.length){pendingFlight={...data,issues};go('verificacao');return;}data.status='Confirmado';if(id)Object.assign(db.flights.find(x=>x.id===id),data);else{data.id=nextId(db.flights);db.flights.push(data);}saveData();toast('Voo validado e salvo com sucesso.');go('voos');};
}
function renderVerification(){
  const p=pendingFlight;const issues=p?.issues||['Não há uma verificação pendente.'];
  content.innerHTML=heading('ÁREA DO ADMINISTRADOR','Verificação do voo','O sistema encontrou condições que precisam ser corrigidas.')+`<div class="notice error"><strong>Não foi possível salvar o voo.</strong><br>Revise os conflitos indicados abaixo e tente novamente.</div><section class="validation-box"><h3>Pendências identificadas</h3>${issues.map((x,i)=>`<div class="validation-item"><span class="validation-tag">${i===0?'CONFLITO':'PENDÊNCIA'}</span><span>${esc(x)}</span></div>`).join('')}</section><div class="notice">A validação considera a composição mínima da tripulação, os horários dos voos e a disponibilidade dos profissionais e aeronaves.</div><div class="form-actions"><button class="btn btn-primary" id="backEdit">Voltar e corrigir</button><button class="btn btn-outline" id="cancelVerify">Cancelar</button></div>`;
  document.getElementById('backEdit').onclick=()=>{const data=p;if(!data){go('criarVoo');return;}flightForm(data.id||null);document.getElementById('f_number').value=data.number||'';document.getElementById('f_date').value=data.date||'';document.getElementById('f_route').value=data.routeId||'';document.getElementById('f_aircraft').value=data.aircraftId||'';const selected=data.crewIds||[];const take=(role,used)=>selected.find(id=>{const person=db.crew.find(c=>c.id===id);return person?.role===role&&!used.includes(id);});const used=[];for(const [roleName,key] of [['Piloto','crew_pilot'],['Copiloto','crew_copilot'],['Comissário','crew_attendant1'],['Comissário','crew_attendant2']]){const id=take(roleName,used);if(id){document.getElementById(key).value=id;used.push(id);}}document.querySelectorAll('[name="extraCrew"]').forEach(x=>x.checked=selected.includes(Number(x.value))&&!used.includes(Number(x.value)));};
  document.getElementById('cancelVerify').onclick=()=>go('voos');
}
function renderFlights(){
  const rows=db.flights.map(f=>{const r=db.routes.find(x=>x.id===Number(f.routeId)),a=db.aircraft.find(x=>x.id===Number(f.aircraftId));return {id:f.id,cells:[`<strong>${esc(f.number)}</strong>`,r?`${esc(r.origin)} → ${esc(r.destination)}`:'—',dateBR(f.date),r?.departure||'—',a?esc(a.code):'—',`<span class="status ${f.status==='Confirmado'?'':'warning'}">${esc(f.status||'Planejado')}</span>`]};});
  listPage({kicker:'ÁREA DO ADMINISTRADOR',h1:'Voos',desc:'Consulte e administre os voos cadastrados.',button:'Criar voo',headers:['NÚMERO','TRAJETO','DATA','PARTIDA','AERONAVE','STATUS'],empty:'Nenhum voo cadastrado',rows,add:id=>flightForm(id)});
  content.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>confirmModal('Excluir voo?','Deseja realmente excluir esta programação?',()=>{db.flights=db.flights.filter(f=>f.id!==Number(b.dataset.delete));saveData();render();}));
}
function renderScales(){
  const rows=[];db.flights.forEach(f=>{(f.crewIds||[]).forEach(id=>{const c=db.crew.find(x=>x.id===Number(id));if(c)rows.push({flight:f,person:c});});});
  content.innerHTML=heading('ÁREA DO ADMINISTRADOR','Escalas','Consulte os membros da tripulação associados a cada voo.')+`<section class="table-card"><div class="table-toolbar"><div><h2>Tripulantes escalados</h2><p>${rows.length} alocações registradas</p></div></div><div class="table-wrap"><table><thead><tr><th>VOO</th><th>DATA</th><th>TRAJETO</th><th>PROFISSIONAL</th><th>CARGO</th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td><strong>${esc(x.flight.number)}</strong></td><td>${dateBR(x.flight.date)}</td><td>${esc(routeName(x.flight.routeId))}</td><td>${esc(x.person.name)}</td><td>${esc(x.person.role)}</td></tr>`).join(''):'<tr><td colspan="5"><div class="empty-state"><strong>Nenhuma escala registrada</strong><span>As escalas aparecerão após o cadastro dos voos.</span></div></td></tr>'}</tbody></table></div></section>`;
}
function toast(msg,error=false){const el=document.createElement('div');el.className='toast'+(error?' error':'');el.textContent=msg;document.getElementById('toastRegion').appendChild(el);setTimeout(()=>el.remove(),3000);}
document.getElementById('roleSelect').onchange=e=>{role=e.target.value;currentPage='inicio';render();};
document.getElementById('menuToggle').onclick=()=>document.getElementById('sidebar').classList.toggle('open');
render();
