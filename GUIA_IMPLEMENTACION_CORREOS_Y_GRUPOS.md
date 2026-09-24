# Manual Técnico de Implementación: Envío de Correos y Control de Cupos por Grupo
## Convocatoria ADSO Fase 2 · SENA

Este documento detalla la implementación técnica del sistema de notificación por correo electrónico para los aspirantes y la gestión de cohortes limitadas a un máximo de 30 estudiantes por grupo.

---

## 1. Arquitectura de Envío de Correos Electrónicos

El sistema cuenta con un motor de despacho transaccional configurado en `server/emailService.ts` a través de la librería `nodemailer`.

### Variables de Entorno Configuradas
Las credenciales fueron incorporadas en el entorno del servidor y documentadas en `.env.example`:

| Variable | Valor Configurado | Propósito |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` | Servidor de salida SMTP de Google |
| `SMTP_PORT` | `465` | Puerto seguro SSL/TLS |
| `SMTP_USER` | `camiloherguz2020@gmail.com` | Cuenta de correo institucional / remitente |
| `SMTP_PASS` | `[Configurado en Secretos]` | Contraseña de aplicación de 16 caracteres de Google |
| `EMAIL_FROM` | `"Convocatoria ADSO Fase 2" <camiloherguz2020@gmail.com>` | Nombre visible y correo del remitente |

> **Nota de Seguridad:** La conexión fue verificada con éxito (`SMTP VERIFY SUCCESS: true`). Las credenciales residen exclusivamente en el entorno seguro del servidor backend y nunca son expuestas al navegador del usuario.

### Contenido del Correo Despachado al Aspirante
Cada vez que un aspirante finaliza la prueba (o al vencer el tiempo de 30 minutos), el sistema genera y despacha un correo HTML formal que incluye:
1. **Identificación Completa:** Nombre del aspirante, documento de identidad, cohorte asignada (Grupo A, B o C) y fecha/hora exacta.
2. **Resultado Global:** Puntaje global obtenido (0 a 100%) y dictamen oficial (`APROBADO` o `DESAPROBADO` según el umbral del 70%).
3. **Desglose por Componentes:**
   - Lógica de Programación (Aciertos y porcentaje con barra gráfica).
   - Razonamiento y Análisis Matemático.
   - Comprensión Lectora e Interpretación Técnica.
   - Test Psicológico y Perfil Vocacional para Desarrollo de Software.
4. **Retroalimentación Pedagógica de IA:** Análisis cualitativo sobre fortalezas y recomendaciones de estudio personalizadas.

---

## 2. Control y Restricción de Cupos por Grupo (Máx. 30 Estudiantes)

### Regla de Capacidad
- Cada cohorte de evaluación admite un máximo estricto de **30 estudiantes**.
- La plataforma contabiliza en tiempo real los registros en la base de datos para cada grupo:
  - **Grupo A** (Capacidad: 30)
  - **Grupo B** (Capacidad: 30)
  - **Grupo C** (Capacidad: 30)

### Comprobación de Grupo Lleno (Grupo A Lleno con 30/30)
Para comprobar el funcionamiento, se cargó la cohorte del **Grupo A con 30 estudiantes**:
1. **En la pantalla principal (`AspirantRegister`):**
   - Se muestra el indicador: `Total Inscritos: 30 estudiantes`.
   - La tarjeta del **Grupo A** indica claramente:
     - Estado: `LLENO (30/30)`.
     - Barra de capacidad al 100% en color rojo.
     - Mensaje: `Grupo lleno. No permite ingreso.`
     - **Acceso bloqueado:** El botón se encuentra deshabilitado (`disabled`), impidiendo que cualquier aspirante seleccione el Grupo A.
2. **Reasignación Automática:**
   - Al cargar la página principal, el formulario selecciona automáticamente el primer grupo con cupos libres (**Grupo B**, con 30 cupos disponibles).
3. **Protección en Backend:**
   - Si se intentara forzar el envío hacia un grupo lleno, el servidor valida la capacidad y asigna el aspirante a la cohorte activa disponible (`B` o `C`).

---

## 3. Limpieza de Interfaz (Requerimiento de Usuario)

En la barra de navegación superior (`Navbar`):
- Se removió el indicador `Nube activa (X preguntas)`.
- Se removió el contador `X aspirantes evaluados`.
- Se mantiene únicamente el selector de perfiles (`Modo Aspirante` y `Acceso Administrativo`).
- En la página principal se visualiza el total de estudiantes inscritos y el desglose de cupos por grupo.

---

## 4. Procedimiento para Probar el Envío de Correos

Para verificar la entrega real en la bandeja de entrada:

1. **Prueba como Aspirante:**
   - Abre la vista principal en **Modo Aspirante**.
   - Completa el registro ingresando un nombre, número de cédula y tu correo electrónico personal.
   - Observa que el Grupo A está bloqueado (30/30) y el sistema asigna el Grupo B.
   - Inicia la prueba y responde las preguntas (o envía el examen).
   - Al dar clic en **Finalizar y Entregar Examen**, el sistema guardará la prueba y enviará automáticamente la notificación a tu correo.
   - Revisa tu bandeja de entrada (y la carpeta de spam si es la primera vez que recibes correo del remitente).

2. **Prueba de Reenvío desde el Panel Administrativo:**
   - Ingresa al **Modo Administrador** (contraseña: `admin123`).
   - Dirígete a la pestaña **Resultados de Aspirantes**.
   - En la fila del aspirante, pulsa el botón con el ícono de **Correo / Reenviar Correo**.
   - El sistema volverá a enviar la notificación al correo del aspirante e indicará el estado de confirmación.

---

## 5. Mantenimiento y Cambio de Credenciales

Si en el futuro deseas cambiar la cuenta de correo emisora:
1. En la cuenta de Google, dirígete a: `Gestionar cuenta de Google` > `Seguridad` > `Verificación en 2 pasos` > `Contraseñas de aplicaciones`.
2. Genera una nueva contraseña para "Correo" y copia el código de 16 letras.
3. Actualiza las variables `SMTP_USER` y `SMTP_PASS` en el panel de configuración de secretos de AI Studio o en tu archivo de entorno.
