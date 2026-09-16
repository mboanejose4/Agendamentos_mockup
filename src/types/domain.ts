/* Modelo de domínio do MarcaFácil.
   Uma só definição por entidade, partilhada pelo store, pelos composables e
   pelos componentes. Quando o backend em Laravel existir, estes tipos são o
   contrato que as respostas da API têm de cumprir. */

/* --- Vocabulários fechados ------------------------------------------------ */

export type Role = "guest" | "client" | "professional" | "manager" | "platform";

export type AuthenticatedRole = Exclude<Role, "guest">;

export type BookingStatus =
  "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type PaymentMethod = "onsite" | "online";

export type WalletMethod = "mkesh" | "mpesa" | "emola";

/* O método guardado no rascunho durante o pagamento de teste. */
export type CheckoutMethod = WalletMethod | "card";

export type ClientState = "active" | "inactive" | "removed";

export type TicketStatus = "open" | "in_progress" | "closed";

export type TicketPriority = "low" | "normal" | "high" | "urgent";

export type ResourceTypeId = "room" | "table" | "chair" | "equipment";

/* 0 = domingo, 6 = sábado, como em Date#getDay. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Data no formato "2026-09-16". */
export type IsoDate = string;
/** Hora no formato "09:00". */
export type TimeOfDay = string;
/** Instante no formato ISO 8601 completo. */
export type IsoDateTime = string;

/* Cada ecrã da aplicação. O nome da vista é a chave de navegação usada em
   `state.view`, nos grupos de navegação e no registo de páginas. */
export type ViewName =
  | "explore"
  | "favorites"
  | "business"
  | "booking"
  | "auth"
  | "onboard"
  | "appointments"
  | "notifications"
  | "profile"
  | "professional-agenda"
  | "professional-services"
  | "professional-schedule"
  | "professional-history"
  | "overview"
  | "agenda"
  | "clients"
  | "services"
  | "team"
  | "resources"
  | "schedule"
  | "payments"
  | "reports"
  | "promotions"
  | "settings"
  | "support"
  | "platform-overview"
  | "companies"
  | "users"
  | "monitoring"
  | "platform-settings";

/* --- Entidades ------------------------------------------------------------ */

export interface Branding {
  primaryColor: string;
  secondaryColor: string;
  icon: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  image: string;
  rating: number;
  reviewCount: number;
  active: boolean;
  onlinePayment: boolean;
  opens: TimeOfDay;
  closes: TimeOfDay;
  days: Weekday[];
  cancelHours: number;
  branding?: Branding;
  /** Estado de cada cliente nesta empresa; ausente significa activo. */
  clientStates?: Record<string, ClientState>;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  /** Minutos. */
  duration: number;
  price: number;
  active: boolean;
  /** Tipo de recurso que o serviço exige, quando exige algum. */
  resourceType?: ResourceTypeId | "";
  /** O preço multiplica pelo número de pessoas. */
  pricePerPerson?: boolean;
}

export interface StaffMember {
  id: string;
  businessId: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  serviceIds: string[];
  active: boolean;
  start: TimeOfDay;
  end: TimeOfDay;
  days: Weekday[];
  /** Fotografia de perfil em data URL. */
  avatar?: string;
}

export interface Resource {
  id: string;
  businessId: string;
  name: string;
  type: ResourceTypeId;
  capacity: number;
  active: boolean;
}

export interface Client {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  businessId: string;
  serviceId: string;
  staffId: string;
  resourceId: string;
  clientId: string;
  clientName: string;
  date: IsoDate;
  time: TimeOfDay;
  /** Minutos, copiados do serviço no momento da reserva. */
  duration: number;
  total: number;
  subtotal?: number;
  discount: number;
  coupon?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  partySize: number;
  notes: string;
  createdAt: IsoDateTime;
  paidAt?: IsoDateTime;
}

export interface Promotion {
  id: string;
  businessId: string;
  code: string;
  /** Percentagem entre 1 e 100. */
  discount: number;
  /** Vazio quando se aplica a todos os serviços. */
  serviceId: string;
  active: boolean;
  expires: IsoDate;
}

export interface Block {
  id: string;
  businessId: string;
  /** Vazio quando bloqueia toda a equipa. */
  staffId: string;
  date: IsoDate;
  start: TimeOfDay;
  end: TimeOfDay;
  reason: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: IsoDateTime;
  /** Marca de um lembrete já gerado, para não repetir. */
  reminderKey?: string;
}

export interface TicketMessage {
  author: string;
  userId: string;
  role: Role;
  body: string;
  createdAt: IsoDateTime;
}

