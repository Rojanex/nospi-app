import { SystemPayload } from '@/types'

const DATE_TODAY = 'Hoy'
const DATE_WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const
const DATE_WEEKDAYS_LONG = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
] as const
const DATE_MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
] as const

export const strings = {
  dates: {
    today: DATE_TODAY,
    weekdays: DATE_WEEKDAYS,
    weekdaysLong: DATE_WEEKDAYS_LONG,
    months: DATE_MONTHS,
    am: 'am',
    pm: 'pm',
    postedJustNow: 'hace 1 min',
    postedMinutes: (n: number) => `hace ${n} min`,
    postedHoursOne: 'hace 1 h',
    postedHours: (n: number) => `hace ${n} h`,
    postedDaysOne: 'hace 1 d',
    postedDays: (n: number) => `hace ${n} d`,
    planDateTime: (day: string, date: number, month: string, time: string) =>
      `${day} ${date} ${month} · ${time}`,
    sheetDate: (weekday: string, day: number, month: string) =>
      `${weekday} ${day} ${month}`,
    clockTime: (hour: number, minutePart: string, period: string) =>
      `${hour}${minutePart} ${period}`,
  },

  common: {
    hostFallback: 'Host',
    userFallback: 'Usuario',
    someoneFallback: 'Alguien',
  },

  onboarding: {
    //welcome screen
    welcomeTitle: '¿Y si nos pillamos\nhoy?',
    welcomeSignUp: 'Crear cuenta',
    welcomeSignIn: 'Ya tengo cuenta',

    //ingresa tu numero screen
    signInTitle: '¿Cuál es tu número?',
    signInSubtitle: 'Te mandaremos un código de 6 digitos para confirmar que realmente eres tu.',
    signInPlaceholder: '+57 300 000 0000',
    signInButton: 'Enviar codigo',
    signInButtonLoading: 'Enviando...',
    signInPhoneTooShort: 'Ingresa un número válido.',

    // OTP screen
    verifyTitle: 'Revisa tus mensajes',
    verifySubtitle: 'Codigo enviado a ',
    verifyExplanation: 'Introduce el código para confirmar tu cuenta y armar parche.',
    verifyButton: 'Verificar',
    verifyButtonLoading: 'Verificando',
    verifyResendCode: 'Reenviar código',
    verifyResendIn: 'Reenviar en',

    // name screen
    nameTitle: '¿Cómo\nte llaman?',
    nameSubtitle: 'Usa el nombre con el que te conocen. Así te verán en los planes.',
    namePlaceholder: 'Tu nombre o apodo',
    nameButton: 'Continuar',
    nameButtonLoading: 'Guardando...',
    nameError: 'Algo salió mal.',

    // consent checkbox (sign-in + accept-terms screens)
    consentPrefix: 'Acepto los ',
    consentTermsLink: 'Términos y Condiciones',
    consentMiddle: ' y la ',
    consentPrivacyLink: 'Política de Privacidad',
    consentSuffix: ', y autorizo el tratamiento de mis datos personales.',

    // accept-terms screen (existing users / new terms version)
    acceptTermsTitle: 'Un último\npaso',
    acceptTermsSubtitle:
      'Para seguir creando planes necesitamos que aceptes nuestros términos y cómo cuidamos tus datos.',
    acceptTermsButton: 'Continuar',
    acceptTermsLogout: 'Cerrar sesión',
    acceptTermsError: 'No pudimos guardar tu aceptación. Intenta de nuevo.',


    // dni input screen
    dniTitle: 'Ingresa tu\ninfo',
    dniSubtitle: 'Funciona con cédula colombiana o cualquier documento internacional.',
    dniCityTitle: '¿desde dónde parchas?',
    dniCityPlaceholder: 'Ingresa tu ciudad',
    dniPlaceholder: 'Número de documento',
    dniContinue: 'Continuar',
    dniSkip: 'Hacer esto despues',
      // dni type selector
    dniTypeColombian: 'Cédula colombiana (CC)',
    dniTypeInternational: 'Documento internacional',
    dniPillCC: 'Cédula (CC)',
    dniPillInternational: 'Documento extranjero',
      // dni errors
    dniErrorAlreadyRegistered: 'Este documento ya está registrado',

    // liveness screen  
    livenessTitle: 'Una selfie\nrápida',
    livenessSubtitle: 'Solo para confirmar que eres tú. No guardamos tu foto.',
    livenessButton: 'Tomar selfie',
    livenessSkip: 'Hacer esto después',


  },
  plansFeed: {
    nextPlanLabel: 'PRÓXIMO PARCHE:',
    noNextPlan: '¿a qué plan te apuntas?',
    noNextPlanCta: 'tus parches →',
    feedHeader: '¿nos pillamos hoy?',


    planCount: (n: number) => `${n} planes`,
    filterAll: 'Todos',
    filterToday: DATE_TODAY,
    filterNearby: 'Cerca',
    filterWeekend: 'Este finde',
    nearbyLocationRequired: 'activa tu ubicación para que hay cerca',
    joinCta: 'voy',
    emptyFeed: 'parece que no hay planes para ti, pero... y si los creas tú?',
    emptyFeedToday: 'si no hay nada hoy, juntemonos :)',
    emptyFeedWeekend: 'Tu señal para armar lo que sea',
    endOfFeed: 'Tus gustos son de nicho, mejor busca a los tuyos',
    endOfFeedAll: 'Llegaste al fin del scroll infinito wow...',
    soloSpots: (spots: number) =>
      spots === 1 ? '¡solo 1 cupo!' : `¡solo ${spots} cupos!`,
    spotsInfo: (going: number, spots: number) =>
      `${going} van · ${spots === 1 ? '1 cupo' : `${spots} cupos`}`,
    spotsLeft: (spots: number) =>
      spots === 1 ? '1 cupo' : `${spots} cupos`,
    spotsFull: 'Ya estamos todos!',
    hostLocal: 'local',
    hostVisitor: 'explorer',
    hostPrefix: 'por',
    hostCreatedByPrefix: 'creado por',
    planDetailMore: 'Ver detalles',
    planDetailClose: 'Cerrar',
    visibilityOpenBadge: 'abierto a todos',
    visibilityLocalBadge: 'solo locales',
    descriptionTitle: 'DESCRIPCIÓN',
    descriptionEmpty: 'Sin descripción todavía — el host no agregó detalles.',
    likeA11y: (n: number) => (n === 1 ? 'Me gusta, 1 persona' : `Me gusta, ${n} personas`),
    chatPreviewTitle: 'CHAT ACTIVO',
    chatPreviewSeeAll: 'ver todo',
    chatPreviewEmpty: 'aún nadie ha escrito — sé el primero',
    chatPreviewMore: (n: number) => (n === 1 ? '+1 mensaje' : `+${n} mensajes`),
  },
  newPlan: {
    activityTypeSection: '¿qué tipo de plan es?',
    planSection: 'el plan',
    whereWhenSection: '¿dónde y cuándo?',
    spotsVisibilitySection: 'cupos y visibilidad',
    spotsSection: 'cupos',
    titleLabel: 'TÍTULO',
    descriptionLabel: 'DESCRIPCIÓN (OPCIONAL)',
    locationLabel: 'LUGAR',
    dateLabel: 'FECHA',
    timeLabel: 'HORA',
    spotsLabel: 'CUPOS',
    visibilityLabel: '¿QUIÉN PUEDE UNIRSE?',
    titlePlaceholder: '¿cuál es el plan?',
    descriptionPlaceholder: 'agrega detalles del plan...',
    locationPlaceholder: 'busca un sitio...',
    locationPrivateWarning:
      'este lugar parece una dirección privada · Nospi es para planes en sitios públicos 👀',
    datePlaceholder: 'elige una fecha',
    timePlaceholder: 'elige la hora',
    spotsCount: (n: number) => `${n} personas`,
    spotsSubtitleYouPlusOne: 'tú + 1 persona',
    spotsSubtitleYouPlusOthers: (n: number) => `tú + ${n} personas`,
    visibilityOpenTitle: 'abierto',
    visibilityOpenSubtitle: 'cualquier usuario',
    visibilityLocalTitle: 'solo locales',
    visibilityLocalSubtitle: 'únicamente locales verificados',
    addButton: 'Agregar parche',
    ctaButtonLoading: 'Agregando...',
    ctaHint: 'tu plan aparece en el feed de una vez',
    pickerDone: 'Listo',
    createErrorAuth: 'Inicia sesión para crear un plan.',
    createErrorGeneric: 'No pudimos crear el plan. Intenta de nuevo.',
    createErrorLimit: 'Ya alcanzaste el límite de planes esta semana.',
    createErrorValidation: 'Revisa los datos del plan e intenta de nuevo.',
  },

  tabs: {
    plans: 'Planes',
    newPlan: 'Nuevo plan',
    chats: 'Los míos',
    profile: 'Perfil',
  },

  losMios: {
    title: 'Los míos',
    activeCount: (n: number) => `${n} parches activos`,
    activeSection: 'Activos',
    completedSection: 'Finalizados',
    archivedSection: 'Archivados',
    archivedFooter: (n: number) => `Ver archivados (${n})`,
    hostBadge: 'HOSTING',
    archiveAction: 'Archivar',
    unarchiveAction: 'Desarchivar',
    leaveAction: 'Salirse',
    secondLeaveAction: 'Salir',
    removeMemberAction: 'Sacar del parche',
    removeMemberConfirmTitle: (name: string) => `¿Sacar a ${name} del parche?`,
    leaveConfirmTitle: '¿Seguro que quieres salir del parche?',
    deletePlanAction: 'Eliminar parche',
    deletePlanConfirmTitle: '¿Seguro que quieres eliminar este parche?',
    threadSubtitle: (memberCount: number, timeLabel: string) =>
      `${memberCount} personas · ${timeLabel}`,
    messagePlaceholder: 'Escribe un mensaje...',
    readOnlyBanner: 'Este parche ya pasó · solo lectura',
    emptyMessages: 'Aún no hay mensajes',
    emptyArchived: 'Todavía no has archivado ningún parche',
    notFoundChat: 'Chat no encontrado',
    loadError: 'No pudimos cargar tus planes. Intenta de nuevo.',
    newMessagesBadge: (n: number) =>
      n === 1 ? '1 mensaje nuevo' : `${n} mensajes nuevos`,
  },
  systemMessages: {
    planCreated: 'Se armo el parche',
    host_transferred: ({ name }: SystemPayload) =>
      `${name ?? strings.common.someoneFallback} ahora es host`,
    joinedPlanSystem: ({ name }: SystemPayload) => `${name} se unió al plan`,
    leftPlanSystem: ({ name }: SystemPayload) => `${name} salió del plan`,
    removedMemberSystem: ({ name }: SystemPayload) => `${name} fue removido del plan`,
  },

  profile: {
    title: 'Mi perfil',
    founderPill: 'Founder',
    verificationExplorer: 'Explorer · sin verificar',
    verificationVisitor: 'Visitante verificado',
    verificationLocal: 'Local verificado',
    statsCreated: 'parches creados',
    statsAttended: 'asistidos',
    onboardingBannerBody:
      'Verifica tu identidad para desbloquear planes solo para locales y salir como local verificado.',
    onboardingBannerCta: 'Verificar identidad',
    founderCta: 'Sé parte del programa fundador',
    recentPlansTitle: 'Tus últimos parches',
    seeAll: 'ver todos',
    emptyPlans: 'Aún no te has apuntado a nada :(',
    emptyPlansCta: 'Encuentra tu primer parche',
    likedPlansTitle: 'Planes que te gustan',
    loadError: 'No pudimos cargar tu perfil. Intenta de nuevo.',
    publicTitle: 'Perfil',
    publicLoadError: 'No pudimos cargar este perfil. Intenta de nuevo.',
    activityFingerprintLabel: 'se le ve en...',
    retry: 'Intentar de nuevo',
  },

  moderation: {
    moreActions: 'Más opciones',
    viewHostProfile: 'Ver perfil del host',
    cancel: 'Cancelar',
    reportMessage: 'Reportar mensaje',
    reportPlan: 'Reportar plan',
    reportUser: 'Reportar usuario',
    block: 'Bloquear',
    unblock: 'Desbloquear',
    blockUserAction: (name: string) => `Bloquear a ${name}`,
    blockConfirmTitle: (name: string) => `¿Bloquear a ${name}?`,
    blockConfirmBody:
      'Ya no verán los planes del otro, sus mensajes desaparecen en los chats que compartan y no podrán unirse a los planes del otro. No le avisamos.',
    unblockConfirmTitle: (name: string) => `¿Desbloquear a ${name}?`,
    blockedLabel: 'Bloqueaste a esta persona',
    blockError: 'No pudimos completar la acción. Intenta de nuevo.',
    reportSheetTitle: {
      message: 'Reportar mensaje',
      plan: 'Reportar plan',
      user: 'Reportar usuario',
    },
    reportSheetSubtitle: '¿Qué está pasando? Nadie sabrá que fuiste tú.',
    reasons: {
      spam: 'Spam',
      harassment: 'Acoso',
      inappropriate: 'Contenido inapropiado',
      impersonation: 'Suplantación',
      underage: 'Parece menor de edad',
      other: 'Otro',
    },
    detailsPlaceholder: 'Cuéntanos qué pasó (opcional)',
    submit: 'Enviar reporte',
    reportError: 'No pudimos enviar tu reporte. Intenta de nuevo.',
    reportSentTitle: 'Gracias por avisarnos',
  },
  settings: {
    title: 'Ajustes',
    sectionPrivacy: 'Privacidad y seguridad',
    sectionHelp: 'Ayuda',
    phoneLinked: 'Tu cuenta está ligada a este número.',
    changeSomething: '¿Necesitas cambiar algo?',
    writeUs: 'Escríbenos',
    blockedUsers: 'Usuarios bloqueados',
    terms: 'Términos y Condiciones',
    privacy: 'Política de Tratamiento de Datos',
    contactSupport: 'Contactar soporte',
    logout: 'Cerrar sesión',
    deleteAccount: 'Eliminar cuenta',
    about: 'Acerca de Nospi',
    appVersion: 'Versión',
    changePhoto: 'Cambiar foto',
    sectionAccount: 'Tu cuenta',
    nameLabel: 'Nombre',
    phoneLabel: 'Teléfono',
    /** Appended to support emails so we know the app version and platform. */
    supportFooter: (version: string, platform: string) => `Nospi ${version} · ${platform}`,
    loadError: 'No pudimos cargar tu perfil. Intenta de nuevo.',
    retry: 'Intentar de nuevo',
    supportSubject: 'Soporte Nospi',
    changeDataSubject: 'Cambiar mi nombre o número',
    mailError: (email: string) => `No encontramos una app de correo. Escríbenos a ${email}`,
    cancel: 'Cancelar',
    logoutConfirmTitle: '¿Cerrar sesión?',
    logoutConfirmBody: 'Para volver a entrar te enviaremos un código a tu número.',
    logoutError: 'No pudimos cerrar sesión. Intenta de nuevo.',
    blockedEmpty: 'No has bloqueado a nadie',
    blockedLoadError: 'No pudimos cargar la lista. Intenta de nuevo.',
    deleteIntro: 'Esto no se puede deshacer. Al eliminar tu cuenta:',
    deleteBullets: [
      'Tu perfil, tu foto y tu número se borran de Nospi.',
      'Tus mensajes en los chats aparecen como "Usuario eliminado".',
      'Los planes que creaste y aún no han pasado se cancelan.',
    ],
    deleteConfirmWord: 'eliminar',
    deleteTypeLabel: 'Escribe "eliminar" para confirmar',
    deleteButton: 'Eliminar mi cuenta',
    deleteError: 'No pudimos eliminar tu cuenta. Intenta de nuevo o escríbenos a soporte.',
  },
}
