require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const qrCodeDir = path.join(__dirname, 'public', 'qrcodes');
if (!fs.existsSync(qrCodeDir)) fs.mkdirSync(qrCodeDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/qrcodes', express.static(qrCodeDir));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Rota para registrar almoxarife
app.post('/api/almoxarife', (req, res) => {
  const { nome, email, telefone, cpf, senha } = req.body;

  // Validação de campos obrigatórios
  if (!nome || !email || !telefone || !cpf || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Verificar se o e-mail ou CPF já está cadastrado
  const sqlCheck = 'SELECT * FROM almoxarife WHERE email = ? OR cpf = ?';
  db.query(sqlCheck, [email, cpf], (err, result) => {
    if (err) {
      console.error('Erro ao verificar duplicidade:', err.message);
      return res.status(500).json({ error: 'Erro no servidor ao verificar duplicidade.' });
    }

    if (result.length > 0) {
      return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' });
    }

    // Inserir novo almoxarife
    const sqlInsert = 'INSERT INTO almoxarife (nome, email, telefone, cpf, senha) VALUES (?, ?, ?, ?, ?)';
    db.query(sqlInsert, [nome, email, telefone, cpf, senha], (err, result) => {
      if (err) {
        console.error('Erro ao registrar almoxarife:', err.message);
        return res.status(500).json({ error: 'Erro no servidor ao registrar almoxarife.' });
      }
      res.status(201).json({ message: 'Almoxarife registrado com sucesso!', id: result.insertId });
    });
  });
});

// Rota de login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const sql = 'SELECT * FROM almoxarife WHERE email = ? AND senha = ?';
  db.query(sql, [email, senha], (err, result) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const user = result[0];
    res.json({
      message: 'Login realizado com sucesso.',
      user: {
        email: user.email,
        nome: user.nome,
        cpf: user.cpf, // Inclui o CPF no retorno
      },
    });
  });
});




// Middleware de autenticação (agora, verifica e-mail e senha em vez de token)
const authenticate = (req, res, next) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const sql = 'SELECT * FROM almoxarife WHERE email = ? AND senha = ?';
  db.query(sql, [email, senha], (err, result) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // Caso o login seja válido, passa para a próxima rota
    next();
  });
};

// No arquivo do backend, adicione antes do createCRUDRoutes:

