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
  planes: {
    nextPlanLabel: 'PRÓXIMO PLAN',
    noNextPlan: '¿a qué plan te apuntas hoy?',
    noNextPlanCta: 'ver planes →',
    feedHeader: '¿nos pillamos hoy?',
    planCount: (n: number) => `${n} planes`,
    filterAll: 'Todos',
    filterToday: 'Hoy',
    filterNearby: 'Cerca',
    filterFree: 'Gratis',
    joinCta: 'me apunto →',
    joinedCta: '¡ya voy! ✓',
    fullCta: 'lleno',
    planDelDia: (spots: number) => `🔥 plan del día · ${spots} cupos`,
    soloSpots: (spots: number) => `¡solo ${spots} cupos!`,
    spotsInfo: (going: number, spots: number) => `${going} van · ${spots} cupos`,
    hostLocal: 'local verificada',
    hostTurista: 'turista',
    hostPrefix: 'por',
  },
}
