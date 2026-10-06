const request = require('supertest');
const app = require('../index');

describe('Suite de Pruebas Unitarias para Endpoints de la API', () => {

  // 1. GET /api/status (Éxito)
  test('1. GET /api/status - Debe retornar status "online" y 200 OK', async () => {
    const res = await request(app).get('/api/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'online');
  });

  // 2. GET /api/categorias (Éxito)
  test('2. GET /api/categorias - Debe obtener el listado de categorías', async () => {
    const res = await request(app).get('/api/categorias');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  // 3. POST /api/categorias (Fallo: Sin cuerpo/nombre)
  test('3. POST /api/categorias - Escenario de error: Nombre requerido', async () => {
    const res = await request(app).post('/api/categorias').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'El nombre es requerido');
  });

  // 4. POST /api/categorias (Éxito)
  test('4. POST /api/categorias - Crea una nueva categoría correctamente', async () => {
    const res = await request(app)
      .post('/api/categorias')
      .send({ nombre: 'Reposteria Test' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  // 5. GET /api/productos (Éxito)
  test('5. GET /api/productos - Debe retornar status 200 y la lista de productos', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  // 6. GET /api/productos/:id (Fallo: ID inexistente)
  test('6. GET /api/productos/999999 - Escenario de error: Producto no encontrado', async () => {
    const res = await request(app).get('/api/productos/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Producto no encontrado');
  });

  // 7. POST /api/productos (Fallo: Body incompleto)
  test('7. POST /api/productos - Escenario de error: Campos requeridos faltantes', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send({ nombre: 'Producto Sin Precio' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Nombre, precio y categoria_id son requeridos');
  });

  // 8. POST /api/productos (Éxito)
  test('8. POST /api/productos - Debe crear un nuevo producto con éxito', async () => {
    const nuevoProducto = {
      nombre: 'Gelatina de Limón Test',
      precio: 35.0,
      categoria_id: 1
    };
    const res = await request(app).post('/api/productos').send(nuevoProducto);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  // 9. DELETE /api/productos/:id (Prueba de respuesta del servidor ante un ID inválido)
  test('9. DELETE /api/productos/invalid-id - Escenario de error/proceso de eliminación', async () => {
    const res = await request(app).delete('/api/productos/invalid-id');
    expect([200, 400, 404]).toContain(res.statusCode);
  });

  // 10. GET /api/db/backup (Éxito)
  test('10. GET /api/db/backup - Debe retornar el archivo binario del respaldo', async () => {
    const res = await request(app).get('/api/db/backup');
    expect(res.statusCode).toBe(200);
  });
});

describe('Pruebas adicionales de endpoints (20 normales y 10 de error)', () => {
  test('11. GET /api/status - Incluye una fecha de respuesta válida', async () => {
    const res = await request(app).get('/api/status');

    expect(res.statusCode).toBe(200);
    expect(Number.isNaN(Date.parse(res.body.timestamp))).toBe(false);
  });

  test('12. GET /api/status - Responde con contenido JSON', async () => {
    const res = await request(app).get('/api/status');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  test('13. GET /api/categorias - Devuelve categorías con identificador y nombre', async () => {
    const res = await request(app).get('/api/categorias');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toEqual(expect.objectContaining({
      id: expect.any(Number),
      nombre: expect.any(String),
    }));
  });

  test('14. GET /api/categorias - Incluye la categoría inicial Bebidas', async () => {
    const res = await request(app).get('/api/categorias');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 1, nombre: 'Bebidas' }),
    ]));
  });

  test('15. POST /api/categorias - Responde con el nombre de la categoría creada', async () => {
    const nombre = `Categoria adicional ${Date.now()}`;
    const res = await request(app).post('/api/categorias').send({ nombre });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      nombre,
    }));
  });

  test('16. POST /api/categorias - Asigna un identificador positivo', async () => {
    const res = await request(app)
      .post('/api/categorias')
      .send({ nombre: `Categoria con ID ${Date.now()}` });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toEqual(expect.any(Number));
    expect(res.body.id).toBeGreaterThan(0);
  });

  test('17. DELETE /api/categorias/:id - Elimina una categoría existente', async () => {
    const creada = await request(app)
      .post('/api/categorias')
      .send({ nombre: `Categoria para borrar ${Date.now()}` });
    const res = await request(app).delete(`/api/categorias/${creada.body.id}`);

    expect(creada.statusCode).toBe(201);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Categoría eliminada', changes: 1 });
  });

  test('18. GET /api/categorias - Refleja una categoría recién creada', async () => {
    const nombre = `Categoria visible ${Date.now()}`;
    const creada = await request(app).post('/api/categorias').send({ nombre });
    const res = await request(app).get('/api/categorias');

    expect(creada.statusCode).toBe(201);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: creada.body.id, nombre }),
    ]));
  });

  test('19. GET /api/productos - Devuelve productos con sus campos principales', async () => {
    const res = await request(app).get('/api/productos');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toEqual(expect.objectContaining({
      id: expect.any(Number),
      nombre: expect.any(String),
      precio: expect.any(Number),
      categoria_id: expect.any(Number),
    }));
  });

  test('20. GET /api/productos - Incluye el producto inicial Refresco 600ml', async () => {
    const res = await request(app).get('/api/productos');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 1, nombre: 'Refresco 600ml' }),
    ]));
  });

  test('21. GET /api/productos/1 - Devuelve el producto con sus datos', async () => {
    const res = await request(app).get('/api/productos/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      id: 1,
      nombre: 'Refresco 600ml',
      precio: 18.5,
      categoria_id: 1,
    }));
  });

  test('22. GET /api/productos/2 - Devuelve el producto Papas Saladas', async () => {
    const res = await request(app).get('/api/productos/2');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      id: 2,
      nombre: 'Papas Saladas',
      precio: 22,
      categoria_id: 2,
    }));
  });

  test('23. POST /api/productos - Devuelve los datos del producto creado', async () => {
    const nuevoProducto = {
      nombre: `Producto adicional ${Date.now()}`,
      precio: 47.5,
      categoria_id: 1,
    };
    const res = await request(app).post('/api/productos').send(nuevoProducto);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      ...nuevoProducto,
    }));
  });

  test('24. POST /api/productos - Acepta un precio de cero', async () => {
    const nuevoProducto = {
      nombre: `Producto gratuito ${Date.now()}`,
      precio: 0,
      categoria_id: 1,
    };
    const res = await request(app).post('/api/productos').send(nuevoProducto);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(expect.objectContaining(nuevoProducto));
  });

  test('25. GET /api/productos/:id - Permite consultar el producto recién creado', async () => {
    const creado = await request(app).post('/api/productos').send({
      nombre: `Producto consultable ${Date.now()}`,
      precio: 29,
      categoria_id: 1,
    });
    const res = await request(app).get(`/api/productos/${creado.body.id}`);

    expect(creado.statusCode).toBe(201);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      id: creado.body.id,
      nombre: creado.body.nombre,
      precio: 29,
    }));
  });

  test('26. DELETE /api/productos/:id - Elimina un producto recién creado', async () => {
    const creado = await request(app).post('/api/productos').send({
      nombre: `Producto para borrar ${Date.now()}`,
      precio: 12,
      categoria_id: 1,
    });
    const res = await request(app).delete(`/api/productos/${creado.body.id}`);

    expect(creado.statusCode).toBe(201);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Producto eliminado', changes: 1 });
  });

  test('27. DELETE /api/productos/:id - Informa cuando no hay productos eliminados', async () => {
    const res = await request(app).delete('/api/productos/999999');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Producto eliminado', changes: 0 });
  });

  test('28. DELETE /api/categorias/:id - Informa cuando no hay categorías eliminadas', async () => {
    const res = await request(app).delete('/api/categorias/999999');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Categoría eliminada', changes: 0 });
  });

  test('29. GET /api/db/backup - Devuelve un archivo adjunto', async () => {
    const res = await request(app).get('/api/db/backup');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });

  test('30. GET /api/db/backup - Usa el nombre esperado para el respaldo', async () => {
    const res = await request(app).get('/api/db/backup');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-disposition']).toContain('backup-midatabase.db');
  });

  test('31. POST /api/categorias - Error cuando falta el nombre', async () => {
    const res = await request(app).post('/api/categorias').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'El nombre es requerido');
  });

  test('32. POST /api/categorias - Error cuando el nombre está vacío', async () => {
    const res = await request(app).post('/api/categorias').send({ nombre: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'El nombre es requerido');
  });

  test('33. POST /api/productos - Error cuando el cuerpo está vacío', async () => {
    const res = await request(app).post('/api/productos').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      'error',
      'Nombre, precio y categoria_id son requeridos'
    );
  });

  test('34. POST /api/productos - Error cuando falta el nombre', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send({ precio: 10, categoria_id: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      'error',
      'Nombre, precio y categoria_id son requeridos'
    );
  });

  test('35. POST /api/productos - Error cuando falta el precio', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send({ nombre: 'Producto sin precio', categoria_id: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      'error',
      'Nombre, precio y categoria_id son requeridos'
    );
  });

  test('36. POST /api/productos - Error cuando falta la categoría', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send({ nombre: 'Producto sin categoría', precio: 10 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      'error',
      'Nombre, precio y categoria_id son requeridos'
    );
  });

  test('37. GET /api/productos/:id - Error cuando el identificador no existe', async () => {
    const res = await request(app).get('/api/productos/888888');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Producto no encontrado');
  });

  test('38. GET /api/productos/:id - Error cuando el identificador no es numérico', async () => {
    const res = await request(app).get('/api/productos/no-numerico');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Producto no encontrado');
  });

  test('39. POST /api/categorias - Error al enviar JSON mal formado', async () => {
    const res = await request(app)
      .post('/api/categorias')
      .set('Content-Type', 'application/json')
      .send('{"nombre":');

    expect(res.statusCode).toBe(400);
  });

  test('40. GET /api/ruta-inexistente - Error para un endpoint no definido', async () => {
    const res = await request(app).get('/api/ruta-inexistente');

    expect(res.statusCode).toBe(404);
  });
});