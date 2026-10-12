import { PdfDocument } from '../types';

export const INITIAL_DOCUMENTS: PdfDocument[] = [
  {
    id: 'doc-nda-001',
    title: 'Acuerdo de Confidencialidad (NDA) - Global Tech',
    fileName: 'NDA_Confidencialidad_GlobalTech_2026.pdf',
    fileSize: 428000,
    pageCount: 3,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 3,
    lastSyncedAt: Date.now() - 3600000 * 3,
    isLocked: true,
    isFavorite: true,
    tags: ['Legal', 'Confidencial', 'Firmas'],
    pagesRotation: [0, 0, 0],
    cloudSyncStatus: 'synced',
    version: 3,
    category: 'legal',
    annotations: [
      {
        id: 'ann-1',
        pageIndex: 0,
        type: 'highlight',
        x: 60,
        y: 195,
        width: 480,
        height: 24,
        color: '#facc15',
        opacity: 0.35,
        createdAt: Date.now() - 7200000,
        updatedAt: Date.now() - 7200000,
        author: 'Legal Officer'
      },
      {
        id: 'ann-2',
        pageIndex: 1,
        type: 'note',
        x: 420,
        y: 280,
        content: 'Verificar la cláusula de vigencia de 5 años antes del cierre.',
        color: '#38bdf8',
        author: 'Auditoría Interna',
        createdAt: Date.now() - 3600000 * 2,
        updatedAt: Date.now() - 3600000 * 2
      },
      {
        id: 'ann-3',
        pageIndex: 2,
        type: 'stamp',
        x: 80,
        y: 450,
        stampType: 'CONFIDENTIAL',
        color: '#ef4444',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000
      }
    ]
  },
  {
    id: 'doc-service-002',
    title: 'Contrato de Servicios de Desarrollo Cloud & IA',
    fileName: 'Contrato_Servicios_Cloud_2026.pdf',
    fileSize: 612000,
    pageCount: 2,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000 * 12,
    lastSyncedAt: Date.now() - 3600000 * 12,
    isLocked: false,
    isFavorite: true,
    tags: ['Contrato', 'Tecnología', 'Pendiente Firma'],
    pagesRotation: [0, 0],
    cloudSyncStatus: 'synced',
    version: 2,
    category: 'contracts',
    annotations: [
      {
        id: 'ann-s1',
        pageIndex: 1,
        type: 'stamp',
        x: 350,
        y: 520,
        stampType: 'APPROVED',
        color: '#10b981',
        createdAt: Date.now() - 3600000 * 8,
        updatedAt: Date.now() - 3600000 * 8
      }
    ]
  },
  {
    id: 'doc-invoice-003',
    title: 'Factura Comercial Pro-Forma #INV-2026-984',
    fileName: 'Factura_INV-2026-984.pdf',
    fileSize: 215000,
    pageCount: 1,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 1800000,
    lastSyncedAt: Date.now() - 1800000,
    isLocked: false,
    isFavorite: false,
    tags: ['Finanzas', 'Factura', 'Pagado'],
    pagesRotation: [0],
    cloudSyncStatus: 'synced',
    version: 1,
    category: 'invoices',
    annotations: [
      {
        id: 'ann-inv1',
        pageIndex: 0,
        type: 'stamp',
        x: 380,
        y: 110,
        stampType: 'PAID',
        color: '#10b981',
        createdAt: Date.now() - 1800000,
        updatedAt: Date.now() - 1800000
      }
    ]
  },
  {
    id: 'doc-med-004',
    title: 'Consentimiento Informado Médico y Tratamiento de Datos',
    fileName: 'Consentimiento_Medico_Seguro_2026.pdf',
    fileSize: 340000,
    pageCount: 2,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 2,
    lastSyncedAt: Date.now() - 86400000 * 2,
    isLocked: true,
    isFavorite: false,
    tags: ['Salud', 'Confidencial', 'Bóveda'],
    pagesRotation: [0, 0],
    cloudSyncStatus: 'synced',
    version: 1,
    category: 'medical',
    annotations: []
  }
];

export interface PageLayoutContent {
  header: {
    title: string;
    subtitle?: string;
    badge?: string;
    docNumber?: string;
  };
  sections: {
    heading?: string;
    paragraphs?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
    bulletPoints?: string[];
    callout?: {
      type: 'warning' | 'info' | 'legal';
      text: string;
    };
    signatureBoxes?: {
      role: string;
      name: string;
      idNumber?: string;
    }[];
  }[];
  footer: {
    text: string;
    pageLabel: string;
  };
}

