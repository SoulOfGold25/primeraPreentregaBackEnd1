import { Router } from 'express';
import passport from 'passport';
import userModel from '../dao/models/user.model.js';
import { isValidPassword, generateJWToken } from '../utils.js';
import UserDTO from "../dto/user.DTO.js";

const router = Router();

// Registrar usuario con Passport
router.post("/register",
  passport.authenticate('register', { failureRedirect: '/api/sessions/fail-register' }),
  async (req, res) => {
    console.log("✅ Registrando nuevo usuario");
    res.status(201).send({ status: "success", message: "Usuario creado con éxito." });
  }
);

router.get("/fail-register", (req, res) => {
  res.status(401).send({ error: "❌ Falló el registro" });
});

// Login y emisión de JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).populate("cart");
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    if (!isValidPassword(user, password)) {
      console.warn(`Credenciales inválidas para ${email}`);
      return res.status(401).send({ status: "error", error: "Credenciales inválidas" });
    }

    const tokenUser = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
      role: user.role,
      isAdmin: user.role === "admin",
      cart: user.cart
    };

    const access_token = generateJWToken(tokenUser);

    res.cookie("jwtCookieToken", access_token, {
      maxAge: 60000,
      httpOnly: true
    });

    res.send({ message: "Login exitoso" });

  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: "error", error: "Error interno del servidor" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwtCookieToken");
  res.redirect("/login"); // O a la vista principal si prefieres
});

// Ruta protegida con JWT: /current
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Usuario no autenticado" });
  }

  const safeUser = new UserDTO(req.user);
  res.status(200).json({
    success: true,
    user: safeUser
  });
});

// Ruta raíz opcional para testear
router.get("/", (req, res) => {
  res.send({
    message: "Rutas disponibles:",
    routes: [
      "POST /register",
      "POST /login",
      "GET /logout",
      "GET /current"
    ]
  });
});

router.post("/make-admin/:email", async (req, res) => {
    const { email } = req.params;
  
    try {
      const user = await userModel.findOneAndUpdate(
        { email },
        { role: "admin" },
        { new: true }
      );
  
      if (!user) return res.status(404).send({ message: "Usuario no encontrado" });
  
      res.send({
        message: "✅ Usuario actualizado a admin",
        user
      });
  
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  });
  

export default router;
