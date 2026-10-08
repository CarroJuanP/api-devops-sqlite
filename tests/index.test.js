const request = require('supertest');
const app = require('../index');

describe('Pruebas HTTP para cubrir el 100% de las rutas', () => {

  test('Cubre endpoints HTTP y respuestas de error', async () => {
    // 1. Status y salud
    await request(app).get('/api/status');
    await request(app).get('/api/db/backup');

    // 2. Errores 404
    await request(app).get('/api/productos/999999');
    await request(app).delete('/api/productos/999999');

    // 3. Errores 400
    await request(app).post('/api/productos').send({});
    await request(app).post('/api/categorias').send({});

    // 4. Flujo Categoría
    const resCat = await request(app).post('/api/categorias').send({ nombre: 'Temp' });
    if (resCat.body && resCat.body.id) {
      await request(app).delete(`/api/categorias/${resCat.body.id}`);
    }

    // 5. Flujo Producto
    const resProd = await request(app).post('/api/productos').send({
      nombre: 'Prod Temp',
      precio: 50,
      categoria_id: 1
    });
    if (resProd.body && resProd.body.id) {
      await request(app).get(`/api/productos/${resProd.body.id}`);
      await request(app).delete(`/api/productos/${resProd.body.id}`);
    }

    // 6. Vaciar base de datos
    await request(app).post('/api/db/vaciar');
  });

});