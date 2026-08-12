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
    nameSubtitle: 'Este es el nombre que verán los demás. Lo puedes cambiar después.',
    namePlaceholder: 'Tu nombre o apodo',
    nameButton: 'Continuar',
    nameButtonLoading: 'Guardando...',
    nameError: 'Algo salió mal.',


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
    filterFree: 'Gratis',
    joinCta: 'me apunto',
    joinedCta: 'ya voy',
    emptyFeed: 'parece que no hay planes para ti, pero... y si los creas tú?',
    endOfFeed: 'Tus gustos son de nicho, mejor busca a los tuyos',
    soloSpots: (spots: number) => `¡solo ${spots} cupos!`,
    spotsInfo: (going: number, spots: number) => `${going} van · ${spots} cupos`,
    hostLocal: 'local verificada',
    hostVisitor: 'turista',
    hostPrefix: 'por',
  },
  newPlan: {
    sheetTitle: 'Arma tu parche',
    activityTypeSection: '¿qué tipo de plan es?',
    planSection: 'el plan',
    whereWhenSection: '¿dónde y cuándo?',
    spotsVisibilitySection: 'cupos y visibilidad',
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
    addButton: 'Agregar plan',
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
    loadError: 'No pudimos cargar tus parches. Intenta de nuevo.',
    newMessagesBadge: (n: number) =>
      n === 1 ? '1 mensaje nuevo' : `${n} mensajes nuevos`,
  },
  systemMessages: {
    planCreated: 'Se armo el parche',
    joinedPlanSystem: (name: string) => `${name} se unió al parche`,
    leftPlanSystem: (name: string) => `${name} salió del parche`,
    removedMemberSystem: (name: string) => `${name} fue removido del parche`,

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
    emptyPlans: 'aún no te has apuntado a nada',
    emptyPlansCta: 'ver planes',
  },
}
