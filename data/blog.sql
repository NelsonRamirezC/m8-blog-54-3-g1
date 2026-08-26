-- ============================================
-- Base de datos simple para blog
-- PostgreSQL
-- ============================================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
	admin BOOLEAN NOT NULL default false,
	status BOOLEAN NOT NULL default true
);

CREATE TABLE publicaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    publicacion_id INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Datos de ejemplo (opcional)
-- ============================================

-- Insertar un usuario de prueba
-- IMPORTANTE: En producción usa password hasheado con bcrypt
INSERT INTO usuarios (email, password, nombre)
VALUES (
    'admin@ejemplo.com',
    'password123',  -- Reemplazar con hash real
    'Administrador'
);

-- Insertar una publicación de prueba
INSERT INTO publicaciones (usuario_id, titulo, contenido, publicado)
VALUES (
    1,
    'Mi primera publicación',
    'Este es el contenido de mi primera publicación en el blog.',
    true
);

-- Insertar un comentario de prueba
INSERT INTO comentarios (publicacion_id, usuario_id, contenido)
VALUES (
    1,
    1,
    'Este es un comentario de prueba.'
);

-- ============================================
-- Consultas útiles
-- ============================================

-- Ver todas las publicaciones con su autor
SELECT 
    p.id,
    p.titulo,
    p.contenido,
    p.publicado,
    p.fecha_creacion,
    u.nombre AS autor
FROM publicaciones p
JOIN usuarios u ON p.usuario_id = u.id
ORDER BY p.fecha_creacion DESC;

-- Ver comentarios de una publicación
SELECT 
    c.id,
    c.contenido,
    c.fecha_creacion,
    u.nombre AS autor_comentario
FROM comentarios c
JOIN usuarios u ON c.usuario_id = u.id
WHERE c.publicacion_id = 1
ORDER BY c.fecha_creacion ASC;

-- Contar comentarios por publicación
SELECT 
    p.id,
    p.titulo,
    COUNT(c.id) AS total_comentarios
FROM publicaciones p
LEFT JOIN comentarios c ON p.id = c.publicacion_id
GROUP BY p.id, p.titulo;