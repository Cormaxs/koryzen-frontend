Prompt Optimizado: Rediseño Dashboard Enterprise
Actúa como un Senior Frontend Architect experto en Design Systems y React-Bootstrap.

Objetivo: Transformar el código adjunto en una interfaz de gestión empresarial de alta gama. El diseño debe ser minimalista, elegante y funcional, priorizando la legibilidad y la eficiencia operativa sobre los adornos visuales.

🎨 Paleta de Colores y Estética
Base: Blancos puros y grises muy tenues (#F8F9FA).

Contraste: Texto principal en un gris muy oscuro o "Off-black" (#212529).

Acento: Un solo color de identidad (ej. Azul Slate o Navy) usado exclusivamente para acciones primarias.

Neutralidad: Evitar el uso excesivo de colores de "semáforo" (rojo/verde) a menos que sea estrictamente necesario para alertas críticas.

🛠️ Lineamientos de Estructura y Componentes
Layout & Spacing: * Usa container-fluid con un padding lateral generoso (px-4 o px-5).

Implementa una arquitectura de capas clara: el fondo de la página debe ser ligeramente gris y las Cards blancas para generar profundidad.

Tarjetas (Cards) de Alta Costura:

Usa <Card className="border-0 shadow-sm mb-4">.

Las cabeceras de las tarjetas (Card.Header) deben ser transparentes, con un borde inferior sutil y títulos en fs-6 fw-semibold text-uppercase ls-wide.

Tablas de Datos (Data Grid Style):

Configuración: <Table hover responsive className="align-middle mb-0">.

Las filas deben tener un padding vertical mayor para evitar el hacinamiento de datos.

Los encabezados de tabla (<thead>) deben tener un fondo gris muy claro y texto en mayúsculas pequeñas.

Tipografía de Precisión:

Utiliza clases de utilidad para dar jerarquía: .text-secondary para metadatos y .fw-medium para etiquetas.

Los números y cifras financieras deben usar una fuente monoespaciada si es posible o simplemente fw-bold con un espaciado correcto.

Micro-interacciones y Feedback:

Loading: Un Spinner discreto y centrado.

Badges: Usa versiones "Pill" y sutiles: <Badge pill bg="light" className="text-secondary border fw-normal">.

⚠️ REGLA DE ORO DE DESARROLLO
No alteres la arquitectura lógica. Mantén intactos: useState, useEffect, manejadores de eventos (handle...), llamadas a API (Axios/Fetch) y props de componentes. Tu intervención es 100% en la capa de presentación (JSX) y clases de Bootstrap.

Código a transformar: