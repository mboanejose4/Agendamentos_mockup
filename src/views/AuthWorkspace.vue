<script setup>
import { reactive, ref } from 'vue'
import { state, go, notify, uid, saveRecord, registerAccount, loginAccount } from '../core/state'
import AppIcon from '../components/AppIcon.vue'
const mode = ref('login')
const showPassword = ref(false)
const busy = ref(false)
const error = ref('')
const account = reactive({name:'',email:'',phone:'',password:''})
const company = reactive({name:'',category:'Beleza',city:'Maputo',address:'',phone:'',email:'',description:'',opens:'08:00',closes:'18:00'})
async function submit() {
  error.value='';busy.value=true
  try {
    const target=state.returnView || 'appointments'
    const result=await (mode.value==='register'?registerAccount(account):loginAccount(account))
    if(!result.ok){error.value=result.error;return}
    state.returnView=null;go(target)
  } catch { error.value='Não foi possível iniciar a sessão. Tente novamente.' }
  finally {busy.value=false}
}
function createCompany() {
  if(company.opens>=company.closes){error.value='A hora de encerramento deve ser posterior à abertura.';return}
  const record=saveRecord('businesses',{...company,id:uid('b'),active:true,onlinePayment:false,days:[1,2,3,4,5,6],cancelHours:2,rating:0,reviewCount:0,image:'',ownerId:state.userId})
  const user=state.db.users.find(u=>u.id===state.userId)
  if(user)saveRecord('users',{...user,role:'manager',businessId:record.id})
  state.businessId=record.id;state.role='manager';go('services');notify('Empresa registada. Adicione o primeiro serviço.')
}
</script>
<template>
  <div v-if="state.view==='onboard'" class="onboarding-page"><header class="page-header"><div><span class="eyebrow">A SUA EMPRESA NO ELO</span><h1>Vamos conhecer o seu negócio.</h1><p>Comece pelos dados do estabelecimento.</p></div></header><form class="onboarding-form" @submit.prevent="createCompany"><div class="form-grid"><label class="field">Nome do estabelecimento<input v-model.trim="company.name" required maxlength="100" autocomplete="organization"/></label><label class="field">Categoria<select v-model="company.category"><option>Beleza</option><option>Bem-estar</option><option>Saúde</option><option>Restauração</option><option>Outros serviços</option></select></label><label class="field">Cidade<input v-model.trim="company.city" required/></label><label class="field">Endereço<input v-model.trim="company.address" required autocomplete="street-address"/></label><label class="field">Contacto<input v-model.trim="company.phone" type="tel" required autocomplete="tel"/></label><label class="field">E-mail<input v-model.trim="company.email" type="email" required autocomplete="email"/></label><label class="field">Abertura<input v-model="company.opens" type="time" required/></label><label class="field">Encerramento<input v-model="company.closes" type="time" required/></label></div><label class="field">Sobre o estabelecimento<textarea v-model.trim="company.description" rows="3" required maxlength="600"/></label><p v-if="error" class="error-message" role="alert">{{error}}</p><div class="form-actions"><button type="button" class="btn secondary" @click="go('explore')">Voltar</button><button class="btn primary">Criar estabelecimento<AppIcon name="arrow-right" :size="17"/></button></div></form></div>
  <div v-else class="auth-layout"><section class="auth-introduction"><span class="category-icon mint"><AppIcon name="calendar-check" :size="30"/></span><span class="eyebrow">BEM-VINDO AO ELO</span><h1>O seu tempo.<br>Os seus planos.<br>Tudo ligado.</h1><p>Há sempre um bom momento para cuidar de si.</p><img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=85" alt="Espaço acolhedor de um restaurante" /></section><section class="auth-form-area"><div class="tabs"><button :class="{active:mode==='login'}" @click="mode='login';error=''">Iniciar sessão</button><button :class="{active:mode==='register'}" @click="mode='register';error=''">Criar conta</button></div><h2>{{mode==='login'?'É bom ter consigo.':'O seu próximo momento começa aqui.'}}</h2><p class="muted">{{mode==='login'?'Entre para acompanhar as suas marcações.':'Preencha os seus dados para continuar.'}}</p><form @submit.prevent="submit"><label v-if="mode==='register'" class="field">Nome completo<input v-model.trim="account.name" required autocomplete="name" placeholder="O seu nome"/></label><label class="field">E-mail<input type="email" v-model.trim="account.email" required autocomplete="email" placeholder="nome@exemplo.com"/></label><label v-if="mode==='register'" class="field">Telemóvel<input type="tel" v-model.trim="account.phone" required autocomplete="tel" placeholder="+258"/></label><label class="field">Palavra-passe<div class="password-input"><input v-model="account.password" :type="showPassword?'text':'password'" :minlength="mode==='register'?8:1" required :autocomplete="mode==='register'?'new-password':'current-password'" :placeholder="mode==='register'?'Pelo menos 8 caracteres':'A sua palavra-passe'"/><button class="icon-btn" type="button" :title="showPassword?'Ocultar palavra-passe':'Mostrar palavra-passe'" :aria-label="showPassword?'Ocultar palavra-passe':'Mostrar palavra-passe'" @click="showPassword=!showPassword"><AppIcon :name="showPassword?'eye-off':'eye'" :size="18"/></button></div></label><p v-if="error" class="error-message" role="alert">{{error}}</p><button :disabled="busy" class="btn primary full"><AppIcon v-if="busy" name="loader-circle" :size="17"/>{{busy?'Aguarde…':mode==='login'?'Entrar':'Criar conta'}}<AppIcon name="arrow-right" :size="17"/></button></form><div class="auth-local-info"><AppIcon name="lock-keyhole" :size="16"/><p>Conta guardada neste navegador. Use dados de teste neste ambiente local.</p></div><button class="text-button" @click="go('explore')"><AppIcon name="arrow-left" :size="16"/>Continuar a explorar</button></section></div>
</template>
