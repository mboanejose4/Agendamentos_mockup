<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import MobileCarousel from "@/components/shared/ui/MobileCarousel.vue";

/* Secções informativas por baixo da lista de estabelecimentos. Explicam a
   plataforma a quem chega pela primeira vez e encaminham os donos de negócio
   para o registo de empresa. */
const emit = defineEmits<{
  (event: "register"): void;
}>();

const benefits: { icon: string; title: string; body: string }[] = [
  {
    icon: "clock",
    title: "Horários que existem mesmo",
    body: "A disponibilidade tem em conta a duração do serviço, o turno do profissional e a sala ou mesa necessária. O que aparece livre está livre.",
  },
  {
    icon: "bell",
    title: "Lembretes antes do dia",
    body: "Confirmação imediata e aviso na véspera, para que ninguém se esqueça — nem o cliente, nem o estabelecimento.",
  },
  {
    icon: "refresh-cw",
    title: "Cancele ou reagende",
    body: "Cada estabelecimento define a antecedência mínima. Dentro desse prazo, muda a marcação sozinho, sem ligar para ninguém.",
  },
  {
    icon: "wallet",
    title: "Pague como preferir",
    body: "No local, no fim do atendimento, ou já no momento da marcação por M-Pesa ou e-Mola.",
  },
];

const payments: { icon: string; name: string; note: string }[] = [
  { icon: "wallet", name: "M-Pesa", note: "Carteira móvel" },
  { icon: "wallet", name: "e-Mola", note: "Carteira móvel" },
  { icon: "receipt", name: "No local", note: "No fim do atendimento" },
];

/* Conteúdo ilustrativo da demonstração: pessoas e citações são fictícias. */
const testimonials: { quote: string; name: string; role: string }[] = [
  {
    quote:
      "Marcava por chamada e perdia metade das vezes. Agora escolho a hora à noite, quando finalmente tenho um minuto.",
    name: "Célia M.",
    role: "Cliente, Maputo",
  },
  {
    quote:
      "As faltas caíram muito desde que o lembrete passou a sair sozinho na véspera. A agenda deixou de ter buracos.",
    name: "Jorge N.",
    role: "Gestor de salão, Matola",
  },
  {
    quote:
      "Vejo o meu turno do telemóvel e sei logo quem vem a seguir. Não preciso de estar a perguntar à recepção.",
    name: "Aida T.",
    role: "Profissional, Beira",
  },
];

const ownerPoints: string[] = [
  "Agenda partilhada por toda a equipa, com salas, mesas e equipamentos",
  "Ficha de cliente com histórico de atendimentos e contactos",
  "Promoções com código de desconto e validade",
  "Relatórios de receita e exportação para folha de cálculo",
];

const questions: { question: string; answer: string }[] = [
  {
    question: "Preciso de criar conta para marcar?",
    answer:
      "Pode explorar estabelecimentos, ver serviços e preços sem conta nenhuma. A conta só é pedida no momento de confirmar a marcação, para que possa depois consultá-la, reagendar ou cancelar.",
  },
  {
    question: "Quanto custa usar o MarcaFácil?",
    answer:
      "Para quem marca, nada. Paga apenas o serviço que contratou, ao estabelecimento.",
  },
  {
    question: "Posso cancelar ou mudar a hora?",
    answer:
      "Pode, até ao prazo definido por cada estabelecimento — normalmente algumas horas antes. O prazo está indicado na página do estabelecimento e no resumo da marcação.",
  },
  {
    question: "Como pago?",
    answer:
      "Depende do estabelecimento. Uns aceitam apenas pagamento no local, no fim do atendimento; outros permitem pagar na hora da marcação por carteira móvel ou cartão.",
  },
  {
    question: "E se eu faltar?",
    answer:
      "A marcação fica registada como falta no seu histórico e no do estabelecimento. As condições de reembolso de um pagamento já feito são as de cada estabelecimento.",
  },
  {
    question: "Trabalho por conta própria. Também posso usar?",
    answer:
      "Sim. Um profissional independente regista-se como estabelecimento, define os seus serviços e o seu horário, e passa a receber marcações como qualquer outro.",
  },
];
</script>
<template>
  <div class="mt-[46px] flex flex-col gap-[46px] sm:mt-14 sm:gap-14">
    <!-- Vantagens ------------------------------------------------------- -->
    <section aria-labelledby="vantagens-titulo">
      <span class="eyebrow">PORQUÊ O MARCAFÁCIL</span>
      <h2 id="vantagens-titulo" class="text-h2">
        Marcar devia ser a parte fácil.
      </h2>
      <p class="mt-2 max-w-[560px] text-caption text-muted">
        O que a plataforma resolve, do lado de quem marca e de quem atende.
      </p>
      <MobileCarousel
        class="mt-[26px]"
        label="Vantagens da plataforma"
        grid-class="sm:grid-cols-2 xl:grid-cols-4"
      >
        <div
          v-for="item in benefits"
          :key="item.title"
          class="card flex flex-col gap-3 p-[22px]"
        >
          <span
            class="inline-grid size-[42px] shrink-0 place-items-center rounded-xl bg-soft text-primary-text"
            ><AppIcon :name="item.icon" :size="21"
          /></span>
          <h3 class="text-body font-medium">{{ item.title }}</h3>
          <p class="text-caption text-muted">{{ item.body }}</p>
        </div>
      </MobileCarousel>
    </section>

    <!-- Formas de pagamento --------------------------------------------- -->
    <section aria-labelledby="pagamentos-titulo">
      <span class="eyebrow">PAGAMENTOS</span>
      <h2 id="pagamentos-titulo" class="text-h2">
        As formas de pagamento que já usa.
      </h2>
      <p class="mt-2 max-w-[600px] text-caption text-muted">
        Cada estabelecimento escolhe o que aceita. Vê sempre as opções
        disponíveis antes de confirmar a marcação — nunca depois.
      </p>
      <ul class="mt-[26px] flex flex-wrap gap-3">
        <li
          v-for="item in payments"
          :key="item.name"
          class="card flex items-center gap-3 px-[18px] py-3"
        >
          <span class="text-primary-text"
            ><AppIcon :name="item.icon" :size="19"
          /></span>
          <span>
            <strong class="block text-caption font-medium">{{
              item.name
            }}</strong>
            <small class="block text-caption text-muted">{{ item.note }}</small>
          </span>
        </li>
      </ul>
    </section>

    <!-- Testemunhos ------------------------------------------------------ -->
    <section aria-labelledby="testemunhos-titulo">
      <span class="eyebrow">TESTEMUNHOS</span>
      <h2 id="testemunhos-titulo" class="text-h2">Quem já usa, conta.</h2>
      <p class="mt-2 text-caption text-muted">
        <AppIcon
          name="circle-help"
          :size="14"
          class="mr-1 inline align-[-2px]"
        />
        Conteúdo ilustrativo desta demonstração: as pessoas e as citações são
        fictícias.
      </p>
      <MobileCarousel
        class="mt-[26px]"
        label="Testemunhos"
        grid-class="sm:grid-cols-2 xl:grid-cols-3"
      >
        <figure
          v-for="item in testimonials"
          :key="item.name"
          class="card flex flex-col gap-4 p-[22px]"
        >
          <span class="flex gap-0.5 text-warning" aria-hidden="true">
            <AppIcon v-for="star in 5" :key="star" name="star" :size="15" />
          </span>
          <blockquote class="text-caption">“{{ item.quote }}”</blockquote>
          <figcaption class="mt-auto flex items-center gap-3">
            <span class="avatar avatar-sm">{{ item.name.charAt(0) }}</span>
            <span>
              <strong class="block text-caption font-medium">{{
                item.name
              }}</strong>
              <small class="block text-caption text-muted">{{
                item.role
              }}</small>
            </span>
          </figcaption>
        </figure>
      </MobileCarousel>
    </section>

    <!-- Para empresas ---------------------------------------------------- -->
    <section
      class="overflow-hidden rounded-panel border border-line bg-soft"
      aria-labelledby="empresas-titulo"
    >
      <div
        class="flex flex-col gap-7 px-[26px] py-[30px] sm:px-9 sm:py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12"
      >
        <div class="max-w-[520px]">
          <span class="eyebrow">PARA ESTABELECIMENTOS</span>
          <h2 id="empresas-titulo" class="text-h2">
            Tem um negócio? A agenda pode tratar-se sozinha.
          </h2>
          <p class="mt-2.5 text-caption text-muted">
            Registe o seu estabelecimento, defina serviços, equipa e horário, e
            passe a receber marcações sem interromper o atendimento para atender
            o telefone.
          </p>
          <ul class="mt-5 flex flex-col gap-2.5">
            <li
              v-for="point in ownerPoints"
              :key="point"
              class="flex gap-2.5 text-caption text-muted"
            >
              <span class="shrink-0 text-primary-text"
                ><AppIcon name="circle-check" :size="17"
              /></span>
              {{ point }}
            </li>
          </ul>
        </div>
        <button class="btn btn-primary shrink-0" @click="emit('register')">
          <AppIcon name="building-2" :size="18" /> Registar o meu negócio
        </button>
      </div>
    </section>

    <!-- Perguntas frequentes --------------------------------------------- -->
    <section aria-labelledby="faq-titulo">
      <span class="eyebrow">PERGUNTAS FREQUENTES</span>
      <h2 id="faq-titulo" class="text-h2">Antes de marcar, talvez ajude.</h2>
      <div class="mt-[26px] card divide-y divide-line">
        <details
          v-for="item in questions"
          :key="item.question"
          class="group px-[22px] py-1"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-body font-medium [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {{ item.question }}
            <span
              class="shrink-0 text-muted transition-transform group-open:rotate-180"
              ><AppIcon name="chevron-down" :size="18"
            /></span>
          </summary>
          <p class="pb-4 text-caption text-muted">{{ item.answer }}</p>
        </details>
      </div>
    </section>
  </div>
</template>
