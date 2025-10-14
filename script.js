/* =====================================================
   IARA GAMES — script.js (versão final)
   Funções de acessibilidade + interatividade
   ===================================================== */

// Quando o site carregar completamente
document.addEventListener('DOMContentLoaded', () => {
  /* --- Atualiza o ano automaticamente no rodapé --- */
  const anoEl = document.querySelectorAll('[data-ano]');
  const anoAtual = new Date().getFullYear();
  anoEl.forEach(el => el.textContent = anoAtual);

  /* --- Carrega preferências salvas --- */
  const contrasteSalvo = localStorage.getItem('contraste') === 'true';
  const fonteSalva = localStorage.getItem('fonte') === 'true';

  const chkContraste = document.getElementById('alto-contraste');
  const chkFonte = document.getElementById('grande-fonte');

  // Aplica preferências existentes
  if (contrasteSalvo) document.body.classList.add('alto-contraste');
  if (fonteSalva) document.body.classList.add('fonte-maior');

  if (chkContraste) chkContraste.checked = contrasteSalvo;
  if (chkFonte) chkFonte.checked = fonteSalva;

  /* --- Observa mudanças nos botões de acessibilidade --- */
  if (chkContraste) {
    chkContraste.addEventListener('change', () => {
      const ativo = chkContraste.checked;
      document.body.classList.toggle('alto-contraste', ativo);
      localStorage.setItem('contraste', ativo);
    });
  }

  if (chkFonte) {
    chkFonte.addEventListener('change', () => {
      const ativo = chkFonte.checked;
      document.body.classList.toggle('fonte-maior', ativo);
      localStorage.setItem('fonte', ativo);
    });
  }

  /* =====================================================
     Validação acessível do formulário de cadastro
     ===================================================== */
  const form = document.getElementById('cadastroForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const nome = document.getElementById('nome');
      const email = document.getElementById('email');
      const senha = document.getElementById('senha');
      const msgErro = document.createElement('p');
      msgErro.id = 'msgCadastro';
      msgErro.setAttribute('role', 'alert');
      msgErro.style.marginTop = '10px';
      msgErro.style.fontWeight = '600';

      // Remove mensagens anteriores
      const msgExistente = form.querySelector('#msgCadastro');
      if (msgExistente) msgExistente.remove();
      form.appendChild(msgErro);

      if (!nome.value.trim() || !email.value.trim() || !senha.value.trim()) {
        msgErro.textContent = 'Por favor, preencha todos os campos obrigatórios.';
        msgErro.style.color = '#ff5555';
        return;
      }

      if (!email.value.includes('@')) {
        msgErro.textContent = 'Digite um e-mail válido.';
        msgErro.style.color = '#ff5555';
        return;
      }

      if (senha.value.length < 6) {
        msgErro.textContent = 'A senha deve ter no mínimo 6 caracteres.';
        msgErro.style.color = '#ff5555';
        return;
      }

      // Caso tudo esteja ok
      msgErro.textContent = 'Cadastro realizado com sucesso!';
      msgErro.style.color = '#00ff99';
      form.reset();
      localStorage.removeItem('contraste');
      localStorage.removeItem('fonte');
    });
  }
});

