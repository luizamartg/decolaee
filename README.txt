DECOLAÊ — FRONT-END PARA TESTES

O QUE FOI FEITO
Protótipo funcional das áreas de Gerente e Administrador, desenvolvido com HTML, CSS e JavaScript. A organização visual e os fluxos foram baseados nas telas do relatório do Decolaê e nos wireframes criados no Penpot para Pessoa 4.

COMO EXECUTAR
1. Extraia o arquivo ZIP para uma pasta do computador.
2. Abra a pasta "decolae_frontend".
3. Dê dois cliques no arquivo "index.html". O sistema abrirá no navegador.
4. Use o seletor "Perfil de acesso" no menu lateral para alternar entre Gerente e Administrador.

TELAS E FUNCIONALIDADES
GERENTE
- Início / visão geral.
- Trajetos: cadastrar, consultar, pesquisar, editar e excluir. Campos: código do trajeto, cidade de origem, cidade de destino, horário previsto de partida e horário previsto de chegada.
- Aeronaves: cadastrar, consultar, pesquisar, editar e excluir. Campos: código/identificação, modelo e número de assentos.
- Tripulação: cadastrar, consultar, pesquisar, editar e excluir. Campos: CPF, nome completo, e-mail, cargo (Piloto, Copiloto ou Comissário) e salário.

ADMINISTRADOR
- Início / visão geral.
- Criar voo: informar número e data do voo, selecionar trajeto e aeronave e montar a escala com piloto, copiloto e pelo menos dois comissários. É possível adicionar outros profissionais.
- Validação do voo: quando há pendências, o sistema mostra os problemas e permite voltar ao formulário para corrigir.
- Voos: consultar, pesquisar, editar e excluir voos cadastrados.
- Escalas: consultar os profissionais associados aos voos.

REGRAS IMPLEMENTADAS NO PROTÓTIPO
- A composição mínima da tripulação é de 1 piloto, 1 copiloto e 2 comissários.
- A mesma aeronave não pode ser alocada em voos com horários sobrepostos na mesma data.
- Um tripulante não pode ser escalado para dois voos na mesma data, conforme a regra descrita no relatório.
- Origem e destino de um trajeto devem ser diferentes.
- Não é permitido excluir trajeto, aeronave ou tripulante que já esteja associado a um voo.

RESPONSIVIDADE
O layout se adapta a telas menores. No celular, o menu lateral pode ser aberto pelo botão no topo e os formulários passam a ser organizados em uma coluna.

IMPORTANTE — LIMITAÇÕES
- Este projeto é somente front-end. Não possui servidor, API nem conexão com o PostgreSQL do grupo.
- Os registros ficam salvos no Local Storage do navegador e computador em que forem cadastrados. Eles não são compartilhados com os demais integrantes do grupo.
- Para o grupo testar em outro computador, envie o ZIP. Cada pessoa poderá cadastrar seus próprios dados de teste.
- A regra de lotação de passagens pertence ao fluxo do Cliente e ao banco de dados; não foi implementada nesta parte de Gerente/Administrador.
- O relatório descreve a proibição de tripulante em dois voos na mesma data. Por isso, o protótipo aplica essa regra, sem adicionar um intervalo de descanso de 36 horas.
- A integração futura deverá substituir o armazenamento local por chamadas à API que o grupo definir.

COMO COMEÇAR UM TESTE DO ZERO
O projeto já inicia sem trajetos, aeronaves, tripulantes ou voos cadastrados. Para apagar dados de testes anteriores, limpe os dados do site no navegador ou remova a chave "decolae_frontend_penpot_v3" no Local Storage.

ARQUIVOS
- index.html: estrutura da aplicação.
- styles.css: aparência e adaptação para celular.
- app.js: navegação, formulários, armazenamento local e validações.
- README.txt: estas instruções.