export interface Ticket {
  id: string;
  businessId: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessage[];
  createdAt: IsoDateTime;
  updatedAt?: IsoDateTime;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  /** Empresa a que a conta está associada; vazio para cliente e plataforma. */
  businessId: string;
  /** Ficha de profissional correspondente, quando o papel é profissional. */
  staffId?: string;
  active: boolean;
  avatar?: string;
  notificationEmail?: boolean;
  notificationSms?: boolean;
  passwordHash?: string;
  passwordSalt?: string;
}

export interface Settings {
  /** Intervalo entre horários oferecidos, em minutos. */
  slotMinutes: number;
  /** Antecedência máxima de marcação, em dias. */
  advanceDays: number;
  onlinePayments: boolean;
  promotions: boolean;
  notifications: boolean;
}

export interface LogEntry {
  id: string;
  action: string;
  userId: string;
  businessId: string;
  createdAt: IsoDateTime;
}

/* --- Base de dados de demonstração --------------------------------------- */

export interface Database {
  businesses: Business[];
  services: Service[];
  staff: StaffMember[];
  resources: Resource[];
  clients: Client[];
  bookings: Booking[];
  promotions: Promotion[];
  blocks: Block[];
  notifications: AppNotification[];
  tickets: Ticket[];
  users: User[];
  settings: Settings;
  /** Identificadores de empresas guardadas como favoritas. */
  favorites: string[];
  logs: LogEntry[];
}

/** Colecções da base de dados que são listas de registos. */
export type CollectionName = {
  [K in keyof Database]: Database[K] extends Array<unknown> ? K : never;
}[keyof Database];

/** Registo guardado numa colecção. */
export type CollectionRecord =
  | Business
  | Service
  | StaffMember
  | Resource
  | Client
  | Booking
  | Promotion
  | Block
  | AppNotification
  | Ticket
  | User
  | LogEntry;

/* --- Rascunho de marcação ------------------------------------------------- */

export interface BookingDraft {
  businessId: string;
  serviceId: string;
  staffId: string;
  resourceId: string;
  date: IsoDate;
  time: TimeOfDay;
  partySize: number;
  coupon: string;
  paymentMethod: PaymentMethod;
  notes: string;
  /** Passo em que o rascunho deve ser retomado depois da autenticação. */
  resumeStep?: number;
  appliedCoupon?: string;
  /** Marcação que está a ser reagendada. */
  excludeBookingId?: string;
  clientId?: string;
  clientName?: string;
  paymentStatus?: PaymentStatus;
  email?: string;
  phone?: string;
}

/** O que basta para pedir uma marcação: o resto tem valores por omissão. */
export type BookingInput = Partial<BookingDraft> &
  Partial<Booking> & {
    serviceId: string;
    date: IsoDate;
    time: TimeOfDay;
  };

/* --- Estado da aplicação -------------------------------------------------- */

export interface ApplicationState {
  view: ViewName;
  role: Role;
  /** Empresa em que o gestor ou o profissional está a trabalhar. */
  businessId: string;
  /** Empresa que o cliente está a consultar. */
  selectedBusinessId: string;
  staffId: string;
  userId: string;
  bookingDraft: BookingDraft | null;
  toast: string;
  db: Database;
  /** Vista a retomar depois da autenticação. */
  returnView?: ViewName;
  /** Profissional pré-seleccionado ao abrir a agenda da empresa. */
  businessAgendaStaffId?: string | null;
}

/** Fotografia do estado guardada no armazenamento local. */
export interface ApplicationSnapshot {
  version: number;
  db: Database;
  role: Role;
  businessId: string;
  selectedBusinessId: string;
  staffId: string;
  userId: string;
}

/* --- Resultados de operações ---------------------------------------------- */

export interface SuccessResult<T> {
  ok: true;
  record?: T;
  /** O registo foi desactivado em vez de eliminado, para preservar histórico. */
  archived?: boolean;
}

export interface FailureResult {
  ok: false;
  error: string;
}

export type OperationResult<T = CollectionRecord> =
  SuccessResult<T> | FailureResult;

/** Preço calculado de uma marcação. */
export interface PriceBreakdown {
  total: number;
  subtotal: number;
  discount: number;
  coupon: string;
  percentage?: number;
  error?: string;
}

/** Opções de pesquisa de disponibilidade. */
export interface SlotQuery {
  businessId: string;
  serviceId: string;
  date: IsoDate;
  staffId?: string;
  resourceId?: string;
  partySize?: number;
  excludeBookingId?: string;
}
