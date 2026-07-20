export const strings = {
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
    dniTitle: 'Ingresa tu documento',
    dniSubtitle: 'Funciona con cédula colombiana o cualquier documento internacional.',
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
    filterToday: 'Hoy',
    filterNearby: 'Cerca',
    filterFree: 'Gratis',
    joinCta: 'me apunto →',
    joinedCta: '¡ya voy! ✓',
    fullCta: 'lleno',
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

  losMios: {
    title: 'Los míos',
    activeCount: (n: number) => `${n} parches activos`,
    activeSection: 'Activos',
    completedSection: 'Finalizados',
    archivedFooter: (n: number) => `Ver archivados (${n})`,
    hostBadge: 'HOSTING',
    archiveAction: 'Archivar',
    leaveAction: 'Salir',
    threadSubtitle: (memberCount: number, timeLabel: string) =>
      `${memberCount} personas · ${timeLabel}`,
    messagePlaceholder: 'Escribe un mensaje...',
    readOnlyBanner: 'Este parche ya pasó · solo lectura',
    emptyMessages: 'Aún no hay mensajes',
  },
}
