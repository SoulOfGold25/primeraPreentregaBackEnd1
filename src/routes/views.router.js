import { Router } from "express";
import { passportCall, authorization } from '../utils.js';


const router = Router();



router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/register", (req, res) => {
    res.render("register");
});


// Perfil de User
router.get("/",
    passportCall('jwt'),
    (req, res) => {
        res.render("profile", {
            user: req.user //->Habilitar para JWT
        });
    });


// Perfil del ADMIN
router.get("/dashboard-admin",
    passportCall('jwt'),
    authorization("admin"),
    (req, res) => {
        res.render("admin", {
            user: req.user //->Habilitar para JWT
        });
    });


export default router