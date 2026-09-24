import { Question } from '../src/types';

export const defaultQuestions: Question[] = [
  // ==========================================
  // --- ÁREA 1: LÓGICA Y ALGORITMIA (10 PREGUNTAS) ---
  // ==========================================
  {
    id: 'log-001',
    category: 'logica',
    title: 'Evaluación de condicional anidado en pseudocódigo',
    type: 'multiple_choice',
    context: `Considere las variables enteras:\nvar a = 8;\nvar b = 4;\nvar c = 12;\n\nSI (a > b Y c == (a + b)) ENTONCES\n   resultado = (c / b) * 2;\nSINO\n   resultado = c - a;\nFIN SI`,
    options: [
      'resultado = 4',
      'resultado = 6',
      'resultado = 8',
      'resultado = 12'
    ],
    correctAnswer: 1,
    explanation: 'a (8) > b (4) es Verdadero y c (12) == (8 + 4 = 12) es Verdadero. Se evalúa el bloque SI: (12 / 4) * 2 = 3 * 2 = 6.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-002',
    category: 'logica',
    title: 'Secuencia lógica y patrones de datos numéricos',
    type: 'multiple_choice',
    context: 'Un sistema genera identificadores siguiendo la serie: 3, 7, 15, 31, 63, ... ¿Cuál es el valor del siguiente identificador en la secuencia?',
    options: [
      '95',
      '127',
      '126',
      '128'
    ],
    correctAnswer: 1,
    explanation: 'Cada término responde a la fórmula (Anterior * 2) + 1, o 2^(n+1) - 1. (63 * 2) + 1 = 126 + 1 = 127.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-003',
    category: 'logica',
    title: 'Comportamiento de bucle iterativo MIENTRAS',
    type: 'multiple_choice',
    context: `contador = 1;\nacumulador = 0;\nMIENTRAS (contador <= 4) HACER\n   acumulador = acumulador + (contador * 2);\n   contador = contador + 1;\nFIN MIENTRAS\n¿Cuál es el valor final de acumulador?`,
    options: [
      '12',
      '16',
      '20',
      '24'
    ],
    correctAnswer: 2,
    explanation: 'Iter 1: acum = 2. Iter 2: acum = 2 + 4 = 6. Iter 3: acum = 6 + 6 = 12. Iter 4: acum = 12 + 8 = 20. El bucle termina cuando contador = 5.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-004',
    category: 'logica',
    title: 'Lógica proposicional booleana (Tablas de verdad)',
    type: 'multiple_choice',
    context: 'Acceso = (TokenValido OR ClaveMaestra) AND NOT(UsuarioBloqueado). Si TokenValido = FALSO, ClaveMaestra = VERDADERO y UsuarioBloqueado = VERDADERO, ¿cuál es el resultado de Acceso?',
    options: [
      'VERDADERO',
      'FALSO',
      'Indeterminado',
      'Error de ejecución'
    ],
    correctAnswer: 1,
    explanation: '(FALSO OR VERDADERO) = VERDADERO. Pero NOT(VERDADERO) = FALSO. Luego: VERDADERO AND FALSO = FALSO.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-005',
    category: 'logica',
    title: 'Eficiencia de algoritmos de búsqueda (Búsqueda Binaria)',
    type: 'multiple_choice',
    context: 'En una lista ordenada de 1.024 elementos, ¿cuál es el número máximo de comparaciones requeridas por el algoritmo de búsqueda binaria en el peor de los casos?',
    options: [
      '10 comparaciones',
      '512 comparaciones',
      '1.024 comparaciones',
      '32 comparaciones'
    ],
    correctAnswer: 0,
    explanation: 'La complejidad de búsqueda binaria es O(log2 n). log2(1024) = 10 comparaciones máximas.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-006',
    category: 'logica',
    title: 'Recursividad y caso base en funciones',
    type: 'multiple_choice',
    context: `FUNCION misterio(n):\n  SI (n <= 1) RETORNAR 1\n  SINO RETORNAR n * misterio(n - 1)\nFIN FUNCION\n¿Qué calcula esta función y qué valor retorna para misterio(4)?`,
    options: [
      'Calcula la sumatoria y retorna 10',
      'Calcula la potencia de 2 y retorna 16',
      'Calcula el factorial y retorna 24',
      'Entra en bucle infinito'
    ],
    correctAnswer: 2,
    explanation: 'Es la función factorial: 4! = 4 * 3 * 2 * 1 = 24.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-007',
    category: 'logica',
    title: 'Estructuras de datos lineales: Pilas vs Colas',
    type: 'multiple_choice',
    context: 'Un desarrollador ingresa secuencialmente las letras A, B, C y D a una estructura de datos. Al extraerlas, salen en el orden D, C, B, A. ¿Qué estructura de datos se utilizó?',
    options: [
      'Cola (FIFO - First In, First Out)',
      'Pila (LIFO - Last In, First Out)',
      'Árbol binario balanceado',
      'Tabla hash'
    ],
    correctAnswer: 1,
    explanation: 'Una Pila (Stack) opera bajo la política LIFO: el último elemento en entrar (D) es el primero en salir.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-008',
    category: 'logica',
    title: 'Detección de condiciones de carrera y bucles infinitos',
    type: 'multiple_choice',
    context: `x = 10;\nMIENTRAS (x != 0) HACER\n   x = x - 2;\n   SI (x == 4) ENTONCES x = x + 2;\nFIN MIENTRAS\n¿Qué sucederá con la ejecución?`,
    options: [
      'Termina normalmente en 5 iteraciones',
      'Genera un bucle infinito oscilando en x = 6 y x = 4',
      'Arroja excepción de desbordamiento de pila',
      'Termina cuando x es menor que cero'
    ],
    correctAnswer: 1,
    explanation: 'Cuando x llega a 6, se resta 2 (queda en 4), entra al condicional y suma 2 (vuelve a 6), repitiéndose infinitamente.',
    difficulty: 'dificil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-009',
    category: 'logica',
    title: 'Análisis de diagramas de flujo y bifurcación',
    type: 'multiple_choice',
    context: 'En un proceso de cobro, si el cliente es VIP se aplica 20% de descuento. Si además paga en efectivo, se aplica un 5% adicional sobre el subtotal ya descontado. Si la compra es de $100.000, ¿cuánto paga el cliente VIP en efectivo?',
    options: [
      '$75.000',
      '$76.000',
      '$80.000',
      '$74.000'
    ],
    correctAnswer: 1,
    explanation: 'Descuento VIP del 20%: $100.000 - $20.000 = $80.000. Descuento 5% sobre el nuevo subtotal: $80.000 * 0.05 = $4.000. Total final: $80.000 - $4.000 = $76.000.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-010',
    category: 'logica',
    title: 'Diseño algorítmico: Validación de contraseña segura',
    type: 'open_ended',
    context: 'Diseñe el pseudocódigo o explique la lógica paso a paso para verificar que una contraseña ingresada por el usuario cumpla con las siguientes 3 condiciones: 1) Longitud mínima de 8 caracteres, 2) Contener al menos un número, y 3) Contener al menos una letra mayúscula.',
    options: [],
    correctAnswer: 0,
    sampleAnswer: 'Verificar longitud (longitud(clave) >= 8). Inicializar banderas tieneNumero = falso, tieneMayuscula = falso. Recorrer cada carácter de la clave en un ciclo: si el carácter es dígito numérico (0-9) activar tieneNumero = verdadero; si está entre A-Z activar tieneMayuscula = verdadero. Al finalizar el ciclo, si longitud >= 8 Y tieneNumero Y tieneMayuscula retornar Válido, de lo contrario Inválido.',
    explanation: 'El algoritmo debe evaluar longitud mínima, iterar la cadena mediante bucle para inspeccionar caracteres y activar banderas booleanas para números y mayúsculas.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },

  // ==========================================
  // --- ÁREA 2: ANÁLISIS MATEMÁTICO (10 PREGUNTAS) ---
  // ==========================================
  {
    id: 'mat-001',
    category: 'matematicas',
    title: 'Regla de tres compuesta en renderizado de software',
    type: 'multiple_choice',
    context: 'Si 4 servidores en paralelo tardan 6 horas en procesar 1.200 imágenes de un modelo de visión artificial, ¿cuántas horas tardarán 8 servidores idénticos en procesar 2.400 imágenes?',
    options: [
      '3 horas',
      '6 horas',
      '8 horas',
      '12 horas'
    ],
    correctAnswer: 1,
    explanation: 'Se duplica el número de servidores (factor x2) pero también se duplica el número de imágenes (factor x2). El tiempo se mantiene en 6 horas.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-002',
    category: 'matematicas',
    title: 'Porcentajes y optimización de base de datos',
    type: 'multiple_choice',
    context: 'Una consulta SQL a una base de datos tardaba inicialmente 800 milisegundos. Tras indexar las tablas, el tiempo se redujo a 160 milisegundos. ¿Cuál fue el porcentaje de optimización y reducción de tiempo?',
    options: [
      '60%',
      '75%',
      '80%',
      '85%'
    ],
    correctAnswer: 2,
    explanation: 'Reducción = 800 - 160 = 640 ms. Porcentaje de reducción: (640 / 800) * 100 = 80%.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-003',
    category: 'matematicas',
    title: 'Proporcionalidad inversa en consumo de ancho de banda',
    type: 'multiple_choice',
    context: 'Un archivo de instalación de software de 2.4 Gigabytes se descarga en 8 minutos con una conexión de 40 Mbps. Si la velocidad de la conexión aumenta a 160 Mbps, ¿cuánto tardará la descarga?',
    options: [
      '1 minuto',
      '2 minutos',
      '4 minutos',
      '6 minutos'
    ],
    correctAnswer: 1,
    explanation: 'La velocidad y el tiempo son inversamente proporcionales: (40 Mbps * 8 min) / 160 Mbps = 320 / 160 = 2 minutos.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-004',
    category: 'matematicas',
    title: 'Ecuación lineal de costos de infraestructura Cloud',
    type: 'multiple_choice',
    context: 'Un proveedor de nube cobra un costo fijo de $50 USD mensuales más $0,05 USD por cada gigabyte transferido. Si una empresa pagó una factura total de $175 USD en un mes, ¿cuántos gigabytes transfirió?',
    options: [
      '1.500 GB',
      '2.000 GB',
      '2.500 GB',
      '3.000 GB'
    ],
    correctAnswer: 2,
    explanation: 'Costo = 50 + 0.05 * GB = 175. 0.05 * GB = 125. GB = 125 / 0.05 = 2.500 GB.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-005',
    category: 'matematicas',
    title: 'Conversión de unidades de almacenamiento digital',
    type: 'multiple_choice',
    context: 'Un disco de estado sólido tiene 16 Gigabytes disponibles para almacenamiento. Si un log del sistema ocupa 512 Kilobytes diarios, ¿para cuántos días de logs alcanza el espacio libre? (Considere 1 GB = 1.024 MB = 1.048.576 KB).',
    options: [
      '16.384 días',
      '32.768 días',
      '8.192 días',
      '65.536 días'
    ],
    correctAnswer: 1,
    explanation: '16 GB = 16 * 1.048.576 KB = 16.777.216 KB. Días = 16.777.216 / 512 = 32.768 días.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-006',
    category: 'matematicas',
    title: 'Probabilidad de disponibilidad y redundancia de servidores',
    type: 'multiple_choice',
    context: 'Un sistema crítico opera con dos servidores redundantes independientes. La probabilidad de que un servidor falle en un día dado es del 10% (0,1). ¿Cuál es la probabilidad de que ambos servidores fallen simultáneamente el mismo día?',
    options: [
      '20% (0,2)',
      '1% (0,01)',
      '5% (0,05)',
      '0,1% (0,001)'
    ],
    correctAnswer: 1,
    explanation: 'Para eventos independientes: P(A y B) = P(A) * P(B) = 0,1 * 0,1 = 0,01 = 1%.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-007',
    category: 'matematicas',
    title: 'Álgebra de matrices y dimensiones de arreglos bidimensionales',
    type: 'multiple_choice',
    context: 'Una imagen digital monocromática tiene una resolución de 1.920 columnas por 1.080 filas de pixeles. Si cada pixel se representa con 1 byte (8 bits en escala de grises), ¿cuál es el tamaño exacto en megabytes (MB) no comprimido? (Use 1 MB = 1.048.576 bytes).',
    options: [
      'Aprox. 1,98 MB',
      'Aprox. 2,50 MB',
      'Aprox. 0,95 MB',
      'Aprox. 3,14 MB'
    ],
    correctAnswer: 0,
    explanation: 'Total bytes = 1.920 * 1.080 = 2.073.600 bytes. 2.073.600 / 1.048.576 = 1,977 MB (aprox. 1,98 MB).',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-008',
    category: 'matematicas',
    title: 'Cálculo de descuento comercial sucesivo en licencias',
    type: 'multiple_choice',
    context: 'Un paquete de software para desarrollo tiene un precio de catálogo de $200 USD. El distribuidor ofrece un descuento del 20% para centros educativos y un 10% de descuento adicional por pronto pago sobre el valor neto. ¿Cuál es el precio final?',
    options: [
      '$140 USD',
      '$144 USD',
      '$150 USD',
      '$160 USD'
    ],
    correctAnswer: 1,
    explanation: 'Primer descuento del 20%: $200 * 0.80 = $160 USD. Segundo descuento del 10% sobre $160: $160 * 0.90 = $144 USD.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-009',
    category: 'matematicas',
    title: 'Velocidad de procesamiento y rendimiento de microprocesador',
    type: 'multiple_choice',
    context: 'Un microprocesador ejecuta 3.000 millones de ciclos de reloj por segundo (3 GHz). Si una instrucción compleja de software requiere un promedio de 6 ciclos para completarse, ¿cuántas de estas instrucciones puede ejecutar el procesador en un segundo?',
    options: [
      '500 millones de instrucciones',
      '18.000 millones de instrucciones',
      '2.000 millones de instrucciones',
      '600 millones de instrucciones'
    ],
    correctAnswer: 0,
    explanation: 'Instrucciones por segundo = (3.000.000.000 ciclos/segundo) / 6 ciclos = 500.000.000 (500 millones / 500 MIPS).',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mat-010',
    category: 'matematicas',
    title: 'Planteamiento matemático: Dimensionamiento de almacenamiento Cloud',
    type: 'open_ended',
    context: 'Una aplicación bancaria proyecta registrar 50.000 transacciones diarias en su primer año. Cada transacción genera un registro en base de datos de 2 Kilobytes (KB). Plantee la fórmula matemática y calcule cuántos Gigabytes (GB) de almacenamiento se requerirán para almacenar el histórico completo de transacciones durante un año de 365 días.',
    options: [],
    sampleAnswer: 'Total diario = 50.000 transacciones * 2 KB = 100.000 KB/día. Total anual = 100.000 KB * 365 días = 36.500.000 KB anuales. Para convertir a GB: 36.500.000 KB / (1.024 * 1.024) = 34.80 GB (o dividiendo entre 1.000.000 = 36.5 GB en base decimal). Se requerirán aproximadamente 35 a 36.5 GB.',
    explanation: 'Se debe multiplicar el número de transacciones por el tamaño unitario, luego por los 365 días del año y realizar la conversión de Kilobytes a Gigabytes dividiendo por 1024^2 (o 10^6).',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },

  // ==========================================
  // --- ÁREA 3: COMPRENSIÓN LECTORA TÉCNICA Y CRÍTICA (10 PREGUNTAS CON TEXTOS REALES) ---
  // ==========================================
  {
    id: 'com-001',
    category: 'comprension',
    title: 'Comprensión de Lectura: "No Silver Bullet" y la Esencia del Software',
    type: 'multiple_choice',
    context: `FUENTE: Frederick P. Brooks Jr. (1986). "No Silver Bullet: Essence and Accidents of Software Engineering". IEEE Computer, Vol. 19, No. 4, pp. 10-19.

«De todas las creaciones del ser humano, el software es probablemente la más intrínsecamente compleja respecto a su tamaño. Ninguna bala de plata existe: no hay ningún desarrollo individual, tecnológico ni de gestión que por sí solo prometa mejoras de productividad, fiabilidad y simplicidad de un orden de magnitud en el lapso de una década.

La dificultad fundamental del software radica en su esencia intrínseca: la complejidad de modelar conceptos abstractos entrelazados, la conformidad forzada a interfaces humanas e institucionales arbitrarias, la mutabilidad continua exigida por el entorno operativo y la invisibilidad inherente de su estructura conceptual. La mayoría de las innovaciones tecnológicas modernas han atacado los accidentes del desarrollo (como la lentitud de los compiladores o la sintaxis rígida de los lenguajes de programación), pero la dificultad esencial siempre residirá en concebir la arquitectura conceptual sin fisuras.»

PREGUNTA DE ANÁLISIS:
Según la tesis de Brooks en "No Silver Bullet", ¿cuál es la razón primordial por la cual ninguna herramienta ni lenguaje de programación milagroso puede resolver por completo la complejidad del desarrollo de software?`,
    options: [
      'Porque los lenguajes de programación modernos quedan obsoletos en lapsos inferiores a una década.',
      'Porque la dificultad medular radica en la complejidad conceptual abstracta del software (su esencia), y no meramente en las dificultades operativas de codificación y herramientas (los accidentes).',
      'Porque los clientes comerciales se rehúsan a pagar licencias de software privativo en el mercado.',
      'Porque los procesadores físicos de silicio han alcanzado su límite de velocidad de reloj.'
    ],
    correctAnswer: 1,
    explanation: 'Brooks demuestra que las herramientas y lenguajes resuelven dificultades accidentales (compilación, sintaxis), pero la dificultad esencial del software reside en la complejidad inherente de modelar conceptos lógicos entrelazados y abstractos.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'com-002',
    category: 'comprension',
    title: 'Comprensión de Lectura: El Manifiesto por el Desarrollo Ágil de Software',
    type: 'multiple_choice',
    context: `FUENTE: Manifiesto por el Desarrollo Ágil de Software (Snowbird, Utah, 2001). Suscrito por Kent Beck, Martin Fowler, Robert C. Martin, Jeff Sutherland, Ward Cunningham, et al.

«Estamos descubriendo formas mejores de desarrollar software tanto por nuestra propia experiencia como ayudando a terceros. A través de este trabajo hemos aprendido a valorar:

• Individuos e interacciones sobre procesos y herramientas.
• Software funcionando sobre documentación extensiva.
• Colaboración con el cliente sobre negociación contractual.
• Respuesta ante el cambio sobre seguir un plan.

Esto es, aunque reconocemos el valor de los elementos de la derecha, valoramos mucho más los elementos de la izquierda.»

PREGUNTA DE ANÁLISIS:
A partir de la lectura rigurosa de la declaración final del Manifiesto Ágil, ¿qué postura adopta el enfoque ágil respecto a la documentación técnica formal y los contratos?`,
    options: [
      'Determina que la documentación técnica y los contratos son prácticas obsoletas que deben prohibirse en todo proyecto tecnológico.',
      'Reconoce expresamente que los contratos y la documentación poseen valor, pero prioriza el software operable y la colaboración directa con el cliente por encima de ellos.',
      'Exige redactar toda la documentación técnica y firmar contratos cerrados antes de autorizar la escritura de una sola línea de código.',
      'Sostiene que apegarse rígidamente a un plan prefijado es el único indicador confiable de madurez organizacional.'
    ],
    correctAnswer: 1,
    explanation: 'La frase aclaratoria final del Manifiesto («aunque reconocemos el valor de los elementos de la derecha, valoramos mucho más los elementos de la izquierda») ratifica que los contratos y la documentación son válidos, pero subordinados a la colaboración y la entrega continua de valor funcional.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'com-003',
    category: 'comprension',
    title: 'Comprensión de Lectura: Régimen de Protección de Datos Personales (Ley 1581 de 2012)',
    type: 'multiple_choice',
    context: `FUENTE: Congreso de la República de Colombia. Ley Estatutaria 1581 de 2012 ("Por la cual se dictan disposiciones generales para la protección de datos personales").

«Artículo 9°. Autorización del Titular. Sin perjuicio de las excepciones previstas en la ley, en el Tratamiento se requiere la autorización previa e informada del Titular, la cual deberá ser obtenida por cualquier medio que pueda ser objeto de consulta posterior.

Artículo 12. Deber de informar al Titular. El Responsable del Tratamiento, al momento de solicitar al Titular la autorización, deberá informarle de manera clara y expresa:
a) El Tratamiento al cual serán sometidos sus datos personales y la finalidad del mismo;
b) El carácter facultativo de la respuesta a las preguntas que le sean hechas, cuando estas versen sobre datos sensibles o sobre los datos de niñas, niños y adolescentes;
c) Los derechos que le asisten como Titular;
d) La identificación, dirección física o electrónica y teléfono del Responsable del Tratamiento.»

PREGUNTA DE ANÁLISIS:
De acuerdo con los artículos 9° y 12 de la Ley 1581 de 2012, ¿qué requisito arquitectónico y legal debe implementar obligatoriamente un desarrollador en el flujo de registro de usuarios de una plataforma digital en Colombia?`,
    options: [
      'Almacenar obligatoriamente las contraseñas en texto claro para facilitar la auditoría de los titulares.',
      'Capturar obligatoriamente datos sensibles de afiliación política y religiosa para autorizar el acceso al sistema.',
      'Implementar un mecanismo demostrable y auditable de consentimiento previo e informado que comunique con claridad la finalidad antes de capturar y almacenar datos del usuario.',
      'Impedir que el usuario pueda consultar, modificar o revocar los datos que la plataforma ha guardado sobre él.'
    ],
    correctAnswer: 2,
    explanation: 'La Ley 1581 de 2012 exige que todo tratamiento de datos cuente con autorización previa, expresa e informada del titular, con indicación clara de la finalidad y trazabilidad que permita su consulta posterior.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'com-004',
    category: 'comprension',
    title: 'Comprensión de Lectura: Semántica del Protocolo HTTP (Estándar IETF RFC 9110)',
    type: 'multiple_choice',
    context: `FUENTE: Internet Engineering Task Force (IETF). RFC 9110: "HTTP Semantics" (Standards Track, 2022). Section 15.5: Client Error 4xx.

«La clase 4xx de códigos de estado indica que el cliente parece haber cometido un error. Excepto cuando responda a una petición HEAD, el servidor DEBE enviar una representación que contenga una explicación de la situación de error.

• 15.5.2. 401 Unauthorized: La solicitud no ha sido aplicada porque carece de credenciales de autenticación válidas para el recurso de destino. El servidor que genera una respuesta 401 DEBE enviar al menos un desafío aplicable en el encabezado WWW-Authenticate.

• 15.5.4. 403 Forbidden: El servidor entendió la solicitud pero se rehúsa a autorizarla. A diferencia del código 401, el cliente ya ha suministrado credenciales de autenticación (o no se requieren), pero no cuenta con los derechos de acceso necesarios para el contenido. Re-intentar la solicitud con las mismas credenciales no tendrá éxito.»

PREGUNTA DE ANÁLISIS:
Según el estándar IETF RFC 9110, ¿cuál es la diferencia semántica fundamental entre los códigos de respuesta HTTP 401 y HTTP 403?`,
    options: [
      'El código 401 indica una falla crítica de hardware en el servidor web, mientras que el 403 indica que la base de datos se encuentra fuera de línea.',
      'El código 401 señala falta de credenciales de autenticación válidas (el sistema desconoce la identidad del cliente), mientras que el 403 indica que, aun conociendo su identidad, el usuario carece de permisos de autorización para acceder al recurso.',
      'El código 401 es una redirección temporal automática (3xx) y el 403 es una respuesta de éxito con contenido cacheado (2xx).',
      'No existe ninguna diferencia funcional entre ambos códigos; representan exactamente el mismo estado en cualquier API RESTful moderna.'
    ],
    correctAnswer: 1,
    explanation: 'El estándar RFC 9110 distingue con exactitud: el 401 responde a la falta o invalidez de autenticación (¿quién eres?), mientras que el 403 responde a una denegación de autorización/permisos (sé quién eres, pero no tienes acceso concedido).',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'com-005',
    category: 'comprension',
    title: 'Comprensión de Lectura: "La Catedral y el Bazar" y la Ley de Linus',
    type: 'multiple_choice',
    context: `FUENTE: Eric S. Raymond (1999). "The Cathedral and the Bazaar: Musings on Linux and Open Source by an Accidental Revolutionary". O'Reilly Media.

«En el modelo tradicional de la Catedral, el software es cuidadosamente concebido por magos individuales o un reducido gremio de sabios trabajando en espléndido aislamiento, liberando artefactos solo tras largos periodos de prueba hermética.

En el Bazar, en cambio, el desarrollo se desenvuelve en un bullicio abierto, donde diversos enfoques y agendas compiten y colaboran libremente en Internet. Linus Torvalds demostró que tratar a los usuarios como colaboradores activos es el camino más rápido para depurar y pulir código. De allí formulé la que denomino la Ley de Linus: "Dados suficientes ojos, todos los errores resultan superficiales" (Given enough eyeballs, all bugs are shallow). Cuando miles de desarrolladores examinan el código desde diferentes ángulos, el defecto que desconcierta a una persona es inmediatamente obvio para otra.»

PREGUNTA DE ANÁLISIS:
Según el ensayo de Eric S. Raymond, ¿en qué principio epistemológico y operativo se fundamenta la "Ley de Linus" para garantizar la calidad del software de código abierto?`,
    options: [
      'En la creencia de que un único programador superdotado es capaz de escribir software perfecto sin necesidad de pruebas.',
      'En la diversidad e inspección masiva y descentralizada de una comunidad colaborativa, donde la multiplicidad de miradas acelera la detección y corrección de anomalías.',
      'En que mantener el código en absoluto secreto previene que los atacantes informáticos encuentren vulnerabilidades.',
      'En restringir el número de colaboradores a un máximo de tres personas para evitar discusiones en los repositorios.'
    ],
    correctAnswer: 1,
    explanation: 'La Ley de Linus descansa en el poder de la revisión por pares masiva y descentralizada: una amplia base de probadores y desarrolladores heterogéneos detecta y subsana fallas mucho más rápido que un equipo cerrado.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'com-006',
    category: 'comprension',
    title: 'Comprensión de Lectura: "The Mythical Man-Month" y la Ley de Brooks',
    type: 'multiple_choice',
    context: `FUENTE: Frederick P. Brooks Jr. (1975). "The Mythical Man-Month: Essays on Software Engineering". Addison-Wesley Publishing Company.

«El hombre y el mes son unidades intercambiables únicamente cuando una tarea puede distribuirse entre muchos trabajadores sin requerir ninguna comunicación entre ellos, tal como ocurre al segar trigo o desgranar maíz. Cuando una tarea compleja requiere coordinación secuencial e iterativa, el esfuerzo de comunicación interhumana domina el tiempo total.

Al incorporar nuevos ingenieros a un equipo de software en marcha, los desarrolladores experimentados deben desviar horas de trabajo productivo para instruir a los recién llegados. Adicionalmente, el número de canales potenciales de comunicación interpersonal crece de acuerdo con la relación cuadrática n(n - 1) / 2, donde 'n' es el número de personas. De estas observaciones deviene la Ley de Brooks: "Añadir más personal a un proyecto de software retrasado hace que se retrase todavía más" (Adding manpower to a late software project makes it later).»

PREGUNTA DE ANÁLISIS:
A partir del texto de Fred Brooks, ¿por qué la incorporación tardía de nuevos desarrolladores incrementa el retraso de un proyecto de software en lugar de acelerarlo?`,
    options: [
      'Porque los nuevos ingenieros contratados suelen dañar deliberadamente la base de datos de producción.',
      'Porque la capacitación inicial desvía horas productivas del personal veterano y los canales de comunicación interna crecen de manera cuadrática, sobrecargando la coordinación.',
      'Porque las computadoras de la empresa reducen a la mitad su capacidad de cómputo cuando aumenta el personal de oficina.',
      'Porque la contratación de nuevos empleados agota automáticamente el presupuesto de licencias de software libre.'
    ],
    correctAnswer: 1,
    explanation: 'El texto explica los dos factores clave: 1) el costo de inducción que distrae a los desarrolladores expertos, y 2) el crecimiento cuadrático de los canales de comunicación interpersonal n(n-1)/2, elevando los costos de coordinación.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'com-007',
    category: 'comprension',
    title: 'Comprensión de Lectura: Requerimientos de Software según Norma ISO/IEC/IEEE 29148',
    type: 'multiple_choice',
    context: `FUENTE: Organización Internacional de Normalización (ISO) / Institute of Electrical and Electronics Engineers (IEEE). Norma Internacional ISO/IEC/IEEE 29148:2018: "Systems and software engineering — Life cycle processes — Requirements engineering".

«Sección 5.2.5: Criterios de Calidad para Enunciados de Requerimientos.
Un requerimiento técnico bien especificado debe poseer las siguientes propiedades indispensables:

1. Inequívoco (Unambiguous): Posee una única interpretación rigurosa tanto para el equipo de desarrollo como para los usuarios y evaluadores.
2. Verificable (Verifiable): Existe un procedimiento técnico finito, objetivo y medible (a través de inspección, análisis o pruebas cuantitativas) para comprobar fehacientemente si el software entregado satisface el criterio estipulado.
3. Coherente (Consistent): No contradice ninguna otra especificación del sistema.

El uso de adjetivos subjetivos no cuantificados tales como "rápido", "amigable", "robusto", "moderno" o "eficiente" invalida la verificabilidad de un requerimiento técnico.»

PREGUNTA DE ANÁLISIS:
Según la norma ISO/IEC/IEEE 29148, ¿cuál de los siguientes enunciados cumple plenamente con los criterios de ser un requerimiento de software NO AMBIGUO y VERIFICABLE?`,
    options: [
      '«El portal web institucional deberá cargar sus módulos con una rapidez insuperable para el usuario.»',
      '«La interfaz de registro de aspirantes será sumamente amigable, intuitiva y visualmente llamativa.»',
      '«El módulo de liquidación de nómina cometerá el mínimo número posible de fallos durante los fines de semana.»',
      '«El servicio de procesamiento de pagos responderá a las peticiones POST /transacciones en un tiempo menor o igual a 400 milisegundos bajo una concurrencia de 2.000 usuarios simultáneos.»'
    ],
    correctAnswer: 3,
    explanation: 'La opción 4 contiene un endpoint definido (POST /transacciones), un umbral numérico medible (≤400 ms) y una condición de prueba concreta (2.000 usuarios simultáneos), lo que la hace objetivamente comprobable mediante pruebas de rendimiento.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'com-008',
    category: 'comprension',
    title: 'Comprensión de Lectura: Vulnerabilidades de Inyección según la Fundación OWASP',
    type: 'multiple_choice',
    context: `FUENTE: Open Web Application Security Project (OWASP). "OWASP Top 10:2021 — A03: Injection". OWASP Foundation Technical Documentation.

«Las fallas de inyección ocurren cuando datos hostiles no validados son enviados a un intérprete sintáctico como parte de un comando o consulta. Los datos proporcionados por el atacante inducen al intérprete a ejecutar instrucciones imprevistas o a acceder a datos confidenciales sin la debida autorización.

La inyección SQL (SQLi) ocurre prevalentemente cuando los desarrolladores concatenan cadenas de texto recibidas de formularios web directamente en la estructura de consultas SQL. La mitigación primaria fundamental consiste en el uso sistemático de Consultas Parametrizadas (Prepared Statements). En una consulta parametrizada, el motor de la base de datos compila la sintaxis SQL de antemano; en consecuencia, cualquier parámetro suministrado por el usuario es tratado estrictamente como un valor de datos literal, haciendo imposible que caracteres especiales (como comillas o guiones) alteren la lógica de la instrucción.»

PREGUNTA DE ANÁLISIS:
Con base en el documento técnico de OWASP, ¿cuál es el mecanismo técnico exacto por el cual las Consultas Parametrizadas (Prepared Statements) neutralizan los ataques de inyección SQL?`,
    options: [
      'Desconectar los cables de red de los servidores de bases de datos para evitar que reciban tráfico exterior.',
      'Separar de forma estricta la estructura de código ejecutable de los datos del usuario, haciendo que el motor trate la entrada estrictamente como valores literales inofensivos.',
      'Guardar todas las credenciales de usuarios en archivos de texto plano sin ningún tipo de cifrado o hashing.',
      'Obligar a los usuarios a escribir sus consultas de búsqueda únicamente en números romanos.'
    ],
    correctAnswer: 1,
    explanation: 'El texto de OWASP enfatiza que las sentencias preparadas compilan la estructura SQL previamente, forzando a que cualquier dato introducido sea evaluado exclusivamente como un valor literal y jamás como código interpretable.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'com-009',
    category: 'comprension',
    title: 'Comprensión de Lectura: Ética de la Inteligencia Artificial (UNESCO)',
    type: 'multiple_choice',
    context: `FUENTE: Organización de las Naciones Unidas para la Educación, la Ciencia y la Cultura (UNESCO). "Recomendación sobre la Ética de la Inteligencia Artificial" (Aprobada por la Conferencia General en su 41.ª reunión, París, 2021).

«Área de Acción 2: Transparencia y Explicabilidad (Párrafos 38-41).
Las personas tienen el derecho inalienable de ser informadas cuando una decisión de gran relevancia jurídica, económica o social —como el acceso al empleo, a la justicia penal, a préstamos financieros o a la admisión en programas de educación formal— es adoptada mediante algoritmos o sustentada en predicciones de sistemas de Inteligencia Artificial.

Los Estados Miembros y las organizaciones deben velar por que los modelos sean explicables: no basta con el cálculo estadístico opaco de una "caja negra". Los individuos afectados deben tener acceso a explicaciones inteligibles sobre los factores y ponderaciones que determinaron el resultado, así como el derecho a la revisión humana sustantiva y a la impugnación de decisiones perjudiciales o sesgadas.»

PREGUNTA DE ANÁLISIS:
De acuerdo con la Recomendación de la UNESCO sobre la Ética de la Inteligencia Artificial, ¿qué garantía fundamental asiste a un ciudadano cuya postulación a un empleo o institución educativa haya sido evaluada o rechazada por un algoritmo predictivo?`,
    options: [
      'Aceptar sumisamente el veredicto del algoritmo, reconociendo que los modelos matemáticos carecen de fallos humanos.',
      'El derecho a conocer los factores y ponderaciones determinantes del resultado, a recibir una explicación inteligible y a solicitar una revisión humana sustantiva e impugnable.',
      'La obligación de abonar una tasa económica a la entidad para poder apelar el resultado automatizado.',
      'La renuncia obligatoria a sus derechos ciudadanos para poder participar en procesos de selección tecnológicos.'
    ],
    correctAnswer: 1,
    explanation: 'La recomendación internacional consagra expresamente el derecho a la transparencia, explicabilidad del modelo y acceso a impugnación y revisión humana significativa cuando las decisiones automatizadas afecten oportunidades vitales.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'com-010',
    category: 'comprension',
    title: 'Comprensión de Lectura y Caso de Análisis: Licencias MIT vs. GNU GPLv3 en Software',
    type: 'open_ended',
    context: `FUENTE: Free Software Foundation (FSF) & Open Source Initiative (OSI). "Análisis Comparativo de Modelos de Licenciamiento: Copyleft Recíproco vs. Licencias Permisivas".

«En la ingeniería de software actual, la integración de componentes de código abierto se rige principalmente por dos paradigmas jurídicos:

1. Licencias Permisivas (ej. Licencia MIT, Apache 2.0, BSD): Otorgan amplias libertades de uso, modificación, distribución y sublicenciamiento. Permiten explícitamente incorporar el código en proyectos comerciales privativos de código cerrado, con la condición mínima de conservar el aviso de derechos de autor (copyright) y el descargo de responsabilidad original en el producto.

2. Licencias con Copyleft Fuerte (ej. GNU General Public License v3 - GPLv3): Tienen como objetivo garantizar que el software y sus derivados sigan siendo libres perpetuamente. Su principio rector es la reciprocidad (denominado comúnmente efecto derivativo o hereditario): si un programa incorpora o enlaza código bajo GPLv3 y es distribuido a terceros, la totalidad de la obra derivada debe liberarse y distribuirse obligatoriamente bajo los términos idénticos de la licencia GPLv3, lo que exige suministrar el código fuente completo a los usuarios.

CASO DE APLICACIÓN PROFESIONAL:
Una empresa colombiana de tecnología desarrolla una plataforma contable y tributaria de carácter comercial y de código cerrado (privativo) para vender licencias a entidades financieras. Durante la fase de desarrollo, uno de los programadores propone integrar una librería de procesamiento criptográfico distribuida bajo licencia GNU GPLv3.»

CONSIGNA DE RESPUESTA:
A partir de la lectura del texto técnico, analice qué consecuencia jurídica y contractual enfrentaría la empresa si integra dicha librería en su producto comercial cerrado, y qué tipo de licencia de código abierto deberían haber exigido para proteger su modelo privativo.`,
    options: [],
    sampleAnswer: 'Si la empresa incorpora una librería gobernada por la licencia GNU GPLv3 dentro de su plataforma contable comercial y la distribuye a clientes, se activa la cláusula de reciprocidad (copyleft hereditario) de la GPLv3. Esto obligaría legalmente a la empresa a liberar la totalidad del código fuente de su plataforma privada bajo la misma licencia GPLv3, destruyendo su modelo de negocio privativo de software cerrado o incurriendo en una infracción grave de propiedad intelectual. Para proteger su código y conservar el modelo comercial cerrado, los desarrolladores debieron seleccionar librerías regidas por licencias permisivas (como MIT, Apache 2.0 o BSD), las cuales permiten explícitamente el uso, integración y distribución en software propietario comercial siempre que se mantenga el aviso de copyright original.',
    explanation: 'El aspirante debe contrastar las implicaciones del copyleft recíproco de la GPLv3 frente a licencias permisivas (MIT/Apache), reconociendo que la GPLv3 fuerza la liberación del código fuente de obras derivadas distribuidas y que las licencias permisivas son las adecuadas para software comercial privativo.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },

  // ==========================================
  // --- ÁREA 4: TEST PSICOLÓGICO Y PERFIL VOCACIONAL (10 PREGUNTAS) ---
  // ==========================================
  {
    id: 'psi-001',
    category: 'psicologico',
    title: 'Gestión de la frustración ante errores de código (Bugs persistentes)',
    type: 'multiple_choice',
    context: 'Llevas 3 horas intentando solucionar un error de compilación que no te permite avanzar en el proyecto y faltan pocas horas para la entrega. ¿Cuál es tu reacción más asertiva y profesional?',
    options: [
      'Cerrar el computador con enfado y culpar a las herramientas de desarrollo',
      'Hacer una pausa breve de despeje mental, revisar metódicamente los logs de error, aislar el componente y consultar la documentación o a un compañero de equipo',
      'Borrar todo el código y comenzar desde cero de manera desorganizada',
      'Ocultar el componente que falla para que nadie note el error en la entrega'
    ],
    correctAnswer: 1,
    explanation: 'El pensamiento computacional y la madurez profesional exigen calma, aislamiento metódico del problema y disposición para buscar apoyo colaborativo.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'psi-002',
    category: 'psicologico',
    title: 'Trabajo colaborativo y resolución de conflictos en equipos ágiles',
    type: 'multiple_choice',
    context: 'Durante la reunión diaria de Scrum (Daily), un compañero de equipo critica duramente tu código frente a todos de manera poco constructiva. ¿Cómo actúas?',
    options: [
      'Responder con insultos y atacarlo señalando los errores que él ha cometido en el sprint',
      'Mantener la compostura, agradecer la retroalimentación técnica y solicitarle una sesión de trabajo conjunta (pair programming) para revisar sugerencias de mejora con datos objetivos',
      'Quedarte en silencio y no volver a hablarle durante todo el proyecto',
      'Abandonar la reunión y quejarte inmediatamente con la alta gerencia'
    ],
    correctAnswer: 1,
    explanation: 'La inteligencia emocional y la comunicación asertiva transforman críticas en oportunidades técnicas constructivas sin escalar conflictos interpersonales.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'psi-003',
    category: 'psicologico',
    title: 'Ética profesional ante vulnerabilidad de seguridad en producción',
    type: 'multiple_choice',
    context: 'Mientras realizas mantenimiento a una base de datos de producción, descubres por accidente una brecha de seguridad que permite ver las contraseñas en texto plano. Nadie se ha percatado del problema. ¿Qué haces?',
    options: [
      'Aprovechar la brecha para copiar credenciales de cuentas de interés personal',
      'Ignorarlo porque no forma parte de tus tareas asignadas en el contrato',
      'Documentar de inmediato el hallazgo con evidencia técnica y reportarlo formalmente por los canales de seguridad autorizados para su mitigación prioritaria',
      'Publicar la falla en redes sociales para ganar seguidores en la comunidad'
    ],
    correctAnswer: 2,
    explanation: 'La confidencialidad, la ética y la protección de datos son pilares inquebrantables en el ejercicio del desarrollo de software profesional.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'psi-004',
    category: 'psicologico',
    title: 'Adaptabilidad y aprendizaje autónomo ante cambios tecnológicos',
    type: 'multiple_choice',
    context: 'El líder del proyecto anuncia que la empresa cambiará el lenguaje y marco de trabajo que dominas por una tecnología moderna que nunca has utilizado. ¿Cuál es tu postura?',
    options: [
      'Negarte a trabajar hasta que el equipo regrese al lenguaje que ya conoces',
      'Asumir el cambio como un reto de crecimiento profesional, investigando la documentación oficial, realizando tutoriales y adoptando buenas prácticas del nuevo ecosistema',
      'Presentar la renuncia porque aprender una herramienta nueva toma demasiado tiempo',
      'Continuar programando en el lenguaje anterior sin acatar las directrices'
    ],
    correctAnswer: 1,
    explanation: 'La industria del software evoluciona constantemente. La capacidad de desaprender y aprender de forma autónoma es la competencia más valorada en ADSO.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'psi-005',
    category: 'psicologico',
    title: 'Comunicación asertiva con usuarios y clientes no técnicos',
    type: 'multiple_choice',
    context: 'Un cliente manifiesta insatisfacción porque una función no hace lo que él esperaba, aunque técnicamente el código esté bien estructurado. ¿Cómo abordas la conversación?',
    options: [
      'Decirle con tecnicismos que él no entiende nada de programación y que el sistema está perfecto',
      'Escuchar con empatía sus necesidades, explicarle en lenguaje sencillo cómo funciona la herramienta y acordar los ajustes necesarios para cumplir sus expectativas',
      'Ignorar las observaciones del cliente y no contestar sus correos',
      'Modificar el código en vivo en producción sin hacer pruebas de regresión'
    ],
    correctAnswer: 1,
    explanation: 'El software existe para resolver necesidades humanas y de negocio. La empatía con el usuario final es clave en el ciclo de vida del desarrollo.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'psi-006',
    category: 'psicologico',
    title: 'Compromiso y responsabilidad ante fechas límite de entrega',
    type: 'multiple_choice',
    context: 'A dos días de la fecha de entrega acordada, calculas que no alcanzarás a terminar uno de los módulos secundarios asignados. ¿Qué decisión tomas?',
    options: [
      'Esperar hasta el último minuto de la entrega y poner pretextos sobre tu conexión a internet',
      'Avisar con anticipación a tu líder de equipo y proponer un plan de priorización: entregar el núcleo funcional estable y calendarizar el módulo secundario para el siguiente sprint',
      'Subir código incompleto con errores para fingir que terminaste a tiempo',
      'Culpar a tus compañeros de equipo por no ayudarte'
    ],
    correctAnswer: 1,
    explanation: 'La transparencia oportuna permite al equipo tomar decisiones de contingencia sin comprometer la confianza ni la estabilidad del producto.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'psi-007',
    category: 'psicologico',
    title: 'Cultura de calidad y pruebas de software (Testing)',
    type: 'multiple_choice',
    context: 'Un colega te dice: "No pierdas tiempo escribiendo pruebas unitarias ni documentando; si compila y no se cae de inmediato, súbelo a producción". ¿Cuál es tu criterio?',
    options: [
      'Estar totalmente de acuerdo, porque la documentación y las pruebas son una pérdida de tiempo',
      'Rechazar esa práctica, pues las pruebas automatizadas y la documentación garantizan la mantenibilidad, escalabilidad y evitan regresiones costosas a futuro',
      'Dejar de programar pruebas solo los días viernes',
      'Hacer pruebas únicamente cuando el cliente lo pague por separado'
    ],
    correctAnswer: 1,
    explanation: 'La deuda técnica generada por la falta de pruebas y documentación cuesta millones a la industria. Un buen desarrollador defiende la calidad.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'psi-008',
    category: 'psicologico',
    title: 'Recepción constructiva de retroalimentación en Code Review',
    type: 'multiple_choice',
    context: 'Un desarrollador senior rechaza tu Pull Request indicando que tu código tiene funciones de más de 100 líneas y nombres de variables poco claros. ¿Cómo reaccionas?',
    options: [
      'Tomarlo como un ataque personal y discutir argumentando que tu estilo es único',
      'Agradecer las observaciones, estudiar principios de código limpio (Clean Code) y refactorizar el código dividiéndolo en funciones más pequeñas y claras',
      'Hacer caso omiso y forzar el merge sin autorización',
      'Sentirte incompetente y abandonar la carrera'
    ],
    correctAnswer: 1,
    explanation: 'El code review es un mecanismo de aprendizaje mutuo. La humildad y la apertura a la mejora continua diferencian a un aprendiz exitoso.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'psi-009',
    category: 'psicologico',
    title: 'Manejo del estrés bajo presión de despliegues críticos',
    type: 'multiple_choice',
    context: 'Durante el lanzamiento de un sistema de facturación masiva, la pasarela de pagos rechaza el 50% de las transacciones y los teléfonos no paran de sonar. ¿Cuál es tu comportamiento?',
    options: [
      'Entrar en pánico, gritar en la sala de operaciones y buscar a quién culpar',
      'Mantener la serenidad, enfocarte en el protocolo de incidentes, activar rollback si es necesario, analizar los códigos de error en conjunto y comunicar el estado con objetividad',
      'Apagar el servidor principal para que dejen de entrar transacciones',
      'Irte a almorzar hasta que las cosas se calmen'
    ],
    correctAnswer: 1,
    explanation: 'El temple y el apego a protocolos de emergencia son indispensables en entornos de misión crítica en tecnología.',
    difficulty: 'facil',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  },
  {
    id: 'psi-010',
    category: 'psicologico',
    title: 'Resolución de dilema ético en desarrollo de software',
    type: 'open_ended',
    context: 'Un superior jerárquico te pide insertar en la aplicación una función oculta que capture la ubicación en tiempo real de los usuarios sin que ellos lo sepan ni lo autoricen, con el fin de comercializar esos datos con empresas de publicidad. Redacta de manera clara y profesional cuál sería tu respuesta a tu superior, qué argumentos legales y éticos sustentarían tu posición, y qué alternativas propondrías.',
    options: [],
    sampleAnswer: 'Mi respuesta sería declinar cortésmente pero con total firmeza la solicitud. Los argumentos son: 1) Legal: Viola la Ley 1581 de 2012 de protección de datos (Habeas Data), acarreando sanciones penales y millonarias multas para la empresa; 2) Ético: Traiciona la confianza de los usuarios y destruye la reputación de la organización si se llega a filtrar. Como alternativa profesional, propondría implementar un consentimiento explícito (opt-in) donde se explique de forma transparente el beneficio para el usuario y se le permita activar o desactivar la geolocalización voluntariamente.',
    explanation: 'El aspirante debe mostrar firmeza ética, conocimiento del marco legal (privacidad y consentimiento) y capacidad para proponer alternativas transparentes sin ceder a presiones indebidas.',
    difficulty: 'medio',
    targetGroup: 'ALL',
    createdAt: new Date().toISOString()
  }
];