export const DOCUMENT_TEMPLATES_CONTENT: Record<string, PageLayoutContent[]> = {
  'doc-nda-001': [
    {
      header: {
        title: 'ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN (NDA)',
        subtitle: 'Instrumento Jurídico de Protección de Secretos Comerciales y Propiedad Intelectual',
        docNumber: 'REF: NDA-2026-EU889',
        badge: 'CONFIDENCIAL'
      },
      sections: [
        {
          heading: '1. PARTES INTERVINIENTES',
          paragraphs: [
            'En la ciudad de Madrid, a los 28 días del mes de Agosto de 2026, comparecen por una parte OMNI TECH ENTERPRISES S.L., con NIF B-98847291 ("Parte Emisora"), y por la otra el Receptor y Consultor Estratégico asignado ("Parte Receptora").',
            'Ambas partes se reconocen mutuamente la capacidad legal suficiente y necesaria para el otorgamiento del presente acuerdo de confidencialidad vinculado al desarrollo de proyectos de software e inteligencia artificial.'
          ]
        },
        {
          heading: '2. DEFINICIÓN DE INFORMACIÓN CONFIDENCIAL',
          paragraphs: [
            'A efectos del presente Acuerdo, se considerará "Información Confidencial" toda información técnica, financiera, operativa, comercial, códigos fuente, modelos de arquitectura, claves criptográficas y bases de datos que sean suministradas bajo cualquier soporte físico o digital.',
            'Queda expresamente excluida aquella información que sea de dominio público sin mediar incumplimiento del receptor, o que haya sido desarrollada de forma independiente demostrable documentalmente.'
          ],
          callout: {
            type: 'warning',
            text: 'ADVERTENCIA LEGAL: La divulgación no autorizada de estos secretos industriales conlleva responsabilidades civiles y penales bajo las directivas de protección comercial vigentes.'
          }
        }
      ],
      footer: {
        text: 'OmniPDF Studio Secure Cloud Vault - Documento Sellado Digitalmente',
        pageLabel: 'Página 1 de 3'
      }
    },
    {
      header: {
        title: 'ACUERDO DE CONFIDENCIALIDAD (NDA) - CLÁUSULAS',
        subtitle: 'Obligaciones de Custodia y No Concurrencia',
        docNumber: 'REF: NDA-2026-EU889',
        badge: 'SECCIÓN II'
      },
      sections: [
        {
          heading: '3. OBLIGACIONES DE CUSTODIA Y SEGURIDAD',
          paragraphs: [
            'La Parte Receptora se compromete a mantener la Información Confidencial bajo estricto secreto profesional, aplicando protocolos de cifrado de alta seguridad (AES-256 o superior) y autenticación biométrica en todos los dispositivos de consulta.',
            'No se permitirá la reproducción, clonación ni transferencia transfronteriza sin autorización previa y por escrito de los titulares de los datos.'
          ],
          bulletPoints: [
            'Prohibición expresa de descompilación de binarios o ingeniería inversa.',
            'Obligación de notificación inmediata en plazo inferior a 24 horas ante cualquier brecha de seguridad.',
            'Destrucción o restitución certificada de los soportes informáticos al término del encargo.'
          ]
        },
        {
          heading: '4. PLAZO DE VIGENCIA Y JURISDICCIÓN',
          paragraphs: [
            'Las obligaciones de confidencialidad estipuladas en el presente contrato se mantendrán vigentes durante un plazo de cinco (5) años a contar desde la firma digital del presente documento.',
            'Para cualquier controversia que pudiera suscitarse, las partes se someten a los juzgados y tribunales de la sede central de la Parte Emisora.'
          ]
        }
      ],
      footer: {
        text: 'OmniPDF Studio Secure Cloud Vault - Documento Sellado Digitalmente',
        pageLabel: 'Página 2 de 3'
      }
    },
    {
      header: {
        title: 'ACUERDO DE CONFIDENCIALIDAD (NDA) - OTORGAMIENTO Y FIRMAS',
        subtitle: 'Sello de Validación Criptográfica y Firma Electrónica Avanzada',
        docNumber: 'REF: NDA-2026-EU889',
        badge: 'FIRMAS'
      },
      sections: [
        {
          heading: '5. CONFORMIDAD Y FIRMA DIGITAL',
          paragraphs: [
            'En prueba de conformidad con todas y cada una de las cláusulas precedentes, las partes otorgan y firman digitalmente el presente documento mediante certificados de firma electrónica y validación biométrica.',
            'El registro de auditoría SHA-256 y la estampa de tiempo quedan indisolublemente vinculados al archivo maestro custodiado en la nube.'
          ],
          signatureBoxes: [
            {
              role: 'Por la Parte Emisora',
              name: 'Dr. Alejandro Morales V.',
              idNumber: 'DNI / NIF: 48.910.231-K'
            },
            {
              role: 'Por la Parte Receptora / Consultor',
              name: 'Ing. Sofía Valenzuela R.',
              idNumber: 'DNI / NIF: 52.884.119-M'
            }
          ]
        }
      ],
      footer: {
        text: 'Documento Verificado con Estándar Criptográfico eIDAS / PDF-Advanced Electronic Signatures',
        pageLabel: 'Página 3 de 3'
      }
    }
  ],

  'doc-service-002': [
    {
      header: {
        title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS TECNOLÓGICOS',
        subtitle: 'Arquitectura Cloud, Infraestructura Serverless & Soluciones de IA',
        docNumber: 'CONTRATO-SRV-2026-104',
        badge: 'OFICIAL'
      },
      sections: [
        {
          heading: '1. OBJETO DEL CONTRATO Y ALCANCE',
          paragraphs: [
            'El presente Contrato tiene por objeto regular la prestación de servicios de consultoría, despliegue de microservicios y soporte continuo en la nube para la plataforma de gestión documental de OMNI ENTERPRISE.',
            'El proveedor garantiza una disponibilidad mensual del servicio (SLA) no inferior al 99.95%, con redundancia geográfica multirregión y copias de seguridad continuas sincronizadas en tiempo real.'
          ]
        },
        {
          heading: '2. ENTREGABLES Y CRONOGRAMA DE HITOS',
          table: {
            headers: ['Hito / Entregable', 'Fecha Límite', 'Importe', 'Estado'],
            rows: [
              ['Fase 1: Arquitectura & Visor PDF', '15 Septiembre 2026', '$12,500.00 USD', 'Completado'],
              ['Fase 2: Motor de Firmas Biométricas', '30 Octubre 2026', '$18,000.00 USD', 'En Proceso'],
              ['Fase 3: Sincronización Multiplataforma', '15 Diciembre 2026', '$14,500.00 USD', 'Programado']
            ]
          }
        }
      ],
      footer: {
        text: 'OmniPDF Studio Contracts Module - Confidencial',
        pageLabel: 'Página 1 de 2'
      }
    },
    {
      header: {
        title: 'CONTRATO DE SERVICIOS - ACUERDOS FINALES Y FIRMAS',
        subtitle: 'Propiedad Intelectual y Aceptación de Términos',
        docNumber: 'CONTRATO-SRV-2026-104',
        badge: 'FIRMA REQUERIDA'
      },
      sections: [
        {
          heading: '3. PROPIEDAD INTELECTUAL Y CESIÓN DE DERECHOS',
          paragraphs: [
            'Todo el código fuente desarrollado, interfaces de usuario, esquemas de bases de datos y algoritmos de optimización serán de propiedad exclusiva del Cliente desde el momento de liquidación de los honorarios correspondientes.'
          ]
        },
        {
          heading: '4. FIRMAS DE LAS PARTES',
          paragraphs: [
            'Las partes ratifican el presente acuerdo mediante firma electrónica cualificada con validez probatoria plena.'
          ],
          signatureBoxes: [
            {
              role: 'Director de Operaciones (Cliente)',
              name: 'Carlos Mendoza Silva',
              idNumber: 'ID: CL-992019'
            },
            {
              role: 'Representante Legal (Proveedor)',
              name: 'Laura Méndez Ortiz',
              idNumber: 'ID: PRV-441200'
            }
          ]
        }
      ],
      footer: {
        text: 'Documento Firmado y Asegurado con Algoritmo SHA-256',
        pageLabel: 'Página 2 de 2'
      }
    }
  ],

  'doc-invoice-003': [
    {
      header: {
        title: 'FACTURA COMERCIAL / INVOICE PRO-FORMA',
        subtitle: 'OmniCloud Services International Corp.',
        docNumber: 'Nº Factura: INV-2026-984',
        badge: 'PAGADO'
      },
      sections: [
        {
          heading: 'DATOS DE FACTURACIÓN',
          paragraphs: [
            'EMISOR: OmniCloud Services Corp - Tax ID: US-EIN-94829104 - San Francisco, CA 94105',
            'CLIENTE: Soluciones Digitales Globales S.A. - Tax ID: ES-A83920184 - Madrid, España',
            'FECHA DE EMISIÓN: 20 de Agosto de 2026 | FECHA DE VENCIMIENTO: 05 de Septiembre de 2026'
          ],
          table: {
            headers: ['Descripción del Servicio', 'Cant.', 'Precio Unit.', 'Total'],
            rows: [
              ['Licencia Anual OmniPDF Studio Enterprise', '50', '$120.00', '$6,000.00'],
              ['Módulo Bóveda Criptográfica Biometría', '1', '$1,800.00', '$1,800.00'],
              ['Sincronización Cloud Multi-dispositivo (1TB)', '12', '$50.00', '$600.00'],
              ['Soporte Premium 24/7 y SLA 99.95%', '1', '$1,200.00', '$1,200.00']
            ]
          }
        },
        {
          heading: 'RESUMEN DE TOTALES Y CONDICIONES DE PAGO',
          paragraphs: [
            'SUBTOTAL: $9,600.00 USD | IMPUESTOS / IVA (21%): $2,016.00 USD | TOTAL GENERAL: $11,616.00 USD',
            'MÉTODO DE PAGO: Transferencia Bancaria Internacional SWIFT - Estado: PAGADO Y CONCILIADO'
          ],
          callout: {
            type: 'info',
            text: 'Comprobante fiscal verificado mediante hash criptográfico e integrado con pasarelas de pago seguras.'
          }
        }
      ],
      footer: {
        text: 'Factura Electrónica Validada - Gracias por su confianza en OmniCloud',
        pageLabel: 'Página 1 de 1'
      }
    }
  ],

  'doc-med-004': [
    {
      header: {
        title: 'CONSENTIMIENTO INFORMADO MÉDICO Y TRATAMIENTO DE DATOS',
        subtitle: 'Hospital Universitario & Centro de Diagnóstico de Precisión',
        docNumber: 'EXP-MED-2026-749',
        badge: 'CONFIDENCIAL MÉDICO'
      },
      sections: [
        {
          heading: '1. DECLARACIÓN DEL PACIENTE / TUTOR LEGAL',
          paragraphs: [
            'D/Dña. María Eugenia Santos, con documento de identidad nº 33.491.802-P, declara haber recibido información exhaustiva y comprensible sobre el procedimiento diagnóstico propuesto, sus beneficios esperados y sus posibles riesgos.',
            'Se autoriza expresamente la custodia cifrada del historial clínico en la bóveda biométrica de la institución.'
          ]
        },
        {
          heading: '2. DERECHOS ARCO Y PROTECCIÓN DE DATOS',
          paragraphs: [
            'De conformidad con el Reglamento General de Protección de Datos (RGPD), el paciente puede ejercer en todo momento sus derechos de acceso, rectificación, supresión y limitación del tratamiento.'
          ]
        }
      ],
      footer: {
        text: 'Documento Protegido por Secreto Médico Profesional',
        pageLabel: 'Página 1 de 2'
      }
    },
    {
      header: {
        title: 'CONSENTIMIENTO MÉDICO - RATIFICACIÓN Y FIRMAS',
        subtitle: 'Validación Presencial o Telemática Cifrada',
        docNumber: 'EXP-MED-2026-749',
        badge: 'EXPEDIENTE CUSTODIADO'
      },
      sections: [
        {
          heading: '3. ACEPTACIÓN Y AUTORIZACIÓN',
          paragraphs: [
            'Habiendo aclarado todas las dudas con el equipo médico especialista, firmo voluntariamente la presente autorización.'
          ],
          signatureBoxes: [
            {
              role: 'Firma del Paciente o Tutor',
              name: 'María Eugenia Santos',
              idNumber: 'DNI: 33.491.802-P'
            },
            {
              role: 'Firma del Médico Facultativo',
              name: 'Dr. Fernando Armenteros',
              idNumber: 'Col. Médicos Nº 28/49102'
            }
          ]
        }
      ],
      footer: {
        text: 'Expediente Médico Custodiado en Bóveda Cifrada',
        pageLabel: 'Página 2 de 2'
      }
    }
  ]
};
