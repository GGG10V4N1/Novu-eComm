# Novu-eComm

Plataforma de e-commerce full-stack compuesta por un **backend** en Spring Boot (Java 21) y un **frontend** SPA.

> **Nota sobre el Frontend**: El frontend de este proyecto fue completamente *vibecodeado* y desarrollado haciendo uso de herramientas de Inteligencia Artificial (IA) asistida. La lógica, los componentes y la integración con el backend se generaron y refinaron mediante prompts y asistencia de IA, sin código escrito manualmente desde cero.

---

## Novu-eComm Backend

Backend API para una plataforma de e-commerce desarrollada con **Spring Boot 3.5.x** y **Java 21**.

---

## Tabla de Contenidos

- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Base de Datos](#-base-de-datos)
- [Seguridad y Autenticación](#-seguridad-y-autenticación)
- [API Endpoints](#-api-endpoints)
- [Documentación API](#-documentación-api)
- [Configuración](#-configuración)
- [Principales Funcionalidades](#-principales-funcionalidades)

---

## Stack Tecnológico

### Core Framework
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Spring Boot** | 3.5.13 | Framework principal para aplicaciones Spring |
| **Java** | 21 | Lenguaje de programación (LTS) |
| **Maven** | Wrapper | Gestión de dependencias y build |

### Spring Starters
| Dependencia | Propósito |
|-------------|-----------|
| `spring-boot-starter-web` | API REST, Tomcat embebido, Jackson |
| `spring-boot-starter-data-jpa` | Persistencia con Hibernate/JPA |
| `spring-boot-starter-security` | Autenticación y autorización |
| `spring-boot-starter-validation` | Validación Bean Validation (JSR-380) |
| `spring-boot-starter-test` | Testing (JUnit 5, Mockito, Spring Test) |

### Seguridad y JWT
| Librería | Versión | Uso |
|----------|---------|-----|
| `jjwt-api` | 0.12.5 | API para JWT |
| `jjwt-impl` | 0.12.5 | Implementación JWT (runtime) |
| `jjwt-jackson` | 0.12.5 | Serialización JSON para JWT |
| `BCryptPasswordEncoder` | - | Hashing de contraseñas |

### Base de Datos
| Tecnología | Versión | Configuración |
|------------|---------|---------------|
| **MySQL** | 8.x (via `mysql-connector-j`) | Driver JDBC |
| **Hibernate** | 6.x (via Spring Boot) | JPA Provider, DDL: `validate` |

### Utilidades y Mapeo
| Librería | Versión | Uso |
|----------|---------|-----|
| **Lombok** | Latest | Reduce boilerplate (@Data, @Builder, etc.) |
| **ModelMapper** | 3.2.4 | Mapeo Entity ↔ DTO |
| **Stripe Java** | 29.3.0 | Integración de pagos |

### Documentación API
| Herramienta | Versión | Descripción |
|-------------|---------|-------------|
| **SpringDoc OpenAPI** | 2.8.17 | Generación automática OpenAPI 3 / Swagger UI |

---

## Arquitectura

### Patrones Aplicados
- **Layered Architecture**: Controller → Service → Repository
- **DTO Pattern**: Separación entre entidades de persistencia y objetos de transferencia
- **Interface Segregation**: Interfaces de servicio (`*Service`) separadas de implementaciones (`*ServiceImpl`)
- **Builder Pattern**: Lombok `@Builder` en entidades y DTOs
- **Stateless JWT**: Autenticación sin sesión en servidor

### Capas

```
├── controller          # REST Controllers (endpoints HTTP)
├── service
│   ├── api             # Interfaces de servicio
│   └── impl            # Implementaciones de lógica de negocio
├── repository          # Spring Data JPA Repositories
├── model               # Entidades JPA (@Entity)
├── payload             # DTOs (Request/Response)
├── security
│   ├── config          # WebSecurityConfig, JWT Config
│   ├── jwt             # Filtros, utilidades, entry point
│   ├── request         # LoginRequest, SignUpRequest
│   ├── response        # UserInfoResponse, MessageResponse
│   └── services        # UserDetailsServiceImpl, UserDetailsImpl
├── exception           # GlobalExceptionHandler, excepciones custom
├── config              # Swagger, ModelMapper, AppConstants
└── utils               # Utilidades auxiliares
```

---

## Base de Datos

### Esquema Principal (Entidades JPA)

| Entidad | Tabla | Descripción |
|---------|-------|-------------|
| `User` | `users` | Usuarios del sistema |
| `Role` | `roles` | Roles: USER, SELLER, ADMIN |
| `Product` | `products` | Catálogo de productos |
| `Category` | `categories` | Categorías de productos |
| `Cart` | `carts` | Carrito de compras (1:1 User) |
| `CartItem` | `cart_items` | Items del carrito |
| `Order` | `orders` | Pedidos |
| `OrderItem` | `order_items` | Items de pedido |
| `Payment` | `payments` | Pagos (Stripe) |
| `Address` | `addresses` | Direcciones de envío |

### Relaciones Clave
- **User ↔ Role**: Many-to-Many (`user_role`)
- **User → Address**: One-to-Many
- **User → Cart**: One-to-One
- **User → Product**: One-to-Many (seller)
- **Cart → CartItem**: One-to-Many
- **Order → OrderItem**: One-to-Many
- **Order → Payment**: One-to-One
- **Category → Product**: One-to-Many

## Seguridad y Autenticación

### JWT (JSON Web Tokens)
- **Algoritmo**: HS256 (firma simétrica)
- **Expiración**: 300,000,000 ms (~3.5 días)
- **Transporte**: HttpOnly Cookie (`ecomm-cookie`) + Header Authorization Bearer
- **Secret**: Configurable via `spring.app.jwtSecret`

### Flujo de Autenticación
1. **Login** (`POST /ecomApi/auth/signin`) → Devuelve JWT en cookie HttpOnly
2. **Requests posteriores** → Cookie enviada automáticamente + Header `Authorization: Bearer <token>`
3. **Filtro JWT** (`AuthTokenFilter`) → Valida token, carga `UserDetails` en `SecurityContext`
4. **Logout** (`POST /ecomApi/auth/signout`) → Invalida cookie

### Roles y Autorización (RBAC)
| Rol | Permisos |
|-----|----------|
| `ROLE_USER` | Acceso a endpoints públicos, carrito, pedidos propios |
| `ROLE_SELLER` | Gestión de productos/pedidos propios (rutas `/seller/**` compartidas con Admin) + permisos USER |
| `ROLE_ADMIN` | Acceso total: usuarios, categorías, analytics, etc |

## API Endpoints

### Base Path: `/ecomApi`

#### Autenticación (`/auth`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/signin` | Login usuario | No |
| POST | `/signup` | Registro usuario | No |
| POST | `/signout` | Logout | Sí |
| GET | `/username` | Username actual | Sí |
| GET | `/user` | Detalles usuario actual | Sí |
| GET | `/sellers` | Listar vendedores (paginado) | Admin |
| PUT | `/password` | Cambiar contraseña del usuario autenticado (body: `UpdatePasswordRequest`) | Sí |
| PUT | `/email` | Cambiar email del usuario autenticado (body: `UpdateEmailRequest`) | Sí |

#### Productos (`/public/products`, `/admin/products`, `/seller/products`, `/admin/categories`, `/seller/categories`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/public/products` | Listar productos (paginado, filtros: `keyword`, `category`) | No |
| GET | `/public/products/keyword/{keyword}` | Buscar productos por palabra clave (paginado) | No |
| GET | `/public/categories/{categoryId}/products` | Listar productos por categoría (paginado) | No |
| GET | `/admin/products` | Admin: todos los productos (paginado) | Admin |
| GET | `/seller/products` | Seller: productos (paginado) | Seller/Admin |
| POST | `/admin/categories/{categoryId}/product` | Crear producto en una categoría | Admin |
| POST | `/seller/categories/{categoryId}/product` | Crear producto en una categoría | Seller/Admin |
| PUT | `/admin/products/{productId}` | Actualizar producto | Admin |
| PUT | `/seller/products/{productId}` | Actualizar producto | Seller/Admin |
| PUT | `/admin/products/{productId}/image` | Actualizar imagen del producto (`multipart`, campo `image`) | Admin |
| PUT | `/seller/products/{productId}/image` | Actualizar imagen del producto (`multipart`, campo `image`) | Seller/Admin |
| DELETE | `/admin/products/{productId}` | Eliminar producto | Admin |
| DELETE | `/seller/products/{productId}` | Eliminar producto | Seller/Admin |

#### Categorías (`/public/categories`, `/admin/categories`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/public/categories` | Listar categorías (paginado) | No |
| POST | `/admin/categories` | Crear categoría | Admin |
| PUT | `/admin/categories/{categoryId}` | Actualizar categoría | Admin |
| DELETE | `/admin/categories/{categoryId}` | Eliminar categoría | Admin |

#### Carrito (`/cart`, `/carts`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/carts/products/{productId}/quantity/{quantity}` | Agregar producto al carrito con cantidad | Usuario |
| POST | `/cart/create` | Crear/actualizar carrito con lista de `CartItemDTO` | Usuario |
| GET | `/carts` | Listar todos los carritos | Usuario |
| GET | `/carts/users/cart` | Obtener carrito del usuario actual | Usuario |
| PUT | `/cart/products/{productId}/quantity/{operation}` | Actualizar cantidad (`operation` = `delete` reduce, otro incrementa) | Usuario |
| DELETE | `/carts/{cartId}/product/{productId}` | Eliminar producto del carrito | Usuario |

#### Pedidos (`/order`, `/admin/orders`, `/seller/orders`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/order/users/payments/{paymentMethod}` | Crear pedido (body: `OrderRequestDTO`) | Usuario |
| POST | `/order/stripe-client-secret` | Crear PaymentIntent de Stripe (body: `StripePaymentDTO`) | Usuario |
| GET | `/admin/orders` | Listar todos los pedidos (paginado) | Admin |
| GET | `/seller/orders` | Listar pedidos del seller (paginado) | Seller/Admin |
| PUT | `/admin/orders/{orderId}/status` | Actualizar estado del pedido (body: `OrderStatusUpdateDTO`) | Admin |
| PUT | `/seller/orders/{orderId}/status` | Actualizar estado del pedido (body: `OrderStatusUpdateDTO`) | Seller/Admin |
| GET | `/order/users` | Listar pedidos del usuario actual (paginado) | Usuario |
| GET | `/order/users/{orderId}` | Detalle de un pedido propio del usuario actual | Usuario |

#### Direcciones (`/addresses`, `/users/addresses`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/addresses` | Listar todas las direcciones | Usuario |
| GET | `/addresses/{addressId}` | Detalle de una dirección | Usuario |
| GET | `/users/addresses` | Listar direcciones del usuario actual | Usuario |
| POST | `/addresses` | Agregar dirección (body: `AddressDTO`) | Usuario |
| PUT | `/addresses/{addressId}` | Actualizar dirección | Usuario |
| DELETE | `/addresses/{addressId}` | Eliminar dirección | Usuario |

#### Pagos Stripe (`/order`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/order/stripe-client-secret` | Crear PaymentIntent de Stripe (body: `StripePaymentDTO`) | Usuario |
| POST | `/order/users/payments/{paymentMethod}` | Confirmar pedido con método de pago (`online` para Stripe, otro para otros) | Usuario |

#### Analytics (`/admin/app/analytics`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/admin/app/analytics` | Datos de analytics del dashboard (resumen general) | Admin |
| GET | `/seller/app/analytics` | Datos de analytics del dashboard del seller (productos, pedidos y revenue propios) | Seller/Admin |

## Documentación API

### Swagger UI / OpenAPI 3
- **URL**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Spec**: `http://localhost:8080/v3/api-docs`
- **Configuración**: `SwaggerConfig.java` con Bearer Auth JWT

### Características
- Documentación automática de todos los endpoints
- Esquemas de request/response generados desde DTOs
- Autorización JWT integrada en UI (botón "Authorize")
- Agrupación por tags (Auth, Products, Categories, Cart, Orders, etc.)

---

## Configuración

### Variables Principales (`application.properties` → `${...}` resueltas desde `.env`)

```properties
# Aplicación
spring.application.name=backend
spring.web.locale=en_US

# JWT
spring.app.jwtSecret=${SPRING_APP_JWT_SECRET}
spring.app.jwtExpirationMs=${SPRING_APP_JWT_EXPIRATION_MS}
spring.ecom.app.jwtCookieName=${SPRING_ECOM_APP_JWT_COOKIE_NAME}

# Seguridad Spring (basic auth)
spring.security.user.name=${SPRING_SECURITY_USER_NAME}
spring.security.user.password=${SPRING_SECURITY_USER_PASSWORD}

# Base de Datos MySQL
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=validate

# Imágenes
image.base.url=http://localhost:8080/images
project.image=images/

# Frontend (para CORS en WebMvcConfig)
frontend.url=${FRONTEND_URL}

# Stripe
stripe.secret.key=${STRIPE_SECRET_KEY}
```

### `.env` (no versionado)
```properties
SPRING_SECURITY_USER_NAME=...
SPRING_SECURITY_USER_PASSWORD=...
SPRING_APP_JWT_SECRET=...
SPRING_APP_JWT_EXPIRATION_MS=300000000
SPRING_ECOM_APP_JWT_COOKIE_NAME=ecomm-cookie
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/ecomm?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Lima
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
FRONTEND_URL=http://localhost:5173/
IMAGE_BASE_URL=http://localhost:8080/images
PROJECT_IMAGE=images/
STRIPE_SECRET_KEY=...
```
## Principales Funcionalidades

###  Catálogo y Productos
- CRUD completo de productos (Seller/Admin)
- Búsqueda con filtros: categoría, precio, nombre, paginación
- Gestión de categorías (Admin)
- Imágenes de productos (servidas estáticamente)

###  Carrito de Compras
- Un carrito por usuario (1:1)
- Agregar/actualizar/eliminar items
- Cálculo de totales automático

###  Pedidos y Checkout
- Crear pedido desde carrito
- Historial de pedidos por usuario
- Estados: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- Gestión de estados (Admin)

###  Pagos con Stripe
- PaymentIntent creation
- Webhook para confirmación asíncrona
- Registro de pagos en BD

### Gestión de Usuarios y Roles
- Registro con validación (email único, username único)
- Login con JWT en cookie HttpOnly
- Roles: USER, SELLER, ADMIN (inicializados en arranque)
- Perfil de usuario y direcciones múltiples

### Seguridad
- JWT Stateless con expiración configurable
- BCrypt para passwords
- Validación Bean Validation en DTOs
- Manejo global de excepciones (`GlobalExceptionHandler`)
- CORS configurado

---

## Autor

**Giovani Saavedra**  
giovani.saavedra@pucp.edu.pe

---
