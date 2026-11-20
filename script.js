const formularioCadastro = document.getElementById("formCadastro");

if (formularioCadastro) {
    formularioCadastro.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const telefone = document.getElementById("telefone").value;

        const mensagem = document.getElementById("mensagem");

        try {
            const resposta = await fetch("/usuarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome,
                    email,
                    senha,
                    telefone
                })
            });

            const resultado = await resposta.json();

            mensagem.textContent = resultado.mensagem;

            if (resposta.ok) {
                mensagem.style.color = "green";
                formularioCadastro.reset();
            } else {
                mensagem.style.color = "red";
            }

        } catch (erro) {
            mensagem.textContent = "Não foi possível conectar ao servidor.";
            mensagem.style.color = "red";
            console.error(erro);
        }
    });
}
// LOGIN DE USUÁRIO
const formularioLogin = document.getElementById("formLogin");

if (formularioLogin) {
    formularioLogin.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const mensagem = document.getElementById("mensagem");

        try {
            const resposta = await fetch("/usuarios/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const resultado = await resposta.json();

            mensagem.textContent = resultado.mensagem;

            if (resposta.ok) {
                mensagem.style.color = "green";
                sessionStorage.setItem(
                    "usuario",
                    JSON.stringify(resultado.usuario)
                );
                window.location.href = "index.html";
            } else {
                mensagem.style.color = "red";
            }

        } catch (erro) {
            mensagem.textContent = "Não foi possível conectar ao servidor.";
            mensagem.style.color = "red";
            console.error(erro);
        }
    });
}
// CONSULTAR E PESQUISAR MÉDICOS
const listaMedicos = document.getElementById("listaMedicos");
const formularioPesquisaMedicos = document.getElementById("formPesquisaMedicos");

if (listaMedicos) {

    let medicosCadastrados = [];

    async function carregarMedicos() {
        try {
            const resposta = await fetch("/medicos");

            if (!resposta.ok) {
                throw new Error("Erro ao consultar médicos.");
            }

            medicosCadastrados = await resposta.json();

            mostrarMedicos(medicosCadastrados);

        } catch (erro) {
            listaMedicos.textContent = "Não foi possível carregar os médicos.";
            console.error(erro);
        }
    }

    function mostrarMedicos(medicos) {
        listaMedicos.innerHTML = "";

        if (medicos.length === 0) {
            listaMedicos.textContent = "Nenhum médico encontrado.";
            return;
        }

        medicos.forEach((medico) => {
            const paragrafo = document.createElement("p");

            paragrafo.textContent =
                medico.nome + " - " + medico.especialidade;

            listaMedicos.appendChild(paragrafo);
        });
    }

    if (formularioPesquisaMedicos) {
        formularioPesquisaMedicos.addEventListener("submit", (event) => {
            event.preventDefault();

            const especialidade = document
                .getElementById("especialidade")
                .value
                .trim()
                .toLowerCase();

            const resultado = medicosCadastrados.filter((medico) =>
                medico.especialidade.toLowerCase().includes(especialidade)
            );

            mostrarMedicos(resultado);
        });
    }

    carregarMedicos();
}
// MINHAS CONSULTAS
const listaConsultas = document.getElementById("listaConsultas");
const mensagemConsultas = document.getElementById("mensagemConsultas");

if (listaConsultas) {
    async function carregarMinhasConsultas() {
        const usuarioSalvo = sessionStorage.getItem("usuario");

        if (!usuarioSalvo) {
            listaConsultas.textContent = "Faça login para visualizar suas consultas.";
            return;
        }

        const usuario = JSON.parse(usuarioSalvo);

        try {
            const resposta = await fetch("/consultas");

            if (!resposta.ok) {
                throw new Error("Erro ao buscar consultas.");
            }

            const todasConsultas = await resposta.json();

            const minhasConsultas = todasConsultas.filter(
                consulta => consulta.usuarioId === usuario.id
            );

            listaConsultas.innerHTML = "";

            if (minhasConsultas.length === 0) {
                listaConsultas.textContent = "Você ainda não possui consultas.";
                return;
            }

            minhasConsultas.forEach(consulta => {
                const div = document.createElement("div");

                const data = new Date(consulta.horario.data);
                const dataFormatada = data.toLocaleDateString("pt-BR");
                const horarioFormatado = data.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                });

                const titulo = document.createElement("h3");
                titulo.textContent = "Consulta";

                const medico = document.createElement("p");
                medico.textContent = "Médico: " + consulta.medico.nome;

                const especialidade = document.createElement("p");
                especialidade.textContent =
                    "Especialidade: " + consulta.medico.especialidade;

                const dataTexto = document.createElement("p");
                dataTexto.textContent = "Data: " + dataFormatada;

                const horarioTexto = document.createElement("p");
                horarioTexto.textContent = "Horário: " + horarioFormatado;

                const status = document.createElement("p");
                status.textContent = "Status: " + consulta.status;

                div.append(
                    titulo,
                    medico,
                    especialidade,
                    dataTexto,
                    horarioTexto,
                    status
                );

                if (consulta.status !== "cancelada") {
                    const botao = document.createElement("button");
                    botao.textContent = "Cancelar consulta";

                    botao.addEventListener("click", async () => {
                        const confirmar = window.confirm(
                            "Deseja realmente cancelar esta consulta?"
                        );

                        if (!confirmar) return;

                        try {
                            const cancelamento = await fetch(
                                `/consultas/${consulta.id}/cancelar`,
                                { method: "PUT" }
                            );

                            const resultado = await cancelamento.json();

                            mensagemConsultas.textContent = resultado.mensagem;

                            if (cancelamento.ok) {
                                carregarMinhasConsultas();
                            }
                        } catch (erro) {
                            mensagemConsultas.textContent =
                                "Não foi possível cancelar a consulta.";
                        }
                    });

                    div.appendChild(botao);
                }

                listaConsultas.appendChild(div);
            });

        } catch (erro) {
            listaConsultas.textContent =
                "Não foi possível carregar suas consultas.";
            console.error(erro);
        }
    }

    carregarMinhasConsultas();
}
// AGENDAMENTO DE CONSULTAS
const formularioAgendamento = document.getElementById("formAgendamento");

if (formularioAgendamento) {
    const campoMedico = document.getElementById("medico");
    const campoHorario = document.getElementById("horario");
    const mensagemAgendamento = document.getElementById("mensagemAgendamento");

    let medicosDisponiveis = [];
    let horariosDisponiveis = [];

    async function carregarOpcoesAgendamento() {
        try {
            const [respostaMedicos, respostaHorarios] = await Promise.all([
                fetch("/medicos"),
                fetch("/horarios")
            ]);

            if (!respostaMedicos.ok || !respostaHorarios.ok) {
                throw new Error("Erro ao carregar médicos ou horários.");
            }

            medicosDisponiveis = await respostaMedicos.json();
            horariosDisponiveis = await respostaHorarios.json();

            campoMedico.innerHTML = '<option value="">Selecione um médico</option>';

            const idsMedicosComHorario = [
                ...new Set(horariosDisponiveis.map(horario => horario.medicoId))
            ];

            medicosDisponiveis
                .filter(medico => idsMedicosComHorario.includes(medico.id))
                .forEach(medico => {
                    const opcao = document.createElement("option");
                    opcao.value = medico.id;
                    opcao.textContent = medico.nome + " - " + medico.especialidade;
                    campoMedico.appendChild(opcao);
                });

            if (idsMedicosComHorario.length === 0) {
                campoMedico.innerHTML = '<option value="">Nenhum médico com horário disponível</option>';
            }

        } catch (erro) {
            mensagemAgendamento.textContent = "Não foi possível carregar as opções.";
            console.error(erro);
        }
    }

    campoMedico.addEventListener("change", () => {
        const medicoId = campoMedico.value;

        campoHorario.innerHTML = '<option value="">Selecione um horário</option>';

        const horariosDoMedico = horariosDisponiveis.filter(
            horario => horario.medicoId === medicoId
        );

        horariosDoMedico.forEach(horario => {
            const data = new Date(horario.data);

            const opcao = document.createElement("option");
            opcao.value = horario.id;
            opcao.textContent = data.toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short"
            });

            campoHorario.appendChild(opcao);
        });

        if (horariosDoMedico.length === 0) {
            campoHorario.innerHTML = '<option value="">Nenhum horário disponível</option>';
        }
    });

    formularioAgendamento.addEventListener("submit", async (event) => {
        event.preventDefault();

        const usuarioSalvo = sessionStorage.getItem("usuario");

        if (!usuarioSalvo) {
            mensagemAgendamento.textContent = "Faça login antes de agendar.";
            return;
        }

        const usuario = JSON.parse(usuarioSalvo);

        if (!campoMedico.value || !campoHorario.value) {
            mensagemAgendamento.textContent = "Selecione o médico e o horário.";
            return;
        }

        try {
            const resposta = await fetch("/consultas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuarioId: usuario.id,
                    medicoId: campoMedico.value,
                    horarioId: campoHorario.value
                })
            });

            const resultado = await resposta.json();

            mensagemAgendamento.textContent = resultado.mensagem;

            if (resposta.ok) {
                mensagemAgendamento.style.color = "green";
                formularioAgendamento.reset();
                campoHorario.innerHTML = '<option value="">Selecione um médico primeiro</option>';
                await carregarOpcoesAgendamento();
            } else {
                mensagemAgendamento.style.color = "red";
            }

        } catch (erro) {
            mensagemAgendamento.textContent = "Não foi possível realizar o agendamento.";
            mensagemAgendamento.style.color = "red";
            console.error(erro);
        }
    });

    carregarOpcoesAgendamento();
}// CADASTRO DE MÉDICOS
const formularioCadastroMedico = document.getElementById("formCadastroMedico");

if (formularioCadastroMedico) {
    formularioCadastroMedico.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nome = document.getElementById("nomeMedico").value.trim();
        const especialidade = document.getElementById("especialidadeMedico").value.trim();
        const crm = document.getElementById("crmMedico").value.trim();
        const mensagem = document.getElementById("mensagemMedico");

        try {
            const resposta = await fetch("/medicos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nome, especialidade, crm })
            });

            const resultado = await resposta.json();

            mensagem.textContent = resultado.mensagem;

            if (resposta.ok) {
                mensagem.style.color = "green";
                formularioCadastroMedico.reset();
            } else {
                mensagem.style.color = "red";
            }
        } catch (erro) {
            mensagem.textContent = "Não foi possível conectar ao servidor.";
            mensagem.style.color = "red";
            console.error(erro);
        }
    });
}