// Função para verificar se material tem registros de entrada ou saída
const verificarRegistrosMaterial = async (codigo) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM entrar WHERE codigo = ?) as entradas,
        (SELECT COUNT(*) FROM saida WHERE codigo = ?) as saidas
    `;
    
    db.query(sql, [codigo, codigo], (err, result) => {
      if (err) reject(err);
      resolve(result[0]);
    });
  });
};

// Modifique a rota DELETE no createCRUDRoutes para material:
app.delete('/api/material/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar registros
    const registros = await verificarRegistrosMaterial(id);
    
    if (registros.entradas > 0 || registros.saidas > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir este material pois ele possui registros de entrada e/ou saída associados.' 
      });
    }

    // Se não tiver registros, procede com a exclusão
    const sql = `DELETE FROM material WHERE codigo = ?`;
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Material excluído com sucesso', changes: result.affectedRows });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotas genéricas para CRUD (CREATE, READ, UPDATE, DELETE)
const createCRUDRoutes = (tableName, primaryKey) => {
  // GET - Listar todos os registros
  app.get(`/api/${tableName}`, (req, res) => {
    const sql = `SELECT * FROM ${tableName}`;
    db.query(sql, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  // GET - Buscar um registro pelo ID
  app.get(`/api/${tableName}/:id`, (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM ${tableName} WHERE ${primaryKey} = ?`;
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result[0] || {});
    });
  });

  // POST - Adicionar um registro
  app.post(`/api/${tableName}`, (req, res) => {
    const data = req.body;
    const sql = `INSERT INTO ${tableName} SET ?`;
    db.query(sql, data, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...data });
    });
  });

  // PUT - Atualizar um registro
  app.put(`/api/${tableName}/:id`, (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const sql = `UPDATE ${tableName} SET ? WHERE ${primaryKey} = ?`;
    db.query(sql, [data, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Registro atualizado com sucesso', changes: result.affectedRows });
    });
  });

  // DELETE - Excluir um registro
  app.delete(`/api/${tableName}/:id`, (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`;
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Registro excluído com sucesso', changes: result.affectedRows });
    });
  });
};

// Criar rotas CRUD para cada tabela
createCRUDRoutes('almoxarife', 'cpf');
createCRUDRoutes('cliente', 'cnpj');
createCRUDRoutes('entrar', 'id_registro');
createCRUDRoutes('funcionario', 'cpf_func');
createCRUDRoutes('material', 'codigo');
createCRUDRoutes('saida', 'id_nota');
createCRUDRoutes('fornecedores', 'nome_fornecedor');
createCRUDRoutes('unidade_medida', 'nome');

// Adicionar rota para fornecedores com valor
app.get('/api/fornecedores', (req, res) => {
  const sql = 'SELECT nome_fornecedor, material, descricao, imagem, valor, createdAT, updatedAT FROM fornecedores';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro ao buscar fornecedores:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// CRUD para unidade_medida
app.post('/api/unidade_medida', (req, res) => {
  const { nome } = req.body;
  if (!nome) {
      return res.status(400).json({ error: 'O nome da unidade de medida é obrigatório.' });
  }
  const sql = 'INSERT INTO unidade_medida (nome) VALUES (?)';
  db.query(sql, [nome], (err, result) => {
      if (err) {
          console.error('Erro ao cadastrar unidade:', err.message);
          return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Unidade cadastrada com sucesso!', id: result.insertId });
  });
});
//cadastro material

app.post('/api/material', async (req, res) => {
  const { nome, descricao, unidade_de_medida, limite, qrcode_string } = req.body;

  if (!nome || !descricao || !unidade_de_medida || !qrcode_string) {
    return res.status(400).json({ error: 'Nome, descrição, unidade de medida e QR Code são obrigatórios.' });
  }

  try {
    // Get unidade_de_medida ID
    const unidadeResult = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM unidade_medida WHERE nome = ?', [unidade_de_medida], (err, results) => {
        if (err) reject(err);
        if (results.length === 0) reject(new Error('Unidade de medida não encontrada'));
        resolve(results[0].id);
      });
    });

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const qrFileName = `qr_${timestamp}.png`;
    const qrFilePath = path.join(qrCodeDir, qrFileName);
    const publicPath = `/qrcodes/${qrFileName}`;

    // Gerar e salvar QR Code como imagem
    await QRCode.toFile(qrFilePath, qrcode_string);

    // Insert material
    const sqlInsert = `
      INSERT INTO material 
      (nome, descricao, unidade_de_medida, quantidade, limite, qrcode_string, qr_image) 
      VALUES (?, ?, ?, 0, ?, ?, ?)
    `;

    db.query(
      sqlInsert, 
      [nome, descricao, unidade_de_medida, limite || null, qrcode_string, publicPath], 
      (err, result) => {
        if (err) {
          // Remover arquivo em caso de erro no banco
          fs.unlinkSync(qrFilePath);
          console.error('Erro ao inserir material:', err);
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({ 
          message: 'Material cadastrado com sucesso!', 
          id: result.insertId,
          qrCodeString: qrcode_string,
          qrCodePath: publicPath
        });
      }
    );
  } catch (error) {
    console.error('Erro no cadastro de material:', error);
    res.status(500).json({ error: error.message });
  }
});

//rota específica para saídas

app.post('/api/saida', async (req, res) => {
  const { codigo, qtd, cpf } = req.body;

  if (!codigo || !qtd || !cpf) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Verificar se existe material suficiente
    const [material] = await db.promise().query(
      'SELECT quantidade FROM material WHERE codigo = ?',
      [codigo]
    );

    if (material.length === 0) {
      return res.status(404).json({ error: 'Material não encontrado.' });
    }

    if (material[0].quantidade < qtd) {
      return res.status(400).json({ error: 'Quantidade insuficiente em estoque.' });
    }

    // Iniciar transação
    await db.promise().beginTransaction();

    // Registrar saída
    await db.promise().query(
      'INSERT INTO saida (codigo, qtd, cpf) VALUES (?, ?, ?)',
      [codigo, qtd, cpf]
    );

    // Atualizar quantidade do material
    await db.promise().query(
      'UPDATE material SET quantidade = quantidade - ? WHERE codigo = ?',
      [qtd, codigo]
    );

    // Commit da transação
    await db.promise().commit();

    res.status(201).json({ message: 'Saída registrada com sucesso!' });
  } catch (error) {
    // Rollback em caso de erro
    await db.promise().rollback();
    console.error('Erro ao registrar saída:', error);
    res.status(500).json({ error: 'Erro ao registrar saída.' });
  }
});
//rota especifica para entrada
app.post('/api/entrar/bulk', async (req, res) => {
  const { itens, cpf } = req.body;

  if (!itens || !Array.isArray(itens) || itens.length === 0 || !cpf) {
    return res.status(400).json({ error: 'Dados inválidos para registro de entrada.' });
  }

  try {
    await db.promise().beginTransaction();

    // Registrar cada item na tabela entrar e atualizar quantidade
    for (const item of itens) {
      // Registrar entrada
      await db.promise().query(
        'INSERT INTO entrar (cpf, codigo, qtd) VALUES (?, ?, ?)',
        [cpf, item.codigo, item.quantidade]
      );

      // Atualizar quantidade do material
      await db.promise().query(
        'UPDATE material SET quantidade = quantidade + ? WHERE codigo = ?',
        [item.quantidade, item.codigo]
      );
    }

    await db.promise().commit();
    res.status(201).json({ message: 'Entradas registradas com sucesso!' });
  } catch (error) {
    await db.promise().rollback();
    console.error('Erro ao registrar entradas:', error);
    res.status(500).json({ error: 'Erro ao registrar entradas.' });
  }
});

// Rota para cancelar entrada
app.post('/api/entrar/cancelar/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.promise().beginTransaction();
    
    // Buscar informações da entrada
    const [entrada] = await db.promise().query(
      'SELECT codigo, qtd FROM entrar WHERE id_registro = ?',
      [id]
    );

    if (entrada.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Registro de entrada não encontrado.' });
    }

    // Atualizar quantidade do material (removendo a quantidade que entrou)
    await db.promise().query(
      'UPDATE material SET quantidade = quantidade - ? WHERE codigo = ?',
      [entrada[0].qtd, entrada[0].codigo]
    );

    // Marcar entrada como cancelada
    await db.promise().query(
      'UPDATE entrar SET cancelado = true, data_cancelamento = NOW() WHERE id_registro = ?',
      [id]
   );

    await db.promise().commit();
    res.json({ message: 'Entrada cancelada com sucesso!' });
  } catch (error) {
    await db.promise().rollback();
    console.error('Erro ao cancelar entrada:', error);
    res.status(500).json({ error: 'Erro ao cancelar entrada.' });
  }
});

// Rota para cancelar saída
app.post('/api/saida/cancelar/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.promise().beginTransaction();
    
    // Buscar informações da saída
    const [saida] = await db.promise().query(
      'SELECT codigo, qtd FROM saida WHERE id_nota = ?',
      [id]
    );

    if (saida.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Registro de saída não encontrado.' });
    }

    // Atualizar quantidade do material (devolvendo a quantidade que saiu)
    await db.promise().query(
      'UPDATE material SET quantidade = quantidade + ? WHERE codigo = ?',
      [saida[0].qtd, saida[0].codigo]
    );

    // Marcar saída como cancelada
    await db.promise().query(
      'UPDATE saida SET cancelado = true, data_cancelamento = NOW() WHERE id_nota = ?',
      [id]
    );

    await db.promise().commit();
    res.json({ message: 'Saída cancelada com sucesso!' });
  } catch (error) {
    await db.promise().rollback();
    console.error('Erro ao cancelar saída:', error);
    res.status(500).json({ error: 'Erro ao cancelar saída.' });
  }
});

// Rota para desfazer cancelamento de entrada
app.post('/api/entrar/desfazer-cancelamento/:id', async (req, res) => {
  const { id } = req.params;
  const { senha } = req.body;
  
  if (senha !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  try {
    await db.promise().beginTransaction();
    
    // Buscar informações da entrada
    const [entrada] = await db.promise().query(
      'SELECT codigo, qtd FROM entrar WHERE id_registro = ?',
      [id]
    );

    if (entrada.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Registro de entrada não encontrado.' });
    }

    // Atualizar quantidade do material (adicionando a quantidade novamente)
    await db.promise().query(
      'UPDATE material SET quantidade = quantidade + ? WHERE codigo = ?',
      [entrada[0].qtd, entrada[0].codigo]
    );

    // Desmarcar entrada como cancelada
    await db.promise().query(
      'UPDATE entrar SET cancelado = false, data_cancelamento = NULL WHERE id_registro = ?',
      [id]
    );

    await db.promise().commit();
    res.json({ message: 'Cancelamento de entrada desfeito com sucesso!' });
  } catch (error) {
    await db.promise().rollback();
    console.error('Erro ao desfazer cancelamento de entrada:', error);
    res.status(500).json({ error: 'Erro ao desfazer cancelamento de entrada.' });
  }
});

// Rota para desfazer cancelamento de saída
app.post('/api/saida/desfazer-cancelamento/:id', async (req, res) => {
  const { id } = req.params;
  const { senha } = req.body;
  
  if (senha !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  try {
    await db.promise().beginTransaction();
    
    // Buscar informações da saída
    const [saida] = await db.promise().query(
      'SELECT codigo, qtd FROM saida WHERE id_nota = ?',
      [id]
    );

    if (saida.length === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: 'Registro de saída não encontrado.' });
    }

    // Atualizar quantidade do material (removendo a quantidade novamente)
    await db.promise().query(
      'UPDATE material SET quantidade = quantidade - ? WHERE codigo = ?',
      [saida[0].qtd, saida[0].codigo]
    );

    // Desmarcar saída como cancelada
    await db.promise().query(
      'UPDATE saida SET cancelado = false, data_cancelamento = NULL WHERE id_nota = ?',
      [id]
    );

    await db.promise().commit();
    res.json({ message: 'Cancelamento de saída desfeito com sucesso!' });
  } catch (error) {
    await db.promise().rollback();
    console.error('Erro ao desfazer cancelamento de saída:', error);
    res.status(500).json({ error: 'Erro ao desfazer cancelamento de saída.' });
  }
});

// Rota padrão
app.get('/', (req, res) => {
  res.send('Backend funcionando!');
});

// Rota para verificar conexão com o banco de dados
app.get('/api/check-db', (req, res) => {
  db.ping((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err.message);
      return res.status(500).json({ connected: false, error: err.message });
    }
    res.json({ connected: true });
  });

});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
