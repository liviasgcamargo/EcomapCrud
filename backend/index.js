import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "ecomap",
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("Hello!");
});

app.get("/ponto", (req, res) => {
  const q = "SELECT * FROM ponto";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/ponto", (req, res) => {
  const q = "INSERT INTO ponto (`pontoname`,`pontoid`) VALUES (?)";
  const values = [req.body.pontoname, req.body.pontoid];

  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.json("Ponto foi criado com sucesso");
  });
});

app.put("/ponto/:pontoid", (req, res) => {
  const pontoId = req.params.pontoid;
  const q = "UPDATE ponto SET `pontoname` = ?, `pontoid` = ? WHERE pontoid = ?";

  const values = [req.body.pontoname, req.body.pontoid];

  db.query(q, [...values, pontoId], (err, data) => {
    if (err) return res.json(err);
    return res.json("Ponto foi alterado com sucesso");
  });
});

app.delete("/ponto/:pontoid", (req, res) => {
  const pontoId = req.params.pontoid;
  const q = "DELETE FROM ponto WHERE pontoid = ?";

  db.query(q, [pontoId], (err, data) => {
    if (err) return res.json(err);
    return res.json("Ponto foi deletado com sucesso");
  });
});

app.listen(8000, () => {
  console.log("Connected to backend!");
});

app.get("/buscarPontos", (req, res) => {
  const { cep, distancia, tipo_material } = req.query;

  const q = `
        SELECT * FROM ponto 
        WHERE cep = ? 
        AND tipo_material = ?
    `;

  db.query(q, [cep, tipo_material], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
});
app.post("/cadastrarUsuario", (req, res) => {
  const {
    nome,
    tipo_usuario,
    cnpj,
    email,
    senha,
    telefone,
    compra_materiais,
    vende_materiais,
    materiais_aceitos, // Isso agora será uma string separada por vírgulas
    descricao,
    servico_retirada,
  } = req.body;

  const query = `
    INSERT INTO usuarios (nome, tipo_usuario, cnpj, email, senha, telefone, 
                          compra_materiais, vende_materiais, materiais_aceitos, 
                          descricao, servico_retirada)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

  const values = [
    nome,
    tipo_usuario,
    cnpj || null, // O CNPJ é opcional para pessoas físicas
    email,
    senha,
    telefone,
    compra_materiais || false,
    vende_materiais || false,
    materiais_aceitos || "", // Já vem como string separada por vírgulas
    descricao || "",
    servico_retirada,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erro ao cadastrar o usuário: ", err);
      return res.status(500).json({ error: "Erro ao cadastrar o usuário" });
    }
    return res.status(200).json({ message: "Usuário cadastrado com sucesso!" });
  });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    
    db.query(query, [email, senha], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        if (result.length > 0) {
            // Login bem-sucedido, retorna os dados do usuário
            const usuario = result[0];
            return res.status(200).json({ success: true, usuario }); // Retorna os dados do usuário logado
        } else {
            // Email ou senha incorretos
            return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
        }
    });
});
