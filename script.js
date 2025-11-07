document.addEventListener('DOMContentLoaded', () => {
  /* Atualiza ano no rodapé */
  document.querySelectorAll('[data-ano]').forEach(el => el.textContent = new Date().getFullYear());

  /* Preferências salvas */
  const contrasteSalvo = localStorage.getItem('contraste') === 'true';
  const fonteSalva = localStorage.getItem('fonte') === 'true';

  const chkContraste = document.getElementById('alto-contraste');
  const chkFonte = document.getElementById('grande-fonte');

  if (contrasteSalvo) document.body.classList.add('alto-contraste');
  if (fonteSalva) document.body.classList.add('fonte-maior');

  if (chkContraste) chkContraste.checked = contrasteSalvo;
  if (chkFonte) chkFonte.checked = fonteSalva;

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

  /* Validação do formulário de cadastro (se existir) */
  const form = document.getElementById('cadastroForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nome = document.getElementById('nome');
      const email = document.getElementById('email');
      const senha = document.getElementById('senha');

      let erros = [];
      if (!nome.value.trim()) erros.push('Por favor, informe seu nome completo.');
      if (!email.value.trim() || !email.value.includes('@')) erros.push('Digite um e-mail válido.');
      if (!senha.value || senha.value.length < 6) erros.push('A senha deve ter no mínimo 6 caracteres.');

      let msg = document.getElementById('msgCadastro');
      if (!msg) {
        msg = document.createElement('p');
        msg.id = 'msgCadastro';
        msg.setAttribute('aria-live','polite');
        msg.className = 'mt-2 fw-semibold';
        form.appendChild(msg);
      }

      if (erros.length) {
        msg.textContent = erros.join(' ');
        msg.classList.remove('text-success');
        msg.classList.add('text-danger');
        return;
      }

      msg.textContent = 'Cadastro realizado com sucesso!';
      msg.classList.remove('text-danger');
      msg.classList.add('text-success');
      form.reset();
    });
  }
});

